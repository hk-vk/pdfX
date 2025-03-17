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
  ListItemIcon, 
  IconButton,
  Alert,
  Fade,
  Tooltip,
  Divider,
  alpha,
  Chip,
  Stack,
  useTheme
} from '@mui/material';
import { saveAs } from 'file-saver';
import DescriptionIcon from '@mui/icons-material/Description';
import DeleteIcon from '@mui/icons-material/Delete';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import MergeIcon from '@mui/icons-material/Merge';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DraggableProvided } from 'react-beautiful-dnd';

const PDFMerger: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles(prev => [...prev, ...Array.from(event.target.files || [])]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const onDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return;
    
    const items = Array.from(files);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setFiles(items);
  }, [files]);

  const mergePDFs = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    setProgress(0);
    setSuccess(false);

    try {
      const mergedPdf = await PDFDocument.create();
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(fileBuffer);
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        pages.forEach((page) => mergedPdf.addPage(page));
        
        setProgress(((i + 1) / files.length) * 100);
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
      // TODO: Add error handling UI
    } finally {
      setIsProcessing(false);
    }
  };

  const getTotalSize = () => {
    return files.reduce((total, file) => total + file.size, 0);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
          Merge Multiple PDF Files
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Combine multiple PDF files into a single document. Select files in the order you want them to appear or drag to reorder.
        </Typography>
      </Box>
      
      {files.length === 0 ? (
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
          htmlFor="pdf-file-input"
        >
          <input
            accept=".pdf"
            style={{ display: 'none' }}
            id="pdf-file-input"
            multiple
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
            Select PDF Files to Merge
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
            Click to browse or drag and drop PDF files here
          </Typography>
          <Button
            variant="contained"
            component="span"
            disabled={isProcessing}
            startIcon={<FileUploadIcon />}
            sx={{
              background: 'linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%)',
              px: 3,
              py: 1.5,
            }}
          >
            Select PDF Files
          </Button>
        </Paper>
      ) : (
        <Box>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
            flexWrap: 'wrap',
            gap: 2
          }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Chip 
                icon={<DescriptionIcon />} 
                label={`${files.length} file${files.length !== 1 ? 's' : ''}`} 
                color="primary" 
                variant="outlined"
              />
              <Chip 
                icon={<InfoOutlinedIcon />} 
                label={`Total size: ${formatFileSize(getTotalSize())}`} 
                variant="outlined"
              />
            </Stack>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <input
                accept=".pdf"
                style={{ display: 'none' }}
                id="pdf-file-input-add"
                multiple
                type="file"
                onChange={handleFileChange}
                disabled={isProcessing}
              />
              <label htmlFor="pdf-file-input-add">
                <Button
                  variant="outlined"
                  component="span"
                  disabled={isProcessing}
                  startIcon={<FileUploadIcon />}
                  size="small"
                >
                  Add More
                </Button>
              </label>
              
              <Button
                variant="contained"
                color="primary"
                onClick={mergePDFs}
                disabled={isProcessing}
                startIcon={<MergeIcon />}
                sx={{
                  background: 'linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%)',
                }}
              >
                Merge Files
              </Button>
            </Box>
          </Box>

          <Paper 
            variant="outlined" 
            sx={{ 
              borderRadius: 3,
              overflow: 'hidden',
              borderColor: theme => alpha(theme.palette.divider, 0.1),
              boxShadow: theme => isDarkMode 
                ? `0 4px 20px ${alpha(theme.palette.common.black, 0.2)}` 
                : `0 4px 20px ${alpha(theme.palette.common.black, 0.05)}`,
            }}
          >
            <Box sx={{ 
              p: 2, 
              bgcolor: theme => alpha(theme.palette.primary.main, isDarkMode ? 0.15 : 0.05),
              borderBottom: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                PDF Files (Drag to Reorder)
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Files will be merged in the order shown below
              </Typography>
            </Box>
            
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="pdf-files">
                {(provided: DroppableProvided) => (
                  <List 
                    sx={{ py: 0 }}
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    {files.map((file, index) => (
                      <Draggable key={`${file.name}-${index}`} draggableId={`${file.name}-${index}`} index={index}>
                        {(provided: DraggableProvided) => (
                          <React.Fragment>
                            {index > 0 && <Divider component="li" />}
                            <ListItem
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              sx={{
                                transition: 'background-color 0.2s',
                                '&:hover': {
                                  bgcolor: theme => alpha(theme.palette.primary.main, 0.05),
                                },
                              }}
                              secondaryAction={
                                <Tooltip title="Remove file">
                                  <IconButton 
                                    edge="end" 
                                    aria-label="delete"
                                    onClick={() => handleRemoveFile(index)}
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
                              }
                            >
                              <ListItemIcon {...provided.dragHandleProps}>
                                <DragIndicatorIcon sx={{ color: 'text.secondary', mr: -1 }} />
                                <Box sx={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: 1,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  bgcolor: theme => alpha(theme.palette.primary.main, 0.1),
                                  color: 'primary.main',
                                }}>
                                  <DescriptionIcon />
                                </Box>
                              </ListItemIcon>
                              <ListItemText 
                                primary={file.name} 
                                secondary={`${formatFileSize(file.size)}`}
                                primaryTypographyProps={{
                                  sx: { 
                                    fontWeight: 500,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                  }
                                }}
                              />
                            </ListItem>
                          </React.Fragment>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </List>
                )}
              </Droppable>
            </DragDropContext>
          </Paper>
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
              Merging PDFs...
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
          PDFs successfully merged! Your download should start automatically.
        </Alert>
      </Fade>
    </Box>
  );
};

export default PDFMerger; 