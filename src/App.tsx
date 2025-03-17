import React, { useState, useMemo } from 'react';
import { 
  Box, 
  Container, 
  CssBaseline, 
  ThemeProvider, 
  createTheme, 
  useMediaQuery,
  Typography,
  IconButton,
  Tabs,
  Tab,
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
} from '@mui/material';
import { 
  Brightness4 as DarkModeIcon, 
  Brightness7 as LightModeIcon,
  Menu as MenuIcon,
  MergeType as MergeIcon,
  ContentCut as SplitIcon,
  Compress as CompressIcon,
  Image as ImageIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PDFMerger from "./components/PDFMerger";
import PDFSplitter from "./components/PDFSplitter";
import PDFCompressor from "./components/PDFCompressor";
import PDFToImages from "./components/PDFToImages";
import Logo from "./components/Logo";
import ThemeToggle from "./components/ThemeToggle";
import GlassmorphicContainer from "./components/GlassmorphicContainer";
import WelcomeScreen from "./components/WelcomeScreen";

const MotionBox = motion(Box);

function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [mode, setMode] = useState<'light' | 'dark'>(prefersDarkMode ? 'dark' : 'light');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  // Define color palettes
  const lightPalette = {
    primary: {
      main: '#4361ee',
      light: '#738eef',
      dark: '#3a0ca3',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#7209b7',
      light: '#9d4eca',
      dark: '#560a86',
      contrastText: '#ffffff',
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
      main: '#3b82f6',
    },
    success: {
      main: '#10b981',
    },
  };

  const darkPalette = {
    primary: {
      main: '#4361ee',
      light: '#738eef',
      dark: '#3a0ca3',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#9d4eca',
      light: '#c77fde',
      dark: '#7209b7',
      contrastText: '#ffffff',
    },
    background: {
      default: '#0f172a',
      paper: '#1e293b',
    },
    text: {
      primary: '#f1f5f9',
      secondary: '#94a3b8',
    },
    error: {
      main: '#f87171',
    },
    warning: {
      main: '#fbbf24',
    },
    info: {
      main: '#60a5fa',
    },
    success: {
      main: '#34d399',
    },
  };

  // Create theme
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === 'light' ? lightPalette : darkPalette),
        },
        typography: {
          fontFamily: '"Geist Sans", "Plus Jakarta Sans", "Inter", sans-serif',
          h1: {
            fontWeight: 800,
          },
          h2: {
            fontWeight: 700,
          },
          h3: {
            fontWeight: 700,
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
          button: {
            fontWeight: 600,
            textTransform: 'none',
          },
        },
        shape: {
          borderRadius: 12,
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                boxShadow: 'none',
                textTransform: 'none',
                fontWeight: 600,
                padding: '8px 16px',
              },
              contained: {
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                '&:hover': {
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                },
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
              },
              rounded: {
                borderRadius: 12,
              },
            },
          },
          MuiTab: {
            styleOverrides: {
              root: {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.875rem',
              },
            },
          },
          MuiAppBar: {
            styleOverrides: {
              root: {
                boxShadow: mode === 'light' 
                  ? '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)' 
                  : '0 1px 3px rgba(0, 0, 0, 0.2), 0 1px 2px rgba(0, 0, 0, 0.3)',
                backgroundImage: 'none',
              },
            },
          },
          MuiDrawer: {
            styleOverrides: {
              paper: {
                backgroundImage: 'none',
              },
            },
          },
        },
      }),
    [mode]
  );

  const menuItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/' },
    { text: 'Merge PDFs', icon: <MergeIcon />, path: '/merge' },
    { text: 'Split PDF', icon: <SplitIcon />, path: '/split' },
    { text: 'Compress PDF', icon: <CompressIcon />, path: '/compress' },
    { text: 'PDF to Images', icon: <ImageIcon />, path: '/to-images' },
  ];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <AppBar 
            position="sticky" 
            color="default" 
            elevation={0}
            sx={{ 
              backdropFilter: 'blur(10px)',
              backgroundColor: theme => theme.palette.mode === 'light' 
                ? 'rgba(255, 255, 255, 0.8)' 
                : 'rgba(30, 41, 59, 0.8)',
              borderBottom: theme => `1px solid ${theme.palette.divider}`,
            }}
          >
            <Toolbar>
              <IconButton
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={toggleDrawer}
                sx={{ mr: 2, display: { sm: 'none' } }}
              >
                <MenuIcon />
              </IconButton>
              
              <Box 
                component={Link} 
                to="/" 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <Logo height={40} width={40} />
                <Typography 
                  variant="h6" 
                  component="div" 
                  sx={{ 
                    ml: 1.5, 
                    fontWeight: 700,
                    display: { xs: 'none', sm: 'block' },
                    fontFamily: '"Geist Sans", sans-serif',
                  }}
                >
                  pdfX
                </Typography>
              </Box>
              
              <Box sx={{ display: { xs: 'none', sm: 'block' }, ml: 4, flexGrow: 1 }}>
                <Tabs 
                  value={false} 
                  aria-label="navigation tabs"
                  sx={{
                    '& .MuiTab-root': {
                      minWidth: 'auto',
                      px: 2,
                      fontFamily: '"Geist Sans", sans-serif',
                    },
                  }}
                >
                  {menuItems.map((item) => (
                    <Tab
                      key={item.path}
                      label={item.text}
                      component={Link}
                      to={item.path}
                      icon={item.icon}
                      iconPosition="start"
                    />
                  ))}
                </Tabs>
              </Box>
              
              <Box sx={{ ml: 'auto' }}>
                <ThemeToggle 
                  isDarkMode={mode === 'dark'} 
                  toggleColorMode={toggleColorMode}
                  variant="fancy"
                />
              </Box>
            </Toolbar>
          </AppBar>
          
          <Drawer
            anchor="left"
            open={drawerOpen}
            onClose={toggleDrawer}
            sx={{
              '& .MuiDrawer-paper': {
                width: 280,
                boxSizing: 'border-box',
              },
            }}
          >
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
              <Logo height={32} width={32} />
              <Typography variant="h6" sx={{ ml: 1.5, fontWeight: 700, fontFamily: '"Geist Sans", sans-serif' }}>
                pdfX
              </Typography>
            </Box>
            <Divider />
            <List>
              {menuItems.map((item) => (
                <ListItem 
                  key={item.text} 
                  component={Link} 
                  to={item.path}
                  onClick={toggleDrawer}
                  sx={{
                    borderRadius: 2,
                    mx: 1,
                    mb: 0.5,
                    '&:hover': {
                      bgcolor: theme => theme.palette.mode === 'light' 
                        ? 'rgba(67, 97, 238, 0.08)' 
                        : 'rgba(67, 97, 238, 0.15)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{ 
                      fontFamily: '"Geist Sans", sans-serif',
                      fontWeight: 500,
                    }} 
                  />
                </ListItem>
              ))}
            </List>
          </Drawer>
          
          <Box component="main" sx={{ flexGrow: 1, py: 3, px: { xs: 2, sm: 3 } }}>
            <Routes>
              <Route path="/" element={<WelcomeScreen />} />
              <Route path="/merge" element={<PDFMerger />} />
              <Route path="/split" element={<PDFSplitter />} />
              <Route path="/compress" element={<PDFCompressor />} />
              <Route path="/to-images" element={<PDFToImages />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Box>
          
          <Box 
            component="footer" 
            sx={{ 
              py: 3, 
              px: 2, 
              mt: 'auto',
              textAlign: 'center',
              borderTop: theme => `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ fontFamily: '"Geist Sans", sans-serif' }}>
              © {new Date().getFullYear()} pdfX - All PDF processing happens in your browser for complete privacy
            </Typography>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
