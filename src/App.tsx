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
  alpha
} from '@mui/material'
import PDFMerger from './components/PDFMerger'
import PDFSplitter from './components/PDFSplitter'
import PDFCompressor from './components/PDFCompressor'
import PDFToImages from './components/PDFToImages'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'

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
      id={`pdf-tabpanel-${index}`}
      aria-labelledby={`pdf-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function App() {
  const [currentTab, setCurrentTab] = useState(0)
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')

  const theme = createTheme({
    palette: {
      mode: prefersDarkMode ? 'dark' : 'light',
      primary: {
        main: '#4361ee',
      },
      secondary: {
        main: '#f72585',
      },
      background: {
        default: prefersDarkMode ? '#0f172a' : '#f8fafc',
        paper: prefersDarkMode ? '#1e293b' : '#ffffff',
      },
      error: {
        main: '#ef4444',
      },
      warning: {
        main: '#f59e0b',
      },
      info: {
        main: '#3b82f6',
      },
      success: {
        main: '#10b981',
      },
    },
    typography: {
      fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif",
      h1: {
        fontWeight: 800,
        letterSpacing: '-0.025em',
      },
      h2: {
        fontWeight: 800,
        letterSpacing: '-0.025em',
      },
      h3: {
        fontWeight: 700,
        letterSpacing: '-0.025em',
      },
      h4: {
        fontWeight: 700,
      },
      h5: {
        fontWeight: 600,
      },
      h6: {
        fontWeight: 600,
      },
      button: {
        textTransform: 'none',
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
            borderRadius: 12,
            padding: '10px 24px',
            fontWeight: 600,
            boxShadow: 'none',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(0, 0, 0, 0.12)',
            },
          },
          contained: {
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)',
          },
          containedPrimary: {
            background: 'linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: prefersDarkMode 
              ? '0 10px 40px rgba(0, 0, 0, 0.3)' 
              : '0 10px 40px rgba(0, 0, 0, 0.06)',
          },
          outlined: {
            borderColor: prefersDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '1rem',
            minHeight: 56,
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            height: 8,
            borderRadius: 4,
            backgroundColor: prefersDarkMode 
              ? 'rgba(67, 97, 238, 0.15)' 
              : 'rgba(67, 97, 238, 0.1)',
          },
          bar: {
            borderRadius: 4,
            background: 'linear-gradient(90deg, #4361ee, #3a0ca3)',
          },
        },
      },
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundImage: prefersDarkMode
              ? 'radial-gradient(circle at 50% 0%, #2d3748 0%, #1a202c 50%, #0f172a 100%)'
              : 'radial-gradient(circle at 50% 0%, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)',
            backgroundAttachment: 'fixed',
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 12,
          },
        },
      },
    },
  })

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue)
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          mb: 5
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            mb: 2
          }}>
            <Box sx={{
              p: 2,
              borderRadius: '50%',
              background: prefersDarkMode 
                ? 'linear-gradient(135deg, rgba(67, 97, 238, 0.2) 0%, rgba(58, 12, 163, 0.2) 100%)' 
                : 'linear-gradient(135deg, rgba(67, 97, 238, 0.1) 0%, rgba(58, 12, 163, 0.1) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: prefersDarkMode 
                ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
                : '0 8px 32px rgba(0, 0, 0, 0.06)',
              backdropFilter: 'blur(8px)',
            }}>
              <PictureAsPdfIcon sx={{ 
                fontSize: { xs: 40, md: 48 }, 
                color: 'primary.main' 
              }} />
            </Box>
            <Typography 
              variant="h3" 
              component="h1" 
              sx={{ 
                fontSize: { xs: '2rem', md: '2.5rem' },
                fontWeight: 800,
                background: 'linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.025em',
              }}
            >
              PDF Toolkit
            </Typography>
          </Box>
          <Typography 
            variant="subtitle1" 
            align="center" 
            color="text.secondary"
            sx={{ 
              maxWidth: 600,
              fontSize: '1.1rem',
              mb: 1
            }}
          >
            A fully offline PDF manipulation toolkit with all processing done in your browser
          </Typography>
          <Box sx={{
            display: 'inline-flex',
            alignItems: 'center',
            px: 2,
            py: 1,
            borderRadius: 6,
            bgcolor: theme => alpha(theme.palette.primary.main, 0.08),
            color: 'primary.main',
            fontSize: '0.875rem',
            fontWeight: 500,
            mt: 1,
          }}>
            <Box component="span" sx={{ 
              width: 8, 
              height: 8, 
              borderRadius: '50%', 
              bgcolor: 'success.main',
              mr: 1,
              boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.2)'
            }} />
            100% secure — all processing happens locally
          </Box>
        </Box>

        <Paper 
          elevation={0} 
          sx={{ 
            overflow: 'hidden',
            borderRadius: 4,
            mb: 4,
            position: 'relative',
            backdropFilter: 'blur(16px)',
            border: theme => `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            boxShadow: theme => prefersDarkMode 
              ? `0 20px 80px ${alpha(theme.palette.common.black, 0.3)}` 
              : `0 20px 80px ${alpha(theme.palette.primary.main, 0.08)}`,
          }}
        >
          <Box sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            bgcolor: theme => alpha(theme.palette.background.paper, 0.8),
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
                  background: 'linear-gradient(90deg, #4361ee, #3a0ca3)',
                },
                '& .MuiTab-root': {
                  transition: 'all 0.2s',
                  '&.Mui-selected': {
                    color: 'primary.main',
                    fontWeight: 700,
                  },
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
        </Paper>
        
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          mt: 6,
        }}>
          <Typography 
            variant="body2" 
            align="center" 
            color="text.secondary"
          >
            © {new Date().getFullYear()} PDF Toolkit • All processing happens in your browser • No files are uploaded
          </Typography>
          <Box sx={{
            display: 'flex',
            gap: 3,
            justifyContent: 'center',
            '& a': {
              color: 'text.secondary',
              textDecoration: 'none',
              fontSize: '0.875rem',
              transition: 'color 0.2s',
              '&:hover': {
                color: 'primary.main',
              }
            }
          }}>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Contact</a>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  )
}

export default App
