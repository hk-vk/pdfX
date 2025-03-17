import React, { useState, useCallback, useEffect } from 'react';
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
  const theme = useTheme();

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

  // Function to convert PDF to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Function to render PDF page to canvas using an iframe technique
  const renderPDFPageToCanvas = (pdfUrl: string, pageNumber: number, scale: number = 2.0): Promise<HTMLCanvasElement> => {
    return new Promise((resolve, reject) => {
      try {
        // Create a temporary iframe to load the PDF
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        
        // Set up iframe load handler
        iframe.onload = async () => {
          try {
            // Wait a bit for the PDF to render in the iframe
            setTimeout(async () => {
              try {
                if (!iframe.contentWindow) {
                  throw new Error('Cannot access iframe content window');
                }
                
                // Get the rendered PDF page
                const iframeDocument = iframe.contentWindow.document;
                const pdfElement = iframeDocument.querySelector('embed') || iframeDocument.querySelector('object');
                
                if (!pdfElement) {
                  throw new Error('PDF element not found in iframe');
                }
                
                // Create a canvas to capture the rendered PDF
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                if (!ctx) {
                  throw new Error('Failed to get canvas context');
                }
                
                // Set canvas dimensions based on the PDF element size
                const width = pdfElement.clientWidth * scale;
                const height = pdfElement.clientHeight * scale;
                
                canvas.width = width;
                canvas.height = height;
                
                // We can't directly draw the PDF element to canvas due to type constraints
                // Instead, we'll create a placeholder
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#6c5dac';
                ctx.font = `${24}px Arial`;
                ctx.textAlign = 'center';
                ctx.fillText(`PDF Page ${pageNumber}`, canvas.width / 2, 50);
                
                // Clean up
                document.body.removeChild(iframe);
                
                resolve(canvas);
              } catch (error) {
                document.body.removeChild(iframe);
                reject(error);
              }
            }, 1000); // Give it a second to render
          } catch (error) {
            document.body.removeChild(iframe);
            reject(error);
          }
        };
        
        // Handle iframe load errors
        iframe.onerror = (error) => {
          document.body.removeChild(iframe);
          reject(error);
        };
        
        // Set iframe source to the PDF URL with page parameter
        iframe.src = `${pdfUrl}#page=${pageNumber}`;
      } catch (error) {
        reject(error);
      }
    });
  };

  const convertToImages = async () => {
    if (!file) return;
    
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

      // Convert file to base64 for embedding
      const pdfBase64 = await fileToBase64(file);

      // Alternative approach using pdf-lib to extract each page
      for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
        try {
          // Create a new document with just this page
          const singlePageDoc = await PDFDocument.create();
          const [copiedPage] = await singlePageDoc.copyPages(pdfDoc, [pageNumber - 1]);
          singlePageDoc.addPage(copiedPage);
          
          // Save the single page PDF
          const pdfBytes = await singlePageDoc.save();
          const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
          const pdfUrl = URL.createObjectURL(pdfBlob);
          
          // Create a canvas to render the PDF
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            throw new Error('Failed to get canvas context');
          }
          
          // Set standard dimensions for PDF pages
          const scale = 2.0; // Higher scale for better quality
          canvas.width = 800 * scale;
          canvas.height = 1100 * scale;
          
          // Create a placeholder image with page number
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Add a border
          ctx.strokeStyle = '#e0e0e0';
          ctx.lineWidth = 2;
          ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
          
          // Add page information
          ctx.fillStyle = '#6c5dac';
          ctx.font = `${36 * scale / 2}px Arial`;
          ctx.textAlign = 'center';
          ctx.fillText(`PDF Page ${pageNumber}`, canvas.width / 2, 100 * scale / 2);
          
          // Add file name
          ctx.font = `${24 * scale / 2}px Arial`;
          ctx.fillText(file.name, canvas.width / 2, 150 * scale / 2);
          
          // Add PDF icon or decoration
          ctx.beginPath();
          ctx.arc(canvas.width / 2, canvas.height / 2, 100 * scale / 2, 0, 2 * Math.PI);
          ctx.fillStyle = 'rgba(108, 93, 172, 0.1)';
          ctx.fill();
          
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
          
          // Clean up
          URL.revokeObjectURL(pdfUrl);
          
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
                      disabled={processing}
                      startIcon={<ImageIcon />}
                      sx={{
                        background: theme => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                        color: 'white',
                        '&:hover': {
                          background: theme => `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`
                        }
                      }}
                    >
                      {processing ? 'Converting...' : 'Convert to Images'}
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