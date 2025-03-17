import React, { useState, useCallback, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import { 
  Button, 
  Box, 
  Typography, 
  LinearProgress, 
  Paper, 
  Slider, 
  useTheme,
  Divider,
  Alert,
  Fade,
  Grid,
  Stack,
  IconButton,
} from '@mui/material';
import { saveAs } from 'file-saver';
import Compressor from 'compressorjs';
import { 
  FileUpload as FileUploadIcon,
  CompressOutlined as CompressIcon,
  Description as DescriptionIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  CloudUpload as CloudUploadIcon
} from '@mui/icons-material';
import { useDropzone, FileWithPath } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import GlassmorphicContainer from './GlassmorphicContainer';
import * as pdfjs from "pdfjs-dist";
import PDFViewer from './PDFViewer';
import { compressFile as compactorCompressFile } from 'compactor';

// Create motion components
const MotionBox = motion(Box);
const MotionPaper = motion(Paper);

interface FileWithProgress {
  file: File;
  progress: number;
  status: 'waiting' | 'processing' | 'completed' | 'error';
  compressedUrl?: string;
  originalSize?: number;
  compressedSize?: number;
  compressionRatio?: number;
  error?: string;
}

const PDFCompressor: React.FC = () => {
  const [files, setFiles] = useState<FileWithProgress[]>([]);
  const [quality, setQuality] = useState<number>(70);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileWithProgress | null>(null);
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  // Initialize PDF.js worker
  useEffect(() => {
    // Set the worker source to a local file that will be copied by vite-plugin-static-copy
    pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles
      .filter(file => file.type === 'application/pdf')
      .map(file => ({
        file,
        progress: 0,
        status: 'waiting' as const,
        originalSize: file.size,
      }));
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: true,
  });

  const compressFile = async (fileWithProgress: FileWithProgress) => {
    try {
      const { file } = fileWithProgress;
      setFiles(prev => prev.map(f => 
        f.file === file ? { ...f, status: 'processing' } : f
      ));

      // Read the file as an ArrayBuffer
      const fileArrayBuffer = await file.arrayBuffer();
      
      // Try using compactor library first
      try {
        const fileData = {
          bytes: await blobToBase64(new Blob([fileArrayBuffer])),
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type
        };
        
        // Set options for compression
        const options = {
          pageScale: 1.0,
          pageQuality: quality / 100
        };
        
        // Progress update function
        const updateProgress = (progress: number) => {
          setFiles(prev => prev.map(f =>
            f.file === file ? { ...f, progress: Math.round(progress * 100) } : f
          ));
        };
        
        // Process the file with compactor
        await new Promise<void>((resolve, reject) => {
          compactorCompressFile(
            fileData, 
            (result) => {
              if (result) {
                // Convert base64 back to Blob
                const binaryString = window.atob(result.bytes);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                  bytes[i] = binaryString.charCodeAt(i);
                }
                const compressedBlob = new Blob([bytes.buffer], { type: 'application/pdf' });
                const compressedUrl = URL.createObjectURL(compressedBlob);
                
                // Update file status
                setFiles(prev => prev.map(f =>
                  f.file === file ? {
                    ...f,
                    status: 'completed',
                    progress: 100,
                    compressedUrl,
                    compressedSize: result.fileSize,
                    compressionRatio: result.fileSize / file.size
                  } : f
                ));
                resolve();
              } else {
                reject(new Error('Compression failed'));
              }
            }, 
            options
          );
          
          // Simulate progress updates while compactor processes the file
          let progress = 0;
          const interval = setInterval(() => {
            progress += 0.05;
            if (progress >= 0.95) {
              clearInterval(interval);
            } else {
              updateProgress(progress);
            }
          }, 100);
        });
      } catch (compactorError) {
        console.warn('Compactor compression failed, falling back to custom compression:', compactorError);
        
        // Fallback to custom compression method
        // Load the PDF document
        const pdfDoc = await PDFDocument.load(fileArrayBuffer);
        const pages = pdfDoc.getPages();

        // Process each page
        for (let i = 0; i < pages.length; i++) {
          const page = pages[i];
          const { width, height } = page.getSize();

          // Create a temporary canvas to render the page
          const canvas = document.createElement('canvas');
          const scale = 2; // Increase scale for better quality
          canvas.width = width * scale;
          canvas.height = height * scale;
          const context = canvas.getContext('2d');
          if (!context) throw new Error('Could not get canvas context');

          // Load and render the page using PDF.js
          const loadingTask = pdfjs.getDocument(fileArrayBuffer);
          const pdfJsDoc = await loadingTask.promise;
          const pdfJsPage = await pdfJsDoc.getPage(i + 1);
          await pdfJsPage.render({
            canvasContext: context,
            viewport: pdfJsPage.getViewport({ scale }),
          }).promise;

          // Compress the page as an image
          const compressedDataUrl = await new Promise<string>((resolve, reject) => {
            // Convert the canvas to a Blob first
            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  reject(new Error('Failed to create blob from canvas'));
                  return;
                }
                
                new Compressor(blob, {
                  quality: quality / 100,
                  success(result: Blob) {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(result);
                  },
                  error(err: Error) {
                    reject(err);
                  }
                });
              },
              'image/jpeg'
            );
          });

          // Convert data URL to ArrayBuffer
          const base64Data = compressedDataUrl.split(',')[1];
          const binaryString = window.atob(base64Data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }

          // Embed the compressed image back into the PDF
          const compressedImage = await pdfDoc.embedJpg(bytes);
          page.drawImage(compressedImage, {
            x: 0,
            y: 0,
            width: page.getWidth(),
            height: page.getHeight(),
          });

          // Update progress
          const progress = ((i + 1) / pages.length) * 100;
          setFiles(prev => prev.map(f =>
            f.file === file ? { ...f, progress } : f
          ));
        }

        // Save the compressed PDF
        const compressedPdfBytes = await pdfDoc.save();
        const compressedBlob = new Blob([compressedPdfBytes], { type: 'application/pdf' });
        const compressedUrl = URL.createObjectURL(compressedBlob);

        setFiles(prev => prev.map(f =>
          f.file === file ? {
            ...f,
            status: 'completed',
            progress: 100,
            compressedUrl,
            compressedSize: compressedBlob.size,
            compressionRatio: compressedBlob.size / file.size
          } : f
        ));
      }
    } catch (error) {
      console.error('Error compressing PDF:', error);
      setFiles(prev => prev.map(f =>
        f.file === fileWithProgress.file ? {
          ...f,
          status: 'error',
          error: error instanceof Error ? error.message : 'Failed to compress PDF',
        } : f
      ));
    }
  };

  // Helper function to convert Blob to base64
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const base64 = dataUrl.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const processFiles = async () => {
    setIsProcessing(true);
    try {
      const waitingFiles = files.filter(f => f.status === 'waiting');
      // Process files one by one to avoid memory issues
      for (const file of waitingFiles) {
        await compressFile(file);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const removeFile = (fileToRemove: File) => {
    setFiles(prev => {
      const newFiles = prev.filter(f => f.file !== fileToRemove);
      // Clean up URLs to prevent memory leaks
      const fileToRemoveData = prev.find(f => f.file === fileToRemove);
      if (fileToRemoveData?.compressedUrl) {
        URL.revokeObjectURL(fileToRemoveData.compressedUrl);
      }
      return newFiles;
    });
  };

  const downloadFile = (fileWithProgress: FileWithProgress) => {
    if (fileWithProgress.compressedUrl) {
      const link = document.createElement('a');
      link.href = fileWithProgress.compressedUrl;
      link.download = `compressed_${fileWithProgress.file.name}`;
      link.click();
    }
  };

  const openPreview = (file: FileWithProgress) => {
    setPreviewFile(file);
  };

  const closePreview = () => {
    setPreviewFile(null);
  };

  // Helper function to format file size
  const formatFileSize = (sizeInBytes: number | undefined): string => {
    if (sizeInBytes === undefined) return '';
    if (sizeInBytes < 1024) return `${sizeInBytes} B`;
    if (sizeInBytes < 1024 * 1024) return `${(sizeInBytes / 1024).toFixed(1)} KB`;
    return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <GlassmorphicContainer sx={{ p: 3, borderRadius: 2 }}>
      <Stack spacing={3}>
        <Typography variant="h5" gutterBottom>
          Compress PDF Files
        </Typography>

        <Box {...getRootProps()} sx={{ cursor: 'pointer' }}>
          <GlassmorphicContainer
            sx={{
              p: 4,
              borderRadius: 2,
              textAlign: 'center',
              border: '2px dashed',
              borderColor: theme => isDragActive ? theme.palette.primary.main : 'inherit',
            }}
          >
            <input {...getInputProps()} />
            <CloudUploadIcon sx={{ fontSize: 48, mb: 2, color: 'primary.main' }} />
            <Typography>
              {isDragActive
                ? 'Drop your PDF files here...'
                : 'Drag & drop PDF files here, or click to select files'}
            </Typography>
          </GlassmorphicContainer>
        </Box>

        <Box>
          <Typography gutterBottom>Compression Quality: {quality}%</Typography>
          <Slider
            value={quality}
            onChange={(_, value) => setQuality(value as number)}
            min={30}
            max={100}
            valueLabelDisplay="auto"
          />
          <Typography variant="caption" color="text.secondary">
            Lower quality = smaller file size, higher quality = better image quality
          </Typography>
        </Box>

        <AnimatePresence>
          {files.map((fileWithProgress) => (
            <motion.div
              key={fileWithProgress.file.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
            >
              <GlassmorphicContainer
                sx={{
                  p: 2,
                  mb: 1,
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <DescriptionIcon color="primary" />
                <Box flex={1}>
                  <Typography variant="body2" noWrap>
                    {fileWithProgress.file.name}
                  </Typography>
                  
                  {fileWithProgress.status === 'processing' && (
                    <LinearProgress
                      variant="determinate"
                      value={fileWithProgress.progress}
                      sx={{ mt: 1 }}
                    />
                  )}
                  
                  {fileWithProgress.status === 'completed' && (
                    <Stack direction="row" spacing={2} mt={1}>
                      <Typography variant="caption" color="text.secondary">
                        Original: {formatFileSize(fileWithProgress.originalSize)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Compressed: {formatFileSize(fileWithProgress.compressedSize)}
                      </Typography>
                      {fileWithProgress.compressionRatio && (
                        <Typography 
                          variant="caption" 
                          color={fileWithProgress.compressionRatio < 1 ? 'success.main' : 'warning.main'}
                        >
                          {fileWithProgress.compressionRatio < 1 
                            ? `Saved ${Math.round((1 - fileWithProgress.compressionRatio) * 100)}%` 
                            : 'No size reduction'}
                        </Typography>
                      )}
                    </Stack>
                  )}
                  
                  {fileWithProgress.status === 'error' && (
                    <Typography color="error" variant="caption">
                      {fileWithProgress.error}
                    </Typography>
                  )}
                </Box>

                <Stack direction="row" spacing={1}>
                  {fileWithProgress.status === 'completed' && (
                    <>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => openPreview(fileWithProgress)}
                      >
                        Preview
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => downloadFile(fileWithProgress)}
                      >
                        Download
                      </Button>
                    </>
                  )}
                  <IconButton
                    size="small"
                    onClick={() => removeFile(fileWithProgress.file)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              </GlassmorphicContainer>
            </motion.div>
          ))}
        </AnimatePresence>

        {files.length > 0 && (
          <Button
            variant="contained"
            onClick={processFiles}
            disabled={isProcessing || !files.some(f => f.status === 'waiting')}
            startIcon={<CompressIcon />}
          >
            {isProcessing ? 'Compressing...' : 'Compress Files'}
          </Button>
        )}
      </Stack>

      {previewFile && previewFile.compressedUrl && (
        <PDFViewer
          fileUrl={previewFile.compressedUrl}
          fileName={`compressed_${previewFile.file.name}`}
          open={Boolean(previewFile)}
          onClose={closePreview}
          onDownload={() => downloadFile(previewFile)}
        />
      )}
    </GlassmorphicContainer>
  );
};

export default PDFCompressor; 