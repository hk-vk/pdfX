import React, { useState, useCallback } from 'react';
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
  Grid
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
import { motion } from 'framer-motion';
import GlassmorphicContainer from './GlassmorphicContainer';
import * as pdfjs from 'pdfjs-dist';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// Create motion components
const MotionBox = motion(Box);
const MotionPaper = motion(Paper);

const PDFCompressor: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [quality, setQuality] = useState(0.7);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);
  const [success, setSuccess] = useState(false);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: useCallback(async (acceptedFiles: FileWithPath[]) => {
      if (acceptedFiles.length > 0) {
        const selectedFile = acceptedFiles[0];
        setFile(selectedFile);
        setOriginalSize(selectedFile.size);
        
        // Get page count
        try {
          const fileBuffer = await selectedFile.arrayBuffer();
          const pdf = await PDFDocument.load(fileBuffer);
          const count = pdf.getPageCount();
          setPageCount(count);
        } catch (error) {
          console.error('Error loading PDF:', error);
        }
      }
    }, []),
    maxFiles: 1,
    accept: {
      'application/pdf': ['.pdf']
    },
    onError: (error) => {
      console.error('Error uploading file:', error);
    }
  });

  const compressImage = (imageBlob: Blob, quality: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      new Compressor(imageBlob, {
        quality,
        success: (result) => resolve(result),
        error: (err) => reject(err),
        maxWidth: 1500, // Limit max width to reduce size
        maxHeight: 1500, // Limit max height to reduce size
        convertSize: 1000000, // Convert to JPEG if larger than ~1MB
        mimeType: 'image/jpeg',
      });
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

  const compressPDF = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);
    setSuccess(false);
    setCompressedSize(null);

    try {
      const fileBuffer = await file.arrayBuffer();
      
      // Extract all images from the PDF
      const { images, dims } = await extractImagesFromPDF(fileBuffer);
      
      // Compress each image
      const compressedImages: Blob[] = [];
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        // Use higher quality for smaller pages since they compress better
        const adjustedQuality = Math.min(quality + (0.3 / dims[i].width) * 1000, 0.95);
        const compressedImage = await compressImage(image, adjustedQuality);
        compressedImages.push(compressedImage);
        
        setProgress((i + 1) / images.length * 50); // First 50% of progress
      }
      
      // Create a new PDF with the compressed images
      const newPdf = await PDFDocument.create();
      
      for (let i = 0; i < compressedImages.length; i++) {
        const img = compressedImages[i];
        const imgArrayBuffer = await img.arrayBuffer();
        
        // Determine image type from the blob
        let embedFunc;
        if (img.type === 'image/jpeg' || img.type === 'image/jpg') {
          embedFunc = newPdf.embedJpg.bind(newPdf);
        } else if (img.type === 'image/png') {
          embedFunc = newPdf.embedPng.bind(newPdf);
        } else {
          // Default to PNG
          embedFunc = newPdf.embedPng.bind(newPdf);
        }
        
        const embeddedImage = await embedFunc(imgArrayBuffer);
        
        // Get original dimensions
        const { width, height } = dims[i];
        
        // Add a page with the same dimensions as the original
        const page = newPdf.addPage([width, height]);
        
        // Calculate dimensions to maintain aspect ratio
        const imgDims = embeddedImage.scale(1);
        
        // Draw the image centered on the page
        page.drawImage(embeddedImage, {
          x: 0,
          y: 0,
          width: width,
          height: height,
        });
        
        setProgress(50 + ((i + 1) / compressedImages.length * 50)); // Last 50% of progress
      }
      
      // Save the compressed PDF
      const compressedPdfBytes = await newPdf.save({
        useObjectStreams: true,
        addDefaultPage: false,
        objectsPerTick: 100,
      });
      
      const blob = new Blob([compressedPdfBytes], { type: 'application/pdf' });
      
      setCompressedSize(blob.size);
      
      if (blob.size >= originalSize) {
        // If compression didn't reduce size, use compression option in pdf-lib
        const pdfDoc = await PDFDocument.load(fileBuffer);
        const smallerPdfBytes = await pdfDoc.save({
          useObjectStreams: true,
          addDefaultPage: false,
          objectsPerTick: 100,
        });
        const smallerBlob = new Blob([smallerPdfBytes], { type: 'application/pdf' });
        
        if (smallerBlob.size < originalSize) {
          saveAs(smallerBlob, `${file.name.replace('.pdf', '')}_compressed.pdf`);
          setCompressedSize(smallerBlob.size);
        } else {
          // If no compression method worked, just return the original
          saveAs(new Blob([fileBuffer], { type: 'application/pdf' }), 
            `${file.name.replace('.pdf', '')}_compressed.pdf`);
          setCompressedSize(originalSize);
        }
      } else {
        saveAs(blob, `${file.name.replace('.pdf', '')}_compressed.pdf`);
      }
      
      setSuccess(true);
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 5000);
    } catch (error) {
      console.error('Error compressing PDF:', error);
      // Fallback to simpler compression if advanced method fails
      try {
        const fileBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(fileBuffer);
        
        // Use basic PDF compression options
        const compressedPdfBytes = await pdfDoc.save({
          useObjectStreams: true,
          addDefaultPage: false,
          objectsPerTick: 100,
        });
        
        const blob = new Blob([compressedPdfBytes], { type: 'application/pdf' });
        setCompressedSize(blob.size);
        saveAs(blob, `${file.name.replace('.pdf', '')}_compressed.pdf`);
        
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
        }, 5000);
      } catch (fallbackError) {
        console.error('Fallback compression failed:', fallbackError);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setOriginalSize(0);
    setCompressedSize(null);
    setPageCount(null);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const calculateReduction = (): string => {
    if (!compressedSize || !originalSize) return '0%';
    
    const reduction = ((originalSize - compressedSize) / originalSize) * 100;
    return `${reduction.toFixed(1)}%`;
  };

  return (
    <Box sx={{ p: 3 }}>
      <GlassmorphicContainer 
        sx={{ 
          p: 3, 
          mb: 3,
          borderRadius: 2,
        }}
        blurStrength={10}
        hoverEffect
        motionProps={{
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.4 }
        }}
      >
        <Typography variant="h6" component="h2" gutterBottom>
          Upload PDF File
        </Typography>
        
        <Box
          {...getRootProps()}
          sx={{
            border: '2px dashed',
            borderColor: theme => isDragActive 
              ? theme.palette.primary.main 
              : alpha(theme.palette.divider, 0.7),
            borderRadius: 2,
            p: 3,
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            bgcolor: theme => isDragActive 
              ? alpha(theme.palette.primary.main, 0.05) 
              : 'transparent',
            '&:hover': {
              borderColor: theme => theme.palette.primary.main,
              bgcolor: theme => alpha(theme.palette.primary.main, 0.05)
            }
          }}
        >
          <input {...getInputProps()} />
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <FileUploadIcon 
              sx={{ 
                fontSize: 40, 
                mb: 1,
                color: theme => isDragActive 
                  ? theme.palette.primary.main 
                  : alpha(theme.palette.text.primary, 0.7)
              }} 
            />
            <Typography variant="body1" gutterBottom>
              Drag & drop a PDF file here, or click to select
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Only one PDF file can be processed at a time
            </Typography>
          </motion.div>
        </Box>
      </GlassmorphicContainer>

      {file && (
        <GlassmorphicContainer 
          sx={{ 
            p: 3, 
            mb: 3,
            borderRadius: 2,
          }}
          blurStrength={10}
          motionProps={{
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.4, delay: 0.2 }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <DescriptionIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" component="h2">
              {file.name}
            </Typography>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium' }}>
            Compression Level
          </Typography>
          
          <Box sx={{ px: 2, pt: 1, pb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="textSecondary">Low (Better Quality)</Typography>
              <Typography variant="body2" color="textSecondary">High (Smaller Size)</Typography>
            </Box>
            <Slider
              value={quality}
              onChange={(_, newValue) => setQuality(newValue as number)}
              aria-labelledby="compression-slider"
              valueLabelDisplay="auto"
              step={0.1}
              marks
              min={0.1}
              max={1}
              sx={{ 
                color: 'primary.main',
                '& .MuiSlider-thumb': {
                  '&:hover, &.Mui-focusVisible': {
                    boxShadow: theme => `0px 0px 0px 8px ${alpha(theme.palette.primary.main, 0.16)}`
                  }
                }
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
              <Typography variant="body1" fontWeight="medium">
                Level: {Math.round(quality * 100)}%
              </Typography>
            </Box>
          </Box>
          
          {compressedSize && (
            <>
              <Divider sx={{ my: 2 }} />
              <Box>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium' }}>
                  Compression Results
                </Typography>
                <Grid container spacing={3} sx={{ mt: 1 }}>
                  <Grid item xs={6} md={3}>
                    <Typography variant="caption" color="text.secondary">
                      Original Size
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {formatFileSize(originalSize)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography variant="caption" color="text.secondary">
                      Compressed Size
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {formatFileSize(compressedSize)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography variant="caption" color="text.secondary">
                      Size Reduction
                    </Typography>
                    <Typography variant="body1" fontWeight="medium" color="success.main">
                      {calculateReduction()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography variant="caption" color="text.secondary">
                      Quality Setting
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {Math.round(quality * 100)}%
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </>
          )}
        </GlassmorphicContainer>
      )}

      {file && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <Button
            variant="contained"
            color="primary"
            startIcon={<CompressIcon />}
            onClick={compressPDF}
            disabled={isProcessing}
            fullWidth
            size="large"
            sx={{ 
              py: 1.5,
              borderRadius: 2,
              boxShadow: theme => theme.shadows[4],
              background: theme => `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
              transition: 'all 0.3s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: theme => theme.shadows[8],
              }
            }}
          >
            Compress PDF
          </Button>
        </motion.div>
      )}

      {isProcessing && (
        <Box sx={{ width: '100%', mt: 4 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 1
          }}>
            <Typography variant="body2" color="text.secondary">
              Compressing PDF...
            </Typography>
            <Typography variant="body2" color="primary" fontWeight={600}>
              {Math.round(progress)}%
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ 
              height: 8, 
              borderRadius: 4,
            }}
          />
        </Box>
      )}

      <Fade in={success}>
        <Alert 
          icon={<CheckCircleIcon fontSize="inherit" />} 
          severity="success"
          sx={{ 
            mt: 3,
            borderRadius: 2,
            boxShadow: theme => `0 4px 12px ${alpha(theme.palette.success.main, 0.2)}`,
          }}
        >
          PDF successfully compressed! Your download should start automatically.
        </Alert>
      </Fade>
    </Box>
  );
};

export default PDFCompressor; 