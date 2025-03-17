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
  Alert,
  Fade,
  Grid,
  Stack,
  IconButton,
  Snackbar,
  alpha,
} from '@mui/material';
import { saveAs } from 'file-saver';
import Compressor from 'compressorjs';
import { 
  CompressOutlined as CompressIcon,
  Description as DescriptionIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  CloudUpload as CloudUploadIcon,
  ErrorOutline as ErrorOutlineIcon
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import GlassmorphicContainer from './GlassmorphicContainer';
import * as pdfjs from "pdfjs-dist";
import PDFViewer from './PDFViewer';
import PageHeader from './PageHeader';

// Create motion components
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
  const [error, setError] = useState<string | null>(null);

  // Initialize PDF.js worker
  useEffect(() => {
    // Set the worker source to a CDN URL to avoid loading issues
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
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

  const { getRootProps, getInputProps } = useDropzone({
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
    } catch (error) {
      console.error('Error compressing file:', error);
      setFiles(prev => prev.map(f =>
        f.file === fileWithProgress.file ? {
          ...f,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        } : f
      ));
    }
  };

  const processFiles = async () => {
    setIsProcessing(true);
    const waitingFiles = files.filter(f => f.status === 'waiting');
    
    for (const file of waitingFiles) {
      await compressFile(file);
    }
    
    setIsProcessing(false);
  };

  const removeFile = (fileToRemove: File) => {
    setFiles(prev => {
      const updatedFiles = prev.filter(f => f.file !== fileToRemove);
      // If the preview file is being removed, close the preview
      if (previewFile?.file === fileToRemove) {
        setPreviewFile(null);
      }
      return updatedFiles;
    });
  };

  const downloadFile = (fileWithProgress: FileWithProgress) => {
    if (fileWithProgress.compressedUrl && fileWithProgress.file) {
      const fileName = fileWithProgress.file.name.replace('.pdf', '_compressed.pdf');
      saveAs(fileWithProgress.compressedUrl, fileName);
    }
  };

  const openPreview = (file: FileWithProgress) => {
    setPreviewFile(file);
  };

  const closePreview = () => {
    setPreviewFile(null);
  };

  // Format file size to human-readable format
  const formatFileSize = (sizeInBytes: number | undefined): string => {
    if (sizeInBytes === undefined) return 'Unknown';
    
    if (sizeInBytes < 1024) {
      return `${sizeInBytes} B`;
    } else if (sizeInBytes < 1024 * 1024) {
      return `${(sizeInBytes / 1024).toFixed(1)} KB`;
    } else {
      return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
    }
  };

  // Calculate total compression ratio
  const getTotalCompressionStats = () => {
    const completedFiles = files.filter(f => f.status === 'completed');
    if (completedFiles.length === 0) return null;
    
    const totalOriginalSize = completedFiles.reduce((sum, f) => sum + (f.originalSize || 0), 0);
    const totalCompressedSize = completedFiles.reduce((sum, f) => sum + (f.compressedSize || 0), 0);
    const compressionRatio = totalCompressedSize / totalOriginalSize;
    
    return {
      originalSize: totalOriginalSize,
      compressedSize: totalCompressedSize,
      compressionRatio,
      savedSize: totalOriginalSize - totalCompressedSize,
      percentage: (1 - compressionRatio) * 100
    };
  };

  const compressionStats = getTotalCompressionStats();

  return (
    <Box>
      <PageHeader
        title="Compress PDF"
        description="Reduce the file size of your PDF documents while maintaining quality. Perfect for sharing or uploading large PDF files."
        icon={<CompressIcon sx={{ fontSize: 32 }} />}
      />

      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          backgroundColor: theme => theme.palette.mode === 'dark'
            ? 'rgba(31, 31, 31, 0.8)'
            : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)'
        }}
      >
        <Box
          {...getRootProps()}
          sx={{
            border: '2px dashed',
            borderColor: 'primary.main',
            borderRadius: 2,
            p: 4,
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            backgroundColor: theme => alpha(theme.palette.primary.main, 0.05),
            '&:hover': {
              backgroundColor: theme => alpha(theme.palette.primary.main, 0.08),
              borderColor: 'primary.dark'
            }
          }}
        >
          <input {...getInputProps()} />
          <CloudUploadIcon 
            sx={{ 
              fontSize: 48, 
              color: 'primary.main',
              mb: 2
            }} 
          />
          <Typography variant="h6" gutterBottom sx={{ fontFamily: "'Montserrat', sans-serif" }}>
            {files.length > 0 ? 'Drop more PDFs here' : 'Drop PDFs here'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            or click to select files
          </Typography>
        </Box>

        <AnimatePresence>
          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Box sx={{ mt: 4 }}>
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                      Selected Files
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {files.map(f => f.file.name).join(', ')}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                      Compression Level
                    </Typography>
                    <Box sx={{ px: 2 }}>
                      <Slider
                        value={quality}
                        onChange={(_, newValue) => setQuality(newValue as number)}
                        min={30}
                        max={100}
                        valueLabelDisplay="auto"
                        valueLabelFormat={value => `${value}%`}
                      />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption" color="text.secondary">Maximum Compression</Typography>
                        <Typography variant="caption" color="text.secondary">Best Quality</Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="contained"
                      onClick={processFiles}
                      disabled={isProcessing || files.every(f => f.status !== 'waiting')}
                      startIcon={<CompressIcon />}
                      sx={{
                        background: theme => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                        color: 'white',
                        '&:hover': {
                          background: theme => `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`
                        }
                      }}
                    >
                      {isProcessing ? 'Compressing...' : 'Compress All'}
                    </Button>
                  </Box>
                </Stack>
              </Box>

              {isProcessing && (
                <Box sx={{ mt: 4 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1
                  }}>
                    <Typography variant="body2" color="text.secondary">
                      Compressing PDFs...
                    </Typography>
                    <Typography variant="body2" color="primary" fontWeight={500}>
                      {Math.round(files.reduce((sum, f) => sum + f.progress, 0) / files.length)}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={files.reduce((sum, f) => sum + f.progress, 0) / files.length} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                    }}
                  />
                </Box>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Paper>

      {files.length > 0 && (
        <GlassmorphicContainer sx={{ mb: 4 }}>
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Files ({files.length})
              </Typography>
            </Box>
            
            <Stack spacing={2}>
              <AnimatePresence>
                {files.map(({ file, progress, status, compressedUrl, originalSize, compressedSize, compressionRatio, error }) => (
                  <MotionPaper
                    key={file.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.3 }}
                    elevation={1}
                    sx={{ p: 2, borderRadius: 2 }}
                  >
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <DescriptionIcon sx={{ mr: 1.5, color: 'primary.main' }} />
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="subtitle1" noWrap sx={{ fontWeight: 500 }}>
                              {file.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" noWrap>
                              Original: {formatFileSize(originalSize)}
                              {status === 'completed' && compressedSize && (
                                <>
                                  {' • '}Compressed: {formatFileSize(compressedSize)}
                                  {' • '}Saved: {formatFileSize(originalSize ? originalSize - compressedSize : 0)}
                                  {' • '}Reduction: {compressionRatio ? `${Math.round((1 - compressionRatio) * 100)}%` : 'N/A'}
                                </>
                              )}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                          {status === 'waiting' && (
                            <Typography variant="body2" color="text.secondary">
                              Waiting
                            </Typography>
                          )}
                          
                          {status === 'processing' && (
                            <Box sx={{ flexGrow: 1, mr: 1, maxWidth: 100 }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={progress} 
                                sx={{ 
                                  height: 8, 
                                  borderRadius: 4,
                                  backgroundColor: theme.palette.mode === 'dark' 
                                    ? 'rgba(255, 255, 255, 0.1)' 
                                    : 'rgba(0, 0, 0, 0.05)',
                                }} 
                              />
                            </Box>
                          )}
                          
                          {status === 'error' && (
                            <Typography variant="body2" color="error">
                              Error: {error}
                            </Typography>
                          )}
                          
                          {status === 'completed' && (
                            <>
                              <IconButton 
                                color="primary" 
                                onClick={() => openPreview({ file, progress, status, compressedUrl, originalSize, compressedSize, compressionRatio })}
                                size="small"
                                sx={{ 
                                  bgcolor: theme.palette.mode === 'dark' 
                                    ? 'rgba(129, 140, 248, 0.1)' 
                                    : 'rgba(79, 70, 229, 0.05)',
                                  '&:hover': {
                                    bgcolor: theme.palette.mode === 'dark' 
                                      ? 'rgba(129, 140, 248, 0.2)' 
                                      : 'rgba(79, 70, 229, 0.1)',
                                  }
                                }}
                              >
                                <InfoIcon fontSize="small" />
                              </IconButton>
                              
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={() => downloadFile({ file, progress, status, compressedUrl, originalSize, compressedSize, compressionRatio })}
                                startIcon={<CheckCircleIcon />}
                              >
                                Download
                              </Button>
                            </>
                          )}
                          
                          <IconButton 
                            color="error" 
                            onClick={() => removeFile(file)}
                            size="small"
                            sx={{ 
                              bgcolor: theme.palette.mode === 'dark' 
                                ? 'rgba(239, 68, 68, 0.1)' 
                                : 'rgba(239, 68, 68, 0.05)',
                              '&:hover': {
                                bgcolor: theme.palette.mode === 'dark' 
                                  ? 'rgba(239, 68, 68, 0.2)' 
                                  : 'rgba(239, 68, 68, 0.1)',
                              }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Grid>
                      
                      {status === 'processing' && (
                        <Grid item xs={12}>
                          <Box sx={{ width: '100%', mt: 1 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={progress} 
                              sx={{ 
                                height: 6, 
                                borderRadius: 3,
                                backgroundColor: theme.palette.mode === 'dark' 
                                  ? 'rgba(255, 255, 255, 0.1)' 
                                  : 'rgba(0, 0, 0, 0.05)',
                              }} 
                            />
                          </Box>
                        </Grid>
                      )}
                    </Grid>
                  </MotionPaper>
                ))}
              </AnimatePresence>
            </Stack>
          </Box>
        </GlassmorphicContainer>
      )}
      
      {compressionStats && (
        <Fade in={true}>
          <Box>
            <GlassmorphicContainer sx={{ mb: 4 }}>
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Compression Summary
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Original Size
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        {formatFileSize(compressionStats.originalSize)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Compressed Size
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        {formatFileSize(compressionStats.compressedSize)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Space Saved
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 600, color: 'success.main' }}>
                        {formatFileSize(compressionStats.savedSize)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Reduction
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 600, color: 'success.main' }}>
                        {compressionStats.percentage.toFixed(1)}%
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </GlassmorphicContainer>
          </Box>
        </Fade>
      )}
      
      {previewFile && previewFile.compressedUrl && (
        <PDFViewer 
          fileUrl={previewFile.compressedUrl} 
          fileName={previewFile.file.name}
          open={Boolean(previewFile)}
          onClose={closePreview}
          onDownload={() => downloadFile(previewFile)}
        />
      )}

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setError(null)} 
          severity="error" 
          sx={{ width: '100%' }}
          icon={<ErrorOutlineIcon />}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PDFCompressor; 