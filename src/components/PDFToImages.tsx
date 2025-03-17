import React, { useState, useCallback, useEffect, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Slider,
  Alert,
  Snackbar,
  useTheme,
  alpha,
  Stack,
  LinearProgress,
  Grid,
  Card,
  CardMedia,
  CardActions,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  Image as ImageIcon,
  FileUpload as FileUploadIcon,
  Download as DownloadIcon,
  ErrorOutline as ErrorOutlineIcon,
  Delete as DeleteIcon,
  ZoomIn as ZoomInIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import PageHeader from './PageHeader';

// Define PDF.js types
declare global {
  interface Window {
    pdfjsLib: any;
  }
}

interface ImagePreview {
  url: string;
  pageNumber: number;
  blob: Blob;
}

const PDFToImages: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [quality, setQuality] = useState<number>(80);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pdfJsLoaded, setPdfJsLoaded] = useState(false);
  const theme = useTheme();
  const pdfJsScriptRef = useRef<HTMLScriptElement | null>(null);
  const pdfJsWorkerScriptRef = useRef<HTMLScriptElement | null>(null);

  // Load PDF.js from CDN
  useEffect(() => {
    if (!pdfJsScriptRef.current) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js';
      script.async = true;
      script.onload = () => {
        // Load worker after main library is loaded
        const workerScript = document.createElement('script');
        workerScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
        workerScript.async = true;
        workerScript.onload = () => {
          // Set worker source
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
          setPdfJsLoaded(true);
        };
        document.body.appendChild(workerScript);
        pdfJsWorkerScriptRef.current = workerScript;
      };
      document.body.appendChild(script);
      pdfJsScriptRef.current = script;
    }

    // Cleanup on unmount
    return () => {
      if (pdfJsScriptRef.current && document.body.contains(pdfJsScriptRef.current)) {
        document.body.removeChild(pdfJsScriptRef.current);
      }
      if (pdfJsWorkerScriptRef.current && document.body.contains(pdfJsWorkerScriptRef.current)) {
        document.body.removeChild(pdfJsWorkerScriptRef.current);
      }
    };
  }, []);

  // Cleanup function to revoke object URLs
  const cleanupImages = useCallback(() => {
    images.forEach(image => {
      URL.revokeObjectURL(image.url);
    });
  }, [images]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupImages();
    };
  }, [cleanupImages]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      await PDFDocument.load(arrayBuffer); // Validate PDF
      setFile(file);
      cleanupImages(); // Cleanup previous images
      setImages([]);
    } catch (error) {
      setError('Invalid PDF file. Please try another file.');
    }
  }, [cleanupImages]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    multiple: false
  });

  const handleQualityChange = (event: Event, newValue: number | number[]) => {
    setQuality(newValue as number);
  };

  const renderPDFPageToCanvas = async (arrayBuffer: ArrayBuffer, pageNumber: number, scale: number = 2.0): Promise<HTMLCanvasElement> => {
    if (!window.pdfjsLib) {
      throw new Error('PDF.js library not loaded');
    }

    try {
      // Load the PDF document
      const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;

      // Get the page
      const page = await pdf.getPage(pageNumber);
      
      // Set scale for better quality
      const viewport = page.getViewport({ scale });
      
      // Create a canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }
      
      // Set canvas dimensions
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      
      // Render the PDF page to the canvas
      const renderContext = {
        canvasContext: ctx,
        viewport: viewport
      };
      
      await page.render(renderContext).promise;
      
      return canvas;
    } catch (error) {
      console.error('Error rendering PDF page:', error);
      throw error;
    }
  };

  const convertToImages = async () => {
    if (!file || !pdfJsLoaded) {
      if (!pdfJsLoaded) {
        setError('PDF.js library is still loading. Please try again in a moment.');
      }
      return;
    }
    
    setProcessing(true);
    setProgress(0);
    setError(null);
    setImages([]);

    try {
      // Load the PDF document to get page count
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const totalPages = pdfDoc.getPageCount();
      const newImages: ImagePreview[] = [];

      for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
        try {
          // Render the PDF page to a canvas
          const canvas = await renderPDFPageToCanvas(arrayBuffer, pageNumber, 2.0);
          
          // Convert canvas to image blob with specified quality
          const imageBlob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  resolve(blob);
                } else {
                  reject(new Error('Failed to create image blob'));
                }
              },
              'image/png',
              quality / 100
            );
          });
          
          // Add to images array
          newImages.push({
            url: URL.createObjectURL(imageBlob),
            pageNumber,
            blob: imageBlob
          });
          
          setProgress((pageNumber / totalPages) * 100);
        } catch (pageError) {
          console.error(`Error processing page ${pageNumber}:`, pageError);
          throw new Error(`Failed to process page ${pageNumber}`);
        }
      }

      setImages(newImages);
    } catch (error) {
      console.error('PDF conversion error:', error);
      setError(error instanceof Error ? error.message : 'Failed to convert PDF to images. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const downloadImages = async () => {
    if (images.length === 0) return;

    try {
      const zip = new JSZip();
      
      images.forEach((image, index) => {
        zip.file(`page-${image.pageNumber}.png`, image.blob);
      });
      
      const content = await zip.generateAsync({ type: 'blob' });
      const fileName = file?.name.replace('.pdf', '') || 'pdf-images';
      saveAs(content, `${fileName}.zip`);
    } catch (error) {
      console.error('Download error:', error);
      setError('Failed to download images. Please try again.');
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].url); // Clean up the URL object
      newImages.splice(index, 1);
      return newImages;
    });
  };

  return (
    <Box>
      <PageHeader
        title="PDF to Images"
        description="Convert your PDF pages into high-quality PNG images. Perfect for extracting images or creating visual content from your PDFs."
        icon={<ImageIcon sx={{ fontSize: 32 }} />}
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
          <FileUploadIcon 
            sx={{ 
              fontSize: 48, 
              color: 'primary.main',
              mb: 2
            }} 
          />
          <Typography variant="h6" gutterBottom sx={{ fontFamily: "'Montserrat', sans-serif" }}>
            {file ? 'Drop a different PDF file' : 'Drop a PDF file here'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            or click to select file
          </Typography>
        </Box>

        <AnimatePresence>
          {file && (
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
                      Selected File
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {file.name}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                      Image Quality
                    </Typography>
                    <Box sx={{ px: 2 }}>
                      <Slider
                        value={quality}
                        onChange={handleQualityChange}
                        min={30}
                        max={100}
                        valueLabelDisplay="auto"
                        valueLabelFormat={value => `${value}%`}
                      />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption" color="text.secondary">Smaller Size</Typography>
                        <Typography variant="caption" color="text.secondary">Best Quality</Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Stack direction="row" spacing={2}>
                    {images.length > 0 && (
                      <Button
                        variant="outlined"
                        onClick={downloadImages}
                        startIcon={<DownloadIcon />}
                      >
                        Download All
                      </Button>
                    )}
                    <Button
                      variant="contained"
                      onClick={convertToImages}
                      disabled={processing || !pdfJsLoaded}
                      startIcon={<ImageIcon />}
                      sx={{
                        background: theme => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                        color: 'white',
                        '&:hover': {
                          background: theme => `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`
                        }
                      }}
                    >
                      {!pdfJsLoaded ? 'Loading PDF.js...' : processing ? 'Converting...' : 'Convert to Images'}
                    </Button>
                  </Stack>
                </Stack>
              </Box>

              {processing && (
                <Box sx={{ mt: 4 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1
                  }}>
                    <Typography variant="body2" color="text.secondary">
                      Converting PDF to images...
                    </Typography>
                    <Typography variant="body2" color="primary" fontWeight={500}>
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
            </motion.div>
          )}
        </AnimatePresence>
      </Paper>

      {images.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Generated Images
            </Typography>
            <Grid container spacing={2}>
              {images.map((image, index) => (
                <Grid item xs={12} sm={6} md={4} key={image.pageNumber}>
                  <Card 
                    sx={{ 
                      position: 'relative',
                      '&:hover .image-actions': {
                        opacity: 1
                      }
                    }}
                  >
                    <CardMedia
                      component="img"
                      image={image.url}
                      alt={`Page ${image.pageNumber}`}
                      sx={{ 
                        aspectRatio: '1/1.4',
                        objectFit: 'cover'
                      }}
                    />
                    <CardActions
                      className="image-actions"
                      sx={{ 
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        opacity: 0,
                        transition: 'opacity 0.2s',
                        bgcolor: 'rgba(0, 0, 0, 0.6)',
                        borderRadius: '0 0 0 8px'
                      }}
                    >
                      <Tooltip title="View Full Size">
                        <IconButton 
                          size="small" 
                          onClick={() => window.open(image.url, '_blank')}
                          sx={{ color: 'white' }}
                        >
                          <ZoomInIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Remove">
                        <IconButton 
                          size="small" 
                          onClick={() => removeImage(index)}
                          sx={{ color: 'white' }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </CardActions>
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 8,
                        left: 8,
                        bgcolor: 'rgba(0, 0, 0, 0.6)',
                        color: 'white',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        fontSize: '0.75rem'
                      }}
                    >
                      Page {image.pageNumber}
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </motion.div>
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

export default PDFToImages; 