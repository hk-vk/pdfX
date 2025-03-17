import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { 
  Button, 
  Box, 
  Typography, 
  TextField, 
  LinearProgress, 
  Paper,
  Alert,
  Fade,
  Chip,
  Stack,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Tooltip,
  IconButton
} from '@mui/material';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import DescriptionIcon from '@mui/icons-material/Description';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';

type SplitMode = 'all' | 'ranges' | 'pages';

const PDFSplitter: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pageRanges, setPageRanges] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [splitMode, setSplitMode] = useState<SplitMode>('all');

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

  const parsePageRanges = (input: string): number[][] => {
    if (!input.trim()) return [];
    return input.split(',').map(range => {
      const [start, end] = range.trim().split('-').map(num => parseInt(num, 10));
      return end ? [start - 1, end - 1] : [start - 1, start - 1];
    });
  };

  const splitPDF = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);
    setSuccess(false);

    try {
      const fileBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(fileBuffer);
      const totalPages = pdf.getPageCount();
      let ranges: number[][] = [];
      
      if (splitMode === 'all') {
        // Split every page
        ranges = Array.from({ length: totalPages }, (_, i) => [i, i]);
      } else if (splitMode === 'pages') {
        // Split into individual pages
        ranges = Array.from({ length: totalPages }, (_, i) => [i, i]);
      } else {
        // Split by custom ranges
        ranges = parsePageRanges(pageRanges);
        if (ranges.length === 0) {
          throw new Error('Invalid page ranges');
        }
      }

      const zip = new JSZip();
      let processedRanges = 0;

      for (const [start, end] of ranges) {
        const newPdf = await PDFDocument.create();
        const pages = await newPdf.copyPages(pdf, Array.from(
          { length: end - start + 1 },
          (_, i) => start + i
        ));
        
        pages.forEach(page => newPdf.addPage(page));
        const pdfBytes = await newPdf.save();
        
        if (splitMode === 'all') {
          // If splitting the entire document, just save as one file
          return saveAs(new Blob([pdfBytes]), `${file.name.replace('.pdf', '')}_split.pdf`);
        } else {
          // Otherwise add to zip
          zip.file(`${file.name.replace('.pdf', '')}_${start + 1}-${end + 1}.pdf`, pdfBytes);
        }
        
        processedRanges++;
        setProgress((processedRanges / ranges.length) * 100);
      }

      const zipContent = await zip.generateAsync({ type: 'blob' });
      saveAs(zipContent, `${file.name.replace('.pdf', '')}_split.zip`);
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

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Split PDF Document
      </Typography>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="body1" gutterBottom color="text.secondary">
          Split a PDF document into multiple files based on page ranges or extract individual pages.
        </Typography>
      </Box>
      
      <input
        accept=".pdf"
        style={{ display: 'none' }}
        id="pdf-split-input"
        type="file"
        onChange={handleFileChange}
        disabled={isProcessing}
      />
      
      {!file ? (
        <Box sx={{ 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 5,
          border: '2px dashed',
          borderColor: 'divider',
          borderRadius: 2,
          bgcolor: 'action.hover',
          textAlign: 'center'
        }}>
          <DescriptionIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2, opacity: 0.7 }} />
          <Typography variant="h6" gutterBottom>
            Select a PDF to Split
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Upload a PDF document to get started
          </Typography>
          <label htmlFor="pdf-split-input">
            <Button
              variant="contained"
              component="span"
              startIcon={<FileUploadIcon />}
            >
              Select PDF File
            </Button>
          </label>
        </Box>
      ) : (
        <Box>
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 3, 
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 3
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <DescriptionIcon color="primary" sx={{ mr: 2, fontSize: 40 }} />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                  {file.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {(file.size / 1024 / 1024).toFixed(2)} MB • {pageCount} pages
                </Typography>
              </Box>
            </Box>
            <Tooltip title="Remove file">
              <IconButton 
                onClick={handleRemoveFile}
                disabled={isProcessing}
                size="small"
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Paper>

          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, mb: 3 }}>
            <FormControl component="fieldset" sx={{ width: '100%' }}>
              <FormLabel component="legend" sx={{ mb: 2, fontWeight: 500 }}>
                Split Options
              </FormLabel>
              <RadioGroup
                value={splitMode}
                onChange={(e) => setSplitMode(e.target.value as SplitMode)}
              >
                <FormControlLabel 
                  value="all" 
                  control={<Radio />} 
                  label="Extract entire document (no splitting)" 
                  disabled={isProcessing}
                />
                <FormControlLabel 
                  value="pages" 
                  control={<Radio />} 
                  label="Split into individual pages" 
                  disabled={isProcessing}
                />
                <FormControlLabel 
                  value="ranges" 
                  control={<Radio />} 
                  label="Split by page ranges" 
                  disabled={isProcessing}
                />
              </RadioGroup>
              
              {splitMode === 'ranges' && (
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Page Ranges
                    </Typography>
                    <Tooltip title="Format: 1-3, 5, 7-9 (page numbers start at 1)">
                      <IconButton size="small" sx={{ ml: 1 }}>
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <TextField
                    fullWidth
                    placeholder="e.g., 1-3, 5, 7-9"
                    value={pageRanges}
                    onChange={(e) => setPageRanges(e.target.value)}
                    disabled={isProcessing}
                    size="small"
                    sx={{ mb: 2 }}
                  />
                  
                  {pageCount && pageRanges && (
                    <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap', gap: 1 }}>
                      {parsePageRanges(pageRanges).map(([start, end], index) => (
                        <Chip 
                          key={index}
                          label={start === end ? `Page ${start + 1}` : `Pages ${start + 1}-${end + 1}`}
                          color="primary"
                          variant="outlined"
                          size="small"
                        />
                      ))}
                    </Stack>
                  )}
                </Box>
              )}
            </FormControl>
          </Paper>
          
          <Button
            variant="contained"
            color="primary"
            onClick={splitPDF}
            disabled={isProcessing || (splitMode === 'ranges' && !pageRanges)}
            startIcon={<ContentCutIcon />}
            fullWidth
            size="large"
          >
            {splitMode === 'all' ? 'Extract Document' : 'Split PDF'}
          </Button>
        </Box>
      )}

      {isProcessing && (
        <Box sx={{ width: '100%', mt: 4 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Processing PDF... ({Math.round(progress)}%)
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>
      )}

      <Fade in={success}>
        <Alert 
          icon={<CheckCircleIcon fontSize="inherit" />} 
          severity="success"
          sx={{ mt: 3 }}
        >
          PDF successfully split! Your download should start automatically.
        </Alert>
      </Fade>
    </Box>
  );
};

export default PDFSplitter; 