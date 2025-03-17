import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  ThemeProvider, 
  CssBaseline, 
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Container,
  useTheme,
  Grid
} from '@mui/material';
import {
  Menu as MenuIcon,
  Brightness4 as DarkIcon,
  Brightness7 as LightIcon,
  Home as HomeIcon,
  MergeType as MergeIcon,
  ContentCut as SplitIcon,
  Compress as CompressIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { lightTheme, darkTheme } from './theme';
import WelcomeScreen from './components/WelcomeScreen';
import PDFMerger from './components/PDFMerger';
import PDFSplitter from './components/PDFSplitter';
import PDFCompressor from './components/PDFCompressor';
import PDFToImages from './components/PDFToImages';
import Logo from './components/Logo';

// Create motion components
const MotionContainer = motion(Container);

// Wrapper component for page transitions
const PageTransition = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <MotionContainer
        key={location.pathname}
        maxWidth="xl"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        sx={{ 
          pt: { xs: 2, sm: 3 },
          pb: { xs: 4, sm: 6 },
          minHeight: 'calc(100vh - 140px)' // Account for header and footer
        }}
      >
        {children}
      </MotionContainer>
    </AnimatePresence>
  );
};

const App: React.FC = () => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [darkMode, setDarkMode] = useState(prefersDarkMode);
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  useEffect(() => {
    setDarkMode(prefersDarkMode);
  }, [prefersDarkMode]);

  const theme = darkMode ? darkTheme : lightTheme;
  
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const navItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/' },
    { text: 'Merge PDFs', icon: <MergeIcon />, path: '/merge-pdfs' },
    { text: 'Split PDF', icon: <SplitIcon />, path: '/split-pdf' },
    { text: 'Compress PDF', icon: <CompressIcon />, path: '/compress-pdf' },
    { text: 'PDF to Images', icon: <ImageIcon />, path: '/pdf-to-images' }
  ];

  const drawer = (
    <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
        <Logo />
      </Box>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem 
            component={Link} 
            to={item.path} 
            key={item.text}
            sx={{ 
              color: 'text.primary',
              textDecoration: 'none',
              '&:hover': {
                bgcolor: 'action.hover',
              }
            }}
          >
            <ListItemIcon sx={{ color: 'primary.main' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <AppBar 
            position="sticky" 
            elevation={0}
            sx={{ 
              bgcolor: 'background.paper',
              borderBottom: 1,
              borderColor: 'divider',
              backdropFilter: 'blur(10px)',
              zIndex: (theme) => theme.zIndex.drawer + 1
            }}
          >
            <Toolbar>
              <IconButton
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={toggleDrawer}
                sx={{ mr: 2 }}
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
                  color: 'text.primary'
                }}
              >
                <Logo size="small" />
              </Box>
              
              <Box sx={{ display: { xs: 'none', md: 'flex' }, ml: 4 }}>
                {navItems.slice(1).map((item) => (
                  <Box
                    component={Link}
                    to={item.path}
                    key={item.text}
                    sx={{
                      mx: 1.5,
                      py: 2,
                      color: 'text.primary',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      borderBottom: '2px solid transparent',
                      '&:hover': {
                        borderBottomColor: 'primary.main',
                        color: 'primary.main'
                      }
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {item.text}
                    </Typography>
                  </Box>
                ))}
              </Box>
              
              <Box sx={{ flexGrow: 1 }} />
              
              <IconButton color="inherit" onClick={toggleDarkMode}>
                {darkMode ? <LightIcon /> : <DarkIcon />}
              </IconButton>
            </Toolbar>
          </AppBar>
          
          <Drawer
            anchor="left"
            open={drawerOpen}
            onClose={toggleDrawer}
          >
            {drawer}
          </Drawer>
          
          <Box component="main" sx={{ flexGrow: 1 }}>
            <Routes>
              <Route path="/" element={<PageTransition><WelcomeScreen /></PageTransition>} />
              <Route path="/merge-pdfs" element={<PageTransition><PDFMerger /></PageTransition>} />
              <Route path="/split-pdf" element={<PageTransition><PDFSplitter /></PageTransition>} />
              <Route path="/compress-pdf" element={<PageTransition><PDFCompressor /></PageTransition>} />
              <Route path="/pdf-to-images" element={<PageTransition><PDFToImages /></PageTransition>} />
            </Routes>
          </Box>
          
          <Box 
            component="footer" 
            sx={{ 
              py: 4,
              px: 3,
              mt: 'auto',
              backgroundColor: theme.palette.mode === 'dark' 
                ? 'rgba(18, 18, 18, 0.8)'
                : 'rgba(240, 238, 229, 0.8)',
              backdropFilter: 'blur(10px)',
              borderTop: 1,
              borderColor: 'divider'
            }}
          >
            <Container maxWidth="lg">
              <Grid container spacing={4}>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ mb: 2 }}>
                    <Logo size="small" />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Transform your PDFs with powerful tools that work entirely in your browser.
                    Fast, secure, and completely offline.
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.primary" sx={{ mb: 2, fontWeight: 600 }}>
                    Quick Links
                  </Typography>
                  <Grid container spacing={1}>
                    {navItems.map((item) => (
                      <Grid item xs={6} key={item.text}>
                        <Link
                          to={item.path}
                          style={{ textDecoration: 'none' }}
                        >
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              '&:hover': {
                                color: 'primary.main',
                              }
                            }}
                          >
                            {item.text}
                          </Typography>
                        </Link>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.primary" sx={{ mb: 2, fontWeight: 600 }}>
                    About
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    pdfX is built with privacy in mind. All processing happens locally in your browser.
                    Your files never leave your device.
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    © {new Date().getFullYear()} pdfX. All rights reserved.
                  </Typography>
                </Grid>
              </Grid>
            </Container>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
};

export default App;
