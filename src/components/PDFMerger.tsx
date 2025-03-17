import React, { useState, useCallback } from 'react';
import { PDFDocument } from 'pdf-lib';
import { 
  Button, 
  Box, 
  Typography, 
  LinearProgress, 
  Paper, 
  List, 
  ListItem, 
  ListItemText, 
  IconButton,
  Alert,
  alpha,
  Snackbar,
  ListItemSecondaryAction
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { saveAs } from 'file-saver';
import DeleteIcon from '@mui/icons-material/Delete';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import MergeIcon from '@mui/icons-material/Merge';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useDropzone } from 'react-dropzone';
import PageHeader from './PageHeader';
import { 
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon
} from '@mui/icons-material';

const PDFMerger: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: any[]) => {
    if (fileRejections.length > 0) {
      setError('Only PDF files are accepted. Please check your files.');
      return;
    }
    
    // Make sure files are PDFs
    const validFiles = acceptedFiles.filter(file => 
      file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    );
    
    if (validFiles.length !== acceptedFiles.length) {
      setError('Only PDF files are accepted. Some files were skipped.');
    }
    
    if (validFiles.length > 0) {
      setFiles(prevFiles => [...prevFiles, ...validFiles]);
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    noClick: files.length > 0, // Disable clicking when we already have files
  });

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const validatePDF = async (file: File): Promise<boolean> => {
    try {
      const fileBuffer = await file.arrayBuffer();
      // Try to load as PDF to validate
      await PDFDocument.load(fileBuffer);
      return true;
    } catch (error) {
      return false;
    }
  };

  const mergePDFs = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    setProgress(0);
    setSuccess(false);
    setError(null);

    try {
      // Validate all files first
      let validFiles = [];
      for (const file of files) {
        const isValid = await validatePDF(file);
        if (isValid) {
          validFiles.push(file);
        } else {
          console.error(`Invalid PDF file: ${file.name}`);
        }
      }

      if (validFiles.length === 0) {
        setError('No valid PDF files found. Please check your files.');
        setIsProcessing(false);
        return;
      }

      if (validFiles.length !== files.length) {
        setError(`Some files were skipped because they were not valid PDFs. Merging ${validFiles.length} files.`);
      }

      const mergedPdf = await PDFDocument.create();
      
      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        const fileBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(fileBuffer);
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        pages.forEach((page) => mergedPdf.addPage(page));
        
        setProgress(((i + 1) / validFiles.length) * 100);
      }

      const mergedPdfFile = await mergedPdf.save();
      saveAs(new Blob([mergedPdfFile]), 'merged.pdf');
      setSuccess(true);
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 5000);
    } catch (error) {
      console.error('Error merging PDFs:', error);
      setError('An error occurred while merging PDFs. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const moveFile = (fromIndex: number, toDirection: 'up' | 'down') => {
    if (fromIndex < 0 || fromIndex >= files.length) return;
    
    const newFiles = [...files];
    let toIndex = toDirection === 'up' ? fromIndex - 1 : fromIndex + 1;
    
    if (toIndex < 0 || toIndex >= files.length) return;
    
    // Swap files
    [newFiles[fromIndex], newFiles[toIndex]] = [newFiles[toIndex], newFiles[fromIndex]];
    setFiles(newFiles);
  };

  return (
    <Box>
      <PageHeader
        title="Merge PDFs"
        description="Combine multiple PDF files into a single document. Simply drag and drop your files, arrange them in the desired order, and merge them together."
        icon={<MergeIcon sx={{ fontSize: 32 }} />}
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
            Drop PDF files here
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
              <List sx={{ mt: 3 }}>
                {files.map((file, index) => (
                  <motion.div
                    key={file.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ListItem
                      sx={{
                        mb: 1,
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                        '&:hover': {
                          backgroundColor: theme => alpha(theme.palette.primary.main, 0.05)
                        }
                      }}
                    >
                      <ListItemText 
                        primary={file.name}
                        secondary={`${formatFileSize(file.size)}`}
                        primaryTypographyProps={{
                          sx: { fontWeight: 500 }
                        }}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          size="small"
                          onClick={() => moveFile(index, 'up')}
                          disabled={index === 0}
                        >
                          <ArrowUpIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => moveFile(index, 'down')}
                          disabled={index === files.length - 1}
                        >
                          <ArrowDownIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveFile(index)}
                          sx={{ color: 'error.main' }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  </motion.div>
                ))}
              </List>

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  onClick={mergePDFs}
                  disabled={isProcessing || files.length < 2}
                  startIcon={<MergeIcon />}
                  sx={{
                    background: theme => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    color: 'white',
                    '&:hover': {
                      background: theme => `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`
                    }
                  }}
                >
                  {isProcessing ? 'Merging...' : 'Merge PDFs'}
                </Button>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </Paper>

      {isProcessing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Box sx={{ width: '100%', mt: 4 }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 1
            }}>
              <Typography variant="body2" color="text.secondary">
                Merging PDFs...
              </Typography>
              <Typography variant="body2" color="primary" fontWeight={500}>
                {Math.round(progress)}%
              </Typography>
            </Box>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            >
              <LinearProgress 
                variant="determinate" 
                value={100} 
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                }}
              />
            </motion.div>
          </Box>
        </motion.div>
      )}

      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Alert 
              icon={<CheckCircleIcon fontSize="inherit" />} 
              severity="success"
              sx={{ 
                mt: 3,
                borderRadius: 2,
                boxShadow: theme => `0 4px 12px ${alpha(theme.palette.success.main, 0.2)}`,
              }}
            >
              PDFs successfully merged! Your download should start automatically.
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

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

export default PDFMerger; 