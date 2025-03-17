import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { 
  Button, 
  Box, 
  Typography, 
  LinearProgress, 
  Paper, 
  Slider, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  IconButton, 
  Tooltip, 
  Alert, 
  Fade,
  Divider,
  Stack,
  Chip,
  alpha,
  useTheme,
  SelectChangeEvent
} from '@mui/material';
import { saveAs } from 'file-saver';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import DescriptionIcon from '@mui/icons-material/Description';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

type SplitMode = 'range' | 'single' | 'all';

const PDFSplitter: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [splitMode, setSplitMode] = useState<SplitMode>('range');
  const [pageRange, setPageRange] = useState<[number, number]>([1, 2]);
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
        const count = pdf.getPageCount();
        setPageCount(count);
        setPageRange([1, count > 1 ? 2 : 1]);
      } catch (error) {
        console.error('Error loading PDF:', error);
      }
    }
  };

  const splitPDF = async () => {
    if (!file || !pageCount) return;

    setIsProcessing(true);
    setProgress(0);
    setSuccess(false);

    try {
      const fileBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(fileBuffer);
      
      if (splitMode === 'all') {
        // Split into individual pages
        let processedPages = 0;
        
        for (let i = 0; i < pageCount; i++) {
          const newPdf = await PDFDocument.create();
          const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
          newPdf.addPage(copiedPage);
          
          const pdfBytes = await newPdf.save();
          const blob = new Blob([pdfBytes], { type: 'application/pdf' });
          saveAs(blob, `${file.name.replace('.pdf', '')}_page-${i + 1}.pdf`);
          
          processedPages++;
          setProgress((processedPages / pageCount) * 100);
        }
      } else if (splitMode === 'single') {
        // Extract a single page
        const pageIndex = pageRange[0] - 1;
        const newPdf = await PDFDocument.create();
        const [copiedPage] = await newPdf.copyPages(pdfDoc, [pageIndex]);
        newPdf.addPage(copiedPage);
        
        const pdfBytes = await newPdf.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        saveAs(blob, `${file.name.replace('.pdf', '')}_page-${pageRange[0]}.pdf`);
        
        setProgress(100);
      } else if (splitMode === 'range') {
        // Extract a range of pages
        const startPage = pageRange[0] - 1;
        const endPage = pageRange[1] - 1;
        const newPdf = await PDFDocument.create();
        
        const pageIndexes = Array.from(
          { length: endPage - startPage + 1 }, 
          (_, i) => startPage + i
        );
        
        const copiedPages = await newPdf.copyPages(pdfDoc, pageIndexes);
        copiedPages.forEach(page => newPdf.addPage(page));
        
        const pdfBytes = await newPdf.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        saveAs(blob, `${file.name.replace('.pdf', '')}_pages-${pageRange[0]}-${pageRange[1]}.pdf`);
        
        setProgress(100);
      }
      
      setSuccess(true);
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 5000);
    } catch (error) {
      console.error('Error splitting PDF:', error);
      // TODO: Add error handling UI
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPageCount(null);
  };

  const handleSplitModeChange = (event: SelectChangeEvent) => {
    setSplitMode(event.target.value as SplitMode);
  };

  const handlePageRangeChange = (event: Event, newValue: number | number[]) => {
    setPageRange(newValue as [number, number]);
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
          Split PDF Document
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Extract specific pages or split your PDF into multiple documents.
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
          htmlFor="pdf-split-input"
        >
          <input
            accept=".pdf"
            style={{ display: 'none' }}
            id="pdf-split-input"
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
            Select a PDF to Split
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
            Upload a PDF document to extract pages or split into multiple files
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
              Split Options
            </Typography>
            
            <FormControl fullWidth variant="outlined" size="small" sx={{ mb: 3 }}>
              <InputLabel id="split-mode-label">Split Mode</InputLabel>
              <Select
                labelId="split-mode-label"
                value={splitMode}
                onChange={handleSplitModeChange}
                label="Split Mode"
                disabled={isProcessing}
              >
                <MenuItem value="range">Extract Page Range</MenuItem>
                <MenuItem value="single">Extract Single Page</MenuItem>
                <MenuItem value="all">Split into Individual Pages</MenuItem>
              </Select>
            </FormControl>
            
            {(splitMode === 'range' || splitMode === 'single') && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                  {splitMode === 'range' ? 'Page Range' : 'Page Number'}
                </Typography>
                
                <Box sx={{ px: 1 }}>
                  <Slider
                    value={splitMode === 'range' ? pageRange : [pageRange[0], pageRange[0]]}
                    onChange={handlePageRangeChange}
                    min={1}
                    max={pageCount || 1}
                    step={1}
                    marks
                    valueLabelDisplay="auto"
                    disabled={isProcessing || !pageCount}
                    disableSwap
                    sx={{
                      '& .MuiSlider-thumb': {
                        width: 16,
                        height: 16,
                      },
                      '& .MuiSlider-track': {
                        background: 'linear-gradient(90deg, #4361ee, #3a0ca3)',
                      }
                    }}
                  />
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">Page 1</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Page {pageCount || 1}
                  </Typography>
                </Box>
              </Box>
            )}
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ mb: 2, fontWeight: 500 }}>
                Output Summary
              </Typography>
              
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                {splitMode === 'all' && (
                  <Chip 
                    label={`${pageCount} individual PDF files`} 
                    size="small" 
                    color="primary" 
                    variant="outlined" 
                  />
                )}
                
                {splitMode === 'single' && (
                  <Chip 
                    label={`Extract page ${pageRange[0]}`} 
                    size="small" 
                    color="primary" 
                    variant="outlined" 
                  />
                )}
                
                {splitMode === 'range' && (
                  <Chip 
                    label={`Pages ${pageRange[0]} to ${pageRange[1]}`} 
                    size="small" 
                    color="primary" 
                    variant="outlined" 
                  />
                )}
              </Stack>
            </Box>
          </Paper>
          
          <Button
            variant="contained"
            color="primary"
            onClick={splitPDF}
            disabled={isProcessing}
            startIcon={<ContentCutIcon />}
            fullWidth
            size="large"
            sx={{
              background: 'linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%)',
              py: 1.5,
              fontWeight: 600,
            }}
          >
            Split PDF
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
              Splitting PDF...
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
          PDF successfully split! Your download should start automatically.
        </Alert>
      </Fade>
    </Box>
  );
};

export default PDFSplitter; 