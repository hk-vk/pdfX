import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { 
  Button, 
  Box, 
  Typography, 
  LinearProgress, 
  Paper, 
  Grid, 
  IconButton, 
  Tooltip, 
  Alert, 
  Fade,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  alpha,
  useTheme
} from '@mui/material';
import { saveAs } from 'file-saver';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import DescriptionIcon from '@mui/icons-material/Description';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import JSZip from 'jszip';
import * as pdfjs from 'pdfjs-dist';

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

const PDFToImages: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [format, setFormat] = useState<'png' | 'jpeg'>('png');
  const [dpi, setDpi] = useState<number>(300);
  const [success, setSuccess] = useState(false);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);
      
      // Get page count
      try {
        const fileBuffer = await selectedFile.arrayBuffer();
        const pdf = await PDFDocument.load(fileBuffer);
        setPageCount(pdf.getPageCount());
      } catch (error) {
        console.error('Error loading PDF:', error);
      }
    }
  };

  const convertPDFToImages = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);
    setSuccess(false);

    try {
      const fileBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: fileBuffer }).promise;
      const totalPages = pdf.numPages;
      
      const zip = new JSZip();
      const imgFolder = zip.folder('images');
      
      for (let i = 1; i <= totalPages; i++) {
        const page = await pdf.getPage(i);
        
        // Calculate scale based on DPI (PDF uses 72 DPI as default)
        const scale = dpi / 72;
        const viewport = page.getViewport({ scale });
        
        // Prepare canvas for rendering
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        if (!context) {
          throw new Error('Could not get canvas context');
        }
        
        // Render PDF page to canvas
        await page.render({
          canvasContext: context,
          viewport,
        }).promise;
        
        // Convert canvas to image data
        let imageData;
        if (format === 'png') {
          imageData = canvas.toDataURL('image/png');
        } else {
          imageData = canvas.toDataURL('image/jpeg', 0.9);
        }
        
        // Remove data URL prefix to get just the base64 data
        const base64Data = imageData.split(',')[1];
        
        // Add image to zip
        if (imgFolder) {
          imgFolder.file(`page-${i}.${format}`, base64Data, { base64: true });
        }
        
        // Update progress
        setProgress((i / totalPages) * 100);
      }
      
      // Generate zip file
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, `${file.name.replace('.pdf', '')}_images.zip`);
      
      setSuccess(true);
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 5000);
    } catch (error) {
      console.error('Error converting PDF to images:', error);
      // TODO: Add error handling UI
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPageCount(null);
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ 
          mb: 1,
          fontWeight: 700,
          background: 'linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Convert PDF to Images
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Extract pages from your PDF as high-quality image files.
        </Typography>
      </Box>
      
      {!file ? (
        <Paper 
          variant="outlined" 
          sx={{ 
            p: 5,
            borderRadius: 3,
            borderStyle: 'dashed',
            borderWidth: 2,
            borderColor: theme => alpha(theme.palette.primary.main, 0.2),
            bgcolor: theme => alpha(theme.palette.primary.main, 0.03),
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
            '&:hover': {
              borderColor: theme => alpha(theme.palette.primary.main, 0.5),
              bgcolor: theme => alpha(theme.palette.primary.main, 0.05),
            }
          }}
          component="label"
          htmlFor="pdf-to-images-input"
        >
          <input
            accept=".pdf"
            style={{ display: 'none' }}
            id="pdf-to-images-input"
            type="file"
            onChange={handleFileChange}
            disabled={isProcessing}
          />
          <CloudUploadIcon sx={{ 
            fontSize: 60, 
            color: 'primary.main', 
            mb: 2, 
            opacity: 0.7 
          }} />
          <Typography variant="h6" gutterBottom fontWeight={600}>
            Select a PDF to Convert
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
            Upload a PDF document to extract its pages as images
          </Typography>
          <Button
            variant="contained"
            component="span"
            startIcon={<FileUploadIcon />}
            sx={{
              background: 'linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%)',
              px: 3,
              py: 1.5,
            }}
          >
            Select PDF File
          </Button>
        </Paper>
      ) : (
        <Box>
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 3, 
              borderRadius: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 3,
              boxShadow: theme => isDarkMode 
                ? `0 4px 20px ${alpha(theme.palette.common.black, 0.2)}` 
                : `0 4px 20px ${alpha(theme.palette.common.black, 0.05)}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: theme => alpha(theme.palette.primary.main, 0.1),
                color: 'primary.main',
                mr: 2
              }}>
                <DescriptionIcon sx={{ fontSize: 28 }} />
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {file.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {pageCount} pages
                </Typography>
              </Box>
            </Box>
            <Tooltip title="Remove file">
              <IconButton 
                onClick={handleRemoveFile}
                disabled={isProcessing}
                size="small"
                sx={{
                  color: 'error.main',
                  opacity: 0.7,
                  '&:hover': {
                    opacity: 1,
                  }
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Paper>

          <Paper 
            variant="outlined" 
            sx={{ 
              p: 3, 
              borderRadius: 3, 
              mb: 3,
              boxShadow: theme => isDarkMode 
                ? `0 4px 20px ${alpha(theme.palette.common.black, 0.2)}` 
                : `0 4px 20px ${alpha(theme.palette.common.black, 0.05)}`,
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 3 }}>
              Conversion Settings
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel id="image-format-label">Image Format</InputLabel>
                  <Select
                    labelId="image-format-label"
                    value={format}
                    onChange={(e) => setFormat(e.target.value as 'png' | 'jpeg')}
                    label="Image Format"
                    disabled={isProcessing}
                  >
                    <MenuItem value="png">PNG (Lossless)</MenuItem>
                    <MenuItem value="jpeg">JPEG (Smaller Size)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel id="dpi-label">Resolution (DPI)</InputLabel>
                  <Select
                    labelId="dpi-label"
                    value={dpi}
                    onChange={(e) => setDpi(Number(e.target.value))}
                    label="Resolution (DPI)"
                    disabled={isProcessing}
                  >
                    <MenuItem value={72}>72 DPI (Screen Resolution)</MenuItem>
                    <MenuItem value={150}>150 DPI (Medium Quality)</MenuItem>
                    <MenuItem value={300}>300 DPI (High Quality)</MenuItem>
                    <MenuItem value={600}>600 DPI (Print Quality)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Output: All pages will be saved as individual {format.toUpperCase()} images in a ZIP file.
              </Typography>
            </Box>
          </Paper>
          
          <Button
            variant="contained"
            color="primary"
            onClick={convertPDFToImages}
            disabled={isProcessing}
            startIcon={<ImageIcon />}
            fullWidth
            size="large"
            sx={{
              background: 'linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%)',
              py: 1.5,
              fontWeight: 600,
            }}
          >
            Convert to Images
          </Button>
        </Box>
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
              Converting PDF to images...
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
          PDF successfully converted to images! Your download should start automatically.
        </Alert>
      </Fade>
    </Box>
  );
};

export default PDFToImages; 