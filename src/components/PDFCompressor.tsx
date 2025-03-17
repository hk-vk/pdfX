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
  alpha,
  Divider,
  Alert,
  Fade,
  Grid,
  Stack,
  IconButton,
  Modal
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
import * as pdfjs from 'pdfjs-dist';
import { Document, Page } from 'react-pdf';

// Create motion components
const MotionBox = motion(Box);
const MotionPaper = motion(Paper);

interface FileWithProgress {
  file: File;
  progress: number;
  status: 'waiting' | 'processing' | 'completed' | 'error';
  compressedUrl?: string;
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
    // Set the worker source with a try-catch to handle potential errors
    try {
      const workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
      pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
    } catch (error) {
      console.error('Error initializing PDF.js worker:', error);
    }
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles
      .filter(file => file.type === 'application/pdf')
      .map(file => ({
        file,
        progress: 0,
        status: 'waiting' as const,
      }));
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: true,
  });

  const compressImage = async (imageData: ImageData, quality: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      canvas.width = imageData.width;
      canvas.height = imageData.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      // Create an ImageData object
      ctx.putImageData(imageData, 0, 0);
      
      // Convert to blob with specified quality
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to compress image'));
        },
        'image/jpeg',
        quality / 100
      );
    });
  };

  const extractImagesFromPDF = async (pdfBuffer: ArrayBuffer): Promise<{ images: Blob[], dims: { width: number, height: number }[] }> => {
    const images: Blob[] = [];
    const dims: { width: number, height: number }[] = [];
    
    const pdf = await pdfjs.getDocument({ data: pdfBuffer }).promise;
    const totalPages = pdf.numPages;
    
    for (let i = 1; i <= totalPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 1.0 });
      
      // Create canvas
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) continue;
      
      // Set dimensions to match the page
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      dims.push({ width: viewport.width, height: viewport.height });
      
      // Render the page to the canvas
      await page.render({
        canvasContext: context,
        viewport
      }).promise;
      
      // Get the image from the canvas
      const imgBlob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else resolve(new Blob()); // Empty blob as fallback
        }, 'image/png');
      });
      
      images.push(imgBlob);
    }
    
    return { images, dims };
  };

  const compressFile = async (fileWithProgress: FileWithProgress) => {
    try {
      const { file } = fileWithProgress;
      setFiles(prev => prev.map(f => 
        f.file === file ? { ...f, status: 'processing' } : f
      ));

      // Load the PDF document
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
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
        const loadingTask = pdfjs.getDocument(arrayBuffer);
        const pdfJsDoc = await loadingTask.promise;
        const pdfJsPage = await pdfJsDoc.getPage(i + 1);
        await pdfJsPage.render({
          canvasContext: context,
          viewport: pdfJsPage.getViewport({ scale }),
        }).promise;

        // Get the image data and compress it
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const compressedBlob = await compressImage(imageData, quality);
        const compressedArrayBuffer = await compressedBlob.arrayBuffer();

        // Embed the compressed image back into the PDF
        const compressedImage = await pdfDoc.embedJpg(compressedArrayBuffer);
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
        } : f
      ));
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

  const processFiles = async () => {
    setIsProcessing(true);
    try {
      const waitingFiles = files.filter(f => f.status === 'waiting');
      await Promise.all(waitingFiles.map(compressFile));
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
          >
            {isProcessing ? 'Compressing...' : 'Compress Files'}
          </Button>
        )}
      </Stack>

      <Modal open={Boolean(previewFile)} onClose={closePreview}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          maxWidth: '90%',
          maxHeight: '90%',
          overflowY: 'auto',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
        }}>
          {previewFile && (
            <Document file={previewFile.compressedUrl}>
              <Page pageNumber={1} />
            </Document>
          )}
        </Box>
      </Modal>
    </GlassmorphicContainer>
  );
};

export default PDFCompressor; 