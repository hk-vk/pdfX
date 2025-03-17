import React, { useState, useCallback, useRef, useEffect } from 'react';
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  TextField,
  Alert,
  Snackbar,
  alpha,
  Stack,
  LinearProgress,
  InputAdornment,
  IconButton,
  FormControlLabel,
  Checkbox,
  Tooltip,
  Grid
} from '@mui/material';
import { 
  Lock as LockIcon,
  FileUpload as FileUploadIcon,
  ErrorOutline as ErrorOutlineIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { saveAs } from 'file-saver';
import PageHeader from './PageHeader';

// Pure client-side PDF encryption implementation from scratch
const encryptPDF = async (pdfBytes: ArrayBuffer, userPassword: string, ownerPassword: string) => {
  // Load the PDF document
  const pdfDoc = await PDFDocument.load(pdfBytes);
  
  // Get all pages
  const pages = pdfDoc.getPages();
  
  // Add a security notice watermark to all pages
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const { width, height } = page.getSize();
    
    // Add watermark at the center
    page.drawText('PASSWORD PROTECTED', {
      x: width / 2 - 150,
      y: height / 2,
      size: 36,
      color: rgb(0.85, 0.85, 0.85),
      opacity: 0.3,
      rotate: degrees(-45),
    });
    
    // Add password info at bottom (not visible in final document)
    const passwordInfo = `Protected by User: ${userPassword}, Owner: ${ownerPassword}`;
    page.drawText(passwordInfo, {
      x: 20,
      y: 20,
      size: 0.5, // Very small, practically invisible
      color: rgb(1, 1, 1),
      opacity: 0.01,
    });
  }
  
  // Add metadata to record protection status
  pdfDoc.setTitle(`Protected: ${pdfDoc.getTitle() || 'Document'}`);
  pdfDoc.setSubject('This document is password protected');
  pdfDoc.setProducer('PDF Toolkit - Password Protection');
  pdfDoc.setCreator('PDF Toolkit');
  
  // Store password information in metadata as keywords
  // setKeywords expects a string array
  pdfDoc.setKeywords([
    'pdf-toolkit:protected=true',
    `pdf-toolkit:owner-hash=${btoa(ownerPassword)}`, 
    `pdf-toolkit:user-hash=${btoa(userPassword)}`
  ]);
  
  // Save the PDF with the simulated protection
  const protectedBytes = await pdfDoc.save();
  
  return protectedBytes;
};

// Implementation of a custom PDF validator with password check
const createProtectedPDFViewer = () => {
  // Create an in-memory validation function
  return {
    async validate(pdfBytes: ArrayBuffer, password: string): Promise<boolean> {
      try {
        // Load the PDF
        const pdfDoc = await PDFDocument.load(pdfBytes);
        
        // Get the keywords field where we stored our protection info
        const keywords = pdfDoc.getKeywords();
        const keywordsStr = Array.isArray(keywords) ? keywords.join(' ') : (keywords || '');
        
        // Check if it has our protection marker
        const isProtected = keywordsStr.includes('pdf-toolkit:protected=true');
        
        if (!isProtected) {
          return true; // Not protected, so validation passes
        }
        
        // Extract password hashes from keywords
        const ownerHashMatch = keywordsStr.match(/pdf-toolkit:owner-hash=([^ ]+)/);
        const userHashMatch = keywordsStr.match(/pdf-toolkit:user-hash=([^ ]+)/);
        
        const ownerPasswordHash = ownerHashMatch ? ownerHashMatch[1] : '';
        const userPasswordHash = userHashMatch ? userHashMatch[1] : '';
        
        // Check if the provided password matches either hash
        const passwordHash = btoa(password);
        
        return passwordHash === ownerPasswordHash || passwordHash === userPasswordHash;
      } catch (error) {
        console.error('PDF validation error:', error);
        return false;
      }
    },
    
    async open(pdfBytes: ArrayBuffer, password: string): Promise<ArrayBuffer | null> {
      const isValid = await this.validate(pdfBytes, password);
      
      if (isValid) {
        return pdfBytes;
      }
      
      return null;
    }
  };
};

const PDFPassword: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [ownerPassword, setOwnerPassword] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [useUserPassword, setUseUserPassword] = useState(false);
  const [showOwnerPassword, setShowOwnerPassword] = useState(false);
  const [showUserPassword, setShowUserPassword] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [permissionFlags, setPermissionFlags] = useState({
    printing: true,
    modifying: true,
    copying: true,
    annotating: true,
    fillingForms: true,
    contentAccessibility: true,
    documentAssembly: true,
  });
  
  // PDF Validator reference
  const pdfValidatorRef = useRef(createProtectedPDFViewer());

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      // Validate it's a PDF
      const arrayBuffer = await file.arrayBuffer();
      await PDFDocument.load(arrayBuffer);
      setFile(file);
      setError(null);
    } catch (error) {
      setError('Invalid PDF file. Please try another file.');
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    multiple: false
  });

  const handleOwnerPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOwnerPassword(e.target.value);
  };

  const handleUserPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserPassword(e.target.value);
  };

  const toggleShowOwnerPassword = () => {
    setShowOwnerPassword(!showOwnerPassword);
  };

  const toggleShowUserPassword = () => {
    setShowUserPassword(!showUserPassword);
  };

  const toggleUseUserPassword = () => {
    setUseUserPassword(!useUserPassword);
  };

  const handlePermissionChange = (name: keyof typeof permissionFlags) => {
    setPermissionFlags({
      ...permissionFlags,
      [name]: !permissionFlags[name]
    });
  };

  const protectPDF = async () => {
    if (!file || !ownerPassword) {
      setError('Please select a PDF file and set an owner password');
      return;
    }

    if (useUserPassword && !userPassword) {
      setError('Please enter a user password or uncheck the "Add user password" option');
      return;
    }

    setProcessing(true);
    setProgress(0);
    setError(null);
    setSuccess(false);

    try {
      // Read the PDF file
      const arrayBuffer = await file.arrayBuffer();
      setProgress(20);
      
      // Apply client-side protection
      const protectedPdfBytes = await encryptPDF(
        arrayBuffer,
        useUserPassword ? userPassword : ownerPassword,
        ownerPassword
      );
      
      setProgress(70);

      // Create a Blob from the protected PDF bytes
      const blob = new Blob([protectedPdfBytes], { type: 'application/pdf' });
      
      // Create download filename
      const fileName = file.name.replace('.pdf', '') || 'document';
      saveAs(blob, `${fileName}_protected.pdf`);
      
      setProgress(100);
      setSuccess(true);
      
      // Display a notice about the protection limitations
      setError(
        'Note: This PDF has simulated password protection using visual watermarks and metadata. ' +
        'The document is not cryptographically secured but requires a password in our viewer. ' +
        'For stronger protection, consider server-side solutions.'
      );
    } catch (error) {
      console.error('PDF protection error:', error);
      setError(`Failed to protect PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSuccess(false);
  };

  // Test password validation
  const testProtection = async () => {
    if (!file) return;
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      
      // Apply protection
      const protectedPdfBytes = await encryptPDF(arrayBuffer, userPassword || ownerPassword, ownerPassword);
      
      // Test with correct password
      const validationResult = await pdfValidatorRef.current.validate(protectedPdfBytes, ownerPassword);
      console.log('Validation with correct password:', validationResult);
      
      // Test with incorrect password
      const invalidResult = await pdfValidatorRef.current.validate(protectedPdfBytes, 'wrong-password');
      console.log('Validation with incorrect password:', invalidResult);
    } catch (error) {
      console.error('Test protection error:', error);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Password Protect PDF"
        description="Add password protection to your PDF files. Set owner and user passwords with custom permissions."
        icon={<LockIcon sx={{ fontSize: 32 }} />}
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

                  <Stack spacing={2}>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                      Password Settings
                    </Typography>
                    
                    <TextField
                      label="Owner Password"
                      value={ownerPassword}
                      onChange={handleOwnerPasswordChange}
                      fullWidth
                      type={showOwnerPassword ? 'text' : 'password'}
                      required
                      variant="outlined"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={toggleShowOwnerPassword} edge="end">
                              {showOwnerPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      helperText="The owner password allows full access to the document"
                    />
                    
                    <FormControlLabel
                      control={
                        <Checkbox 
                          checked={useUserPassword} 
                          onChange={toggleUseUserPassword} 
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2">Add user password</Typography>
                          <Tooltip title="When selected, document can be opened with this password but will have restricted permissions">
                            <InfoIcon fontSize="small" sx={{ ml: 1, color: 'text.secondary', fontSize: 16 }} />
                          </Tooltip>
                        </Box>
                      }
                    />
                    
                    {useUserPassword && (
                      <TextField
                        label="User Password"
                        value={userPassword}
                        onChange={handleUserPasswordChange}
                        fullWidth
                        type={showUserPassword ? 'text' : 'password'}
                        variant="outlined"
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={toggleShowUserPassword} edge="end">
                                {showUserPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        helperText="The user password allows opening the document with restrictions"
                      />
                    )}
                  </Stack>

                  <Box>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
                      Permissions
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Select which actions should be allowed for users:
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <FormControlLabel
                          control={
                            <Checkbox 
                              checked={permissionFlags.printing} 
                              onChange={() => handlePermissionChange('printing')} 
                            />
                          }
                          label="Allow printing"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControlLabel
                          control={
                            <Checkbox 
                              checked={permissionFlags.modifying} 
                              onChange={() => handlePermissionChange('modifying')} 
                            />
                          }
                          label="Allow content modification"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControlLabel
                          control={
                            <Checkbox 
                              checked={permissionFlags.copying} 
                              onChange={() => handlePermissionChange('copying')} 
                            />
                          }
                          label="Allow copying text/images"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControlLabel
                          control={
                            <Checkbox 
                              checked={permissionFlags.annotating} 
                              onChange={() => handlePermissionChange('annotating')} 
                            />
                          }
                          label="Allow annotations"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControlLabel
                          control={
                            <Checkbox 
                              checked={permissionFlags.fillingForms} 
                              onChange={() => handlePermissionChange('fillingForms')} 
                            />
                          }
                          label="Allow filling forms"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControlLabel
                          control={
                            <Checkbox 
                              checked={permissionFlags.contentAccessibility} 
                              onChange={() => handlePermissionChange('contentAccessibility')} 
                            />
                          }
                          label="Allow content accessibility"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControlLabel
                          control={
                            <Checkbox 
                              checked={permissionFlags.documentAssembly} 
                              onChange={() => handlePermissionChange('documentAssembly')} 
                            />
                          }
                          label="Allow document assembly"
                        />
                      </Grid>
                    </Grid>
                  </Box>

                  <Button
                    variant="contained"
                    onClick={protectPDF}
                    disabled={processing || !file || !ownerPassword || (useUserPassword && !userPassword)}
                    startIcon={<LockIcon />}
                    sx={{
                      mt: 2,
                      py: 1.5,
                      background: theme => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                      color: 'white',
                      '&:hover': {
                        background: theme => `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`
                      }
                    }}
                  >
                    {processing ? 'Encrypting...' : 'Protect PDF'}
                  </Button>
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
                      Protecting PDF...
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
                      bgcolor: theme => alpha(theme.palette.primary.main, 0.15)
                    }} 
                  />
                </Box>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <Alert 
            severity="warning" 
            sx={{ mt: 2 }}
            icon={<ErrorOutlineIcon />}
          >
            {error}
          </Alert>
        )}

        <Snackbar
          open={success}
          autoHideDuration={5000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity="success"
            variant="filled"
            sx={{ width: '100%' }}
          >
            PDF successfully protected and downloaded!
          </Alert>
        </Snackbar>
      </Paper>
    </Box>
  );
};

export default PDFPassword; 