import React, { useState, useCallback, useEffect } from 'react';
import createModule from '@neslinesli93/qpdf-wasm';
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

// Constants for file paths in the virtual file system
const INPUT_FILE = '/input.pdf';
const OUTPUT_FILE = '/encrypted.pdf';
const INPUT_FOLDER = '/input';
const OUTPUT_FOLDER = '/output';

// Map permission flags to qpdf command arguments
const mapPermissionsToArgs = (permissionFlags: any, userPassword: string, ownerPassword: string) => {
  // Base arguments for encryption
  const args = [
    INPUT_FILE,
    '--encrypt',
    userPassword,
    ownerPassword,
    '256', // Use 256-bit encryption
    '--'
  ];

  // Add permissions
  if (!permissionFlags.printing) {
    args.push('--print=none');
  }
  
  if (!permissionFlags.modifying) {
    args.push('--modify=none');
  }
  
  if (!permissionFlags.copying) {
    args.push('--extract=n');
  }
  
  if (!permissionFlags.annotating) {
    args.push('--annotate=n');
  }
  
  if (!permissionFlags.fillingForms) {
    args.push('--form=n');
  }
  
  if (!permissionFlags.contentAccessibility) {
    args.push('--accessibility=n');
  }
  
  if (!permissionFlags.documentAssembly) {
    args.push('--assemble=n');
  }
  
  // Output file path
  args.push(OUTPUT_FILE);
  
  return args;
};

// Function to encrypt PDF using qpdf-wasm
const encryptPDF = async (pdfBytes: ArrayBuffer, userPassword: string, ownerPassword: string, permissionFlags: any): Promise<ArrayBuffer> => {
  try {
    // Initialize qpdf-wasm
    const qpdf = await createModule({
      locateFile: () => '/qpdf.wasm',
      noInitialRun: true,
      preRun: [
        (module: any) => {
          // Create directories in the virtual file system
          if (module.FS) {
            try {
              module.FS.mkdir(INPUT_FOLDER);
              module.FS.mkdir(OUTPUT_FOLDER);
            } catch (e) {
              console.warn("Error creating directories:", e);
            }
          }
        },
      ],
    });
    
    // Write the PDF to the virtual file system
    const uint8Array = new Uint8Array(pdfBytes);
    qpdf.FS.writeFile(INPUT_FILE, uint8Array);
    
    // Prepare command arguments
    const args = mapPermissionsToArgs(permissionFlags, userPassword, ownerPassword);
    
    // Execute the encryption command
    qpdf.callMain(args);
    
    // Read the encrypted file from the virtual file system
    const encryptedData = qpdf.FS.readFile(OUTPUT_FILE);
    
    // Clean up
    try {
      qpdf.FS.unlink(INPUT_FILE);
      qpdf.FS.unlink(OUTPUT_FILE);
    } catch (e) {
      console.warn('Error cleaning up files:', e);
    }
    
    return encryptedData.buffer;
  } catch (error) {
    console.error('Error encrypting PDF:', error);
    throw error;
  }
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
  const [qpdfInitialized, setQpdfInitialized] = useState(false);
  const [permissionFlags, setPermissionFlags] = useState({
    printing: true,
    modifying: true,
    copying: true,
    annotating: true,
    fillingForms: true,
    contentAccessibility: true,
    documentAssembly: true,
  });
  
  // Initialize qpdf-wasm
  useEffect(() => {
    const initQpdf = async () => {
      try {
        // Test if we can load qpdf-wasm
        await createModule({
          locateFile: () => '/qpdf.wasm',
          noInitialRun: true
        });
        setQpdfInitialized(true);
      } catch (err) {
        console.error('Failed to initialize qpdf-wasm:', err);
        setError('PDF encryption library failed to initialize. Please try again later.');
      }
    };
    
    initQpdf();
  }, []);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      // Validate it's a PDF by checking MIME type and extension
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        throw new Error('Selected file is not a PDF');
      }
      
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
    
    if (!qpdfInitialized) {
      setError('PDF encryption library is not initialized. Please try again later.');
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
      
      // Set the user password (if not using separate user password, use owner password for both)
      const effectiveUserPassword = useUserPassword ? userPassword : ownerPassword;
      
      // Apply real PDF encryption
      setProgress(40);
      const encryptedPdfBytes = await encryptPDF(
        arrayBuffer,
        effectiveUserPassword,
        ownerPassword,
        permissionFlags
      );
      
      setProgress(80);

      // Create a Blob from the encrypted PDF bytes
      const blob = new Blob([encryptedPdfBytes], { type: 'application/pdf' });
      
      // Create download filename
      const fileName = file.name.replace('.pdf', '') || 'document';
      saveAs(blob, `${fileName}_protected.pdf`);
      
      setProgress(100);
      setSuccess(true);
    } catch (error) {
      console.error('PDF protection error:', error);
      setError(`Failed to encrypt PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSuccess(false);
  };

  return (
    <Box>
      <PageHeader
        title="Password Protect PDF"
        description="Add secure password protection to your PDF files with 256-bit AES encryption."
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
                          <Typography variant="body2">Add separate user password</Typography>
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
                    disabled={processing || !file || !ownerPassword || (useUserPassword && !userPassword) || !qpdfInitialized}
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
                      Encrypting PDF...
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
            severity="error" 
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
            PDF successfully encrypted and downloaded!
          </Alert>
        </Snackbar>
      </Paper>
    </Box>
  );
};

export default PDFPassword; 