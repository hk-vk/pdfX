import { useState } from 'react'
import { 
  Box, 
  Container, 
  Tab, 
  Tabs, 
  Typography, 
  Paper, 
  ThemeProvider, 
  createTheme,
  CssBaseline,
  useMediaQuery,
  alpha,
} from '@mui/material'
import { motion } from 'framer-motion'
import PDFMerger from './components/PDFMerger'
import PDFSplitter from './components/PDFSplitter'
import PDFCompressor from './components/PDFCompressor'
import PDFToImages from './components/PDFToImages'
import Logo from './components/Logo'
import ThemeToggle from './components/ThemeToggle'
import GlassmorphicContainer from './components/GlassmorphicContainer'

// Create motion components
const MotionBox = motion(Box);
const MotionPaper = motion(Paper);

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [isDarkMode, setIsDarkMode] = useState(prefersDarkMode);
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };
  
  const toggleColorMode = () => {
    setIsDarkMode(!isDarkMode);
  };
  
  // Define light and dark mode colors
  const lightPalette = {
    primary: {
      main: '#4361ee',
      light: '#738eef',
      dark: '#3a4fd0',
    },
    secondary: {
      main: '#3a0ca3',
      light: '#5a3dba',
      dark: '#2a0979',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
    },
    error: {
      main: '#ef4444',
    },
    warning: {
      main: '#f59e0b',
    },
    info: {
      main: '#0ea5e9',
    },
    success: {
      main: '#10b981',
    },
  };
  
  const darkPalette = {
    primary: {
      main: '#60a5fa',
      light: '#93c5fd',
      dark: '#3b82f6',
    },
    secondary: {
      main: '#818cf8',
      light: '#a5b4fc',
      dark: '#6366f1',
    },
    background: {
      default: '#0f172a',
      paper: '#1e293b',
    },
    text: {
      primary: '#e2e8f0',
      secondary: '#94a3b8',
    },
    error: {
      main: '#f87171',
    },
    warning: {
      main: '#fbbf24',
    },
    info: {
      main: '#38bdf8',
    },
    success: {
      main: '#34d399',
    },
  };
  
  // Create theme based on color mode
  const theme = createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      ...(isDarkMode ? darkPalette : lightPalette),
    },
    typography: {
      fontFamily: '"Plus Jakarta Sans", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 700,
      },
      h2: {
        fontWeight: 700,
      },
      h3: {
        fontWeight: 600,
      },
      h4: {
        fontWeight: 600,
      },
      h5: {
        fontWeight: 600,
      },
      h6: {
        fontWeight: 600,
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 10,
            fontWeight: 600,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
          },
        },
      },
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarWidth: 'thin',
            scrollbarColor: '#6b7280 transparent',
            '&::-webkit-scrollbar': {
              width: '8px',
              height: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#6b7280',
              borderRadius: '20px',
              border: '2px solid transparent',
              backgroundClip: 'content-box',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              backgroundColor: '#4b5563',
            },
          },
        },
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ position: 'absolute', top: 20, right: 24 }}>
          <ThemeToggle isDarkMode={isDarkMode} toggleColorMode={toggleColorMode} variant="fancy" />
        </Box>
        
        <MotionBox 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            mb: 5
          }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <Box sx={{ mb: 3 }}>
            <Logo size="large" />
          </Box>
          <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', maxWidth: 600 }}>
            Your all-in-one PDF toolkit for merging, splitting, compressing, and converting PDF files - completely offline and secure.
          </Typography>
        </MotionBox>

        <GlassmorphicContainer
          sx={{ 
            overflow: 'hidden',
            borderRadius: 4,
            mb: 4,
            position: 'relative',
          }}
          blurStrength={16}
          backgroundOpacity={isDarkMode ? 0.2 : 0.1}
          borderOpacity={isDarkMode ? 0.2 : 0.1}
          motionProps={{
            initial: { opacity: 0, y: 40 },
            animate: { opacity: 1, y: 0 },
            transition: { 
              type: "spring",
              stiffness: 100,
              damping: 20,
              delay: 0.3
            }
          }}
        >
          <Box sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            bgcolor: theme => alpha(theme.palette.background.paper, isDarkMode ? 0.6 : 0.8),
            backdropFilter: 'blur(16px)',
          }}>
            <Tabs 
              value={currentTab} 
              onChange={handleTabChange}
              variant="fullWidth"
              aria-label="PDF tools"
              sx={{
                '& .MuiTabs-indicator': {
                  height: 3,
                  borderRadius: '3px 3px 0 0',
                  background: isDarkMode 
                    ? 'linear-gradient(90deg, #60a5fa, #3b82f6)' 
                    : 'linear-gradient(90deg, #4361ee, #3a0ca3)',
                },
                '& .MuiTab-root': {
                  transition: 'all 0.3s',
                  '&.Mui-selected': {
                    color: isDarkMode ? '#60a5fa' : '#4361ee',
                    fontWeight: 700,
                    transform: 'translateY(-2px)',
                  },
                  '&:hover': {
                    color: isDarkMode ? '#93c5fd' : '#738eef',
                    opacity: 0.9,
                  }
                },
              }}
            >
              <Tab 
                label="Merge PDFs" 
                sx={{ py: 2 }}
              />
              <Tab 
                label="Split PDF" 
                sx={{ py: 2 }}
              />
              <Tab 
                label="Compress PDF" 
                sx={{ py: 2 }}
              />
              <Tab 
                label="PDF to Images" 
                sx={{ py: 2 }}
              />
            </Tabs>
          </Box>

          <TabPanel value={currentTab} index={0}>
            <PDFMerger />
          </TabPanel>
          <TabPanel value={currentTab} index={1}>
            <PDFSplitter />
          </TabPanel>
          <TabPanel value={currentTab} index={2}>
            <PDFCompressor />
          </TabPanel>
          <TabPanel value={currentTab} index={3}>
            <PDFToImages />
          </TabPanel>
        </GlassmorphicContainer>
        
        <Box 
          component="footer" 
          sx={{ 
            mt: 4, 
            py: 3, 
            textAlign: 'center',
            opacity: 0.7,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            pdfX • Secure PDF Manipulation, Completely Client-Side • {new Date().getFullYear()}
          </Typography>
        </Box>
      </Container>
    </ThemeProvider>
  )
}

export default App
