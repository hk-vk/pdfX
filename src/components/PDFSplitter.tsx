import React, { useState, useCallback } from 'react';
import { PDFDocument } from 'pdf-lib';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Slider,
  IconButton,
  Alert,
  Snackbar,
  useTheme,
  alpha,
  Stack
} from '@mui/material';
import { 
  ContentCut as SplitIcon,
  FileUpload as FileUploadIcon,
  Download as DownloadIcon,
  ErrorOutline as ErrorOutlineIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { saveAs } from 'file-saver';
import PageHeader from './PageHeader';

const PDFSplitter: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [range, setRange] = useState<[number, number]>([1, 1]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const count = pdf.getPageCount();
      
      setFile(file);
      setPageCount(count);
      setRange([1, count]);
    } catch (error) {
      setError('Invalid PDF file. Please try another file.');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    multiple: false
  });

  const handleRangeChange = (event: Event, newValue: number | number[]) => {
    setRange(newValue as [number, number]);
  };

  const splitPDF = async () => {
    if (!file) return;
    
    setProcessing(true);
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const newPdf = await PDFDocument.create();
      
      const pages = await newPdf.copyPages(pdf, range.map(p => p - 1));
      pages.forEach(page => newPdf.addPage(page));
      
      const pdfBytes = await newPdf.save();
      const fileName = file.name.replace('.pdf', `_pages_${range[0]}-${range[1]}.pdf`);
      saveAs(new Blob([pdfBytes]), fileName);
    } catch (error) {
      setError('Failed to split PDF. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Split PDF"
        description="Extract specific pages from your PDF document. Select a page range and create a new PDF with just the pages you need."
        icon={<SplitIcon sx={{ fontSize: 32 }} />}
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
          {file && pageCount > 0 && (
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
                      {file.name} ({pageCount} pages)
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                      Page Range
                    </Typography>
                    <Box sx={{ px: 2 }}>
                      <Slider
                        value={range}
                        onChange={handleRangeChange}
                        min={1}
                        max={pageCount}
                        valueLabelDisplay="auto"
                        disableSwap
                      />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption" color="text.secondary">Page 1</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Page {pageCount}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="contained"
                      onClick={splitPDF}
                      disabled={processing}
                      startIcon={<DownloadIcon />}
                      sx={{
                        background: theme => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                        color: 'white',
                        '&:hover': {
                          background: theme => `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`
                        }
                      }}
                    >
                      {processing ? 'Processing...' : 'Extract Pages'}
                    </Button>
                  </Box>
                </Stack>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </Paper>

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

export default PDFSplitter; 