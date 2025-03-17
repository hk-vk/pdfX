import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import {
  Box,
  Button,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Slider,
  Typography,
  useTheme,
  Paper,
  Stack
} from '@mui/material';
import {
  ZoomIn,
  ZoomOut,
  NavigateNext,
  NavigateBefore,
  Close,
  FileDownload
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import GlassmorphicContainer from './GlassmorphicContainer';

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

// Motion components
const MotionPaper = motion(Paper);

interface PDFViewerProps {
  fileUrl: string | null;
  fileName?: string;
  open: boolean;
  onClose: () => void;
  onDownload?: () => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({
  fileUrl,
  fileName = 'document.pdf',
  open,
  onClose,
  onDownload
}) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const theme = useTheme();

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const changePage = (offset: number) => {
    setPageNumber(prevPageNumber => {
      const newPage = prevPageNumber + offset;
      return newPage >= 1 && newPage <= numPages ? newPage : prevPageNumber;
    });
  };

  const previousPage = () => changePage(-1);
  const nextPage = () => changePage(1);

  const zoomIn = () => setScale(prevScale => Math.min(prevScale + 0.2, 2.5));
  const zoomOut = () => setScale(prevScale => Math.max(prevScale - 0.2, 0.5));

  const handleScaleChange = (event: Event, newValue: number | number[]) => {
    setScale(newValue as number);
  };

  if (!fileUrl) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperComponent={props => (
        <MotionPaper
          {...props}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
        />
      )}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {fileName}
        </Typography>
        <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers sx={{ bgcolor: theme.palette.background.default }}>
        <GlassmorphicContainer sx={{ p: 2, mb: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
            <IconButton onClick={zoomOut} disabled={scale <= 0.5}>
              <ZoomOut />
            </IconButton>
            
            <Box sx={{ width: 200 }}>
              <Slider
                value={scale}
                min={0.5}
                max={2.5}
                step={0.1}
                onChange={handleScaleChange}
                valueLabelDisplay="auto"
                valueLabelFormat={value => `${Math.round(value * 100)}%`}
              />
            </Box>
            
            <IconButton onClick={zoomIn} disabled={scale >= 2.5}>
              <ZoomIn />
            </IconButton>
            
            <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
              <IconButton onClick={previousPage} disabled={pageNumber <= 1}>
                <NavigateBefore />
              </IconButton>
              
              <Typography sx={{ mx: 1 }}>
                {pageNumber} / {numPages}
              </Typography>
              
              <IconButton onClick={nextPage} disabled={pageNumber >= numPages}>
                <NavigateNext />
              </IconButton>
            </Box>
          </Stack>
        </GlassmorphicContainer>
        
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            overflow: 'auto',
            minHeight: '60vh',
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)',
            borderRadius: 1,
            p: 2
          }}
        >
          <Document
            file={fileUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={(error) => console.error('Error loading PDF:', error)}
            loading={
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <Typography>Loading PDF...</Typography>
              </Box>
            }
            error={
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <Typography color="error">Failed to load PDF. Please try again.</Typography>
              </Box>
            }
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              renderTextLayer={true}
              renderAnnotationLayer={true}
            />
          </Document>
        </Box>
      </DialogContent>
      
      <DialogActions>
        {onDownload && (
          <Button 
            startIcon={<FileDownload />} 
            onClick={onDownload} 
            variant="contained" 
            color="primary"
          >
            Download
          </Button>
        )}
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default PDFViewer; 