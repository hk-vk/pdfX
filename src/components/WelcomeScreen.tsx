import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Grid, Paper, useTheme, useMediaQuery } from '@mui/material';
import { motion } from 'framer-motion';
import { 
  MergeType as MergeIcon, 
  ContentCut as SplitIcon, 
  Compress as CompressIcon, 
  Image as ImageIcon,
  ArrowForward as ArrowIcon
} from '@mui/icons-material';
import Logo from './Logo';

// Create motion components
const MotionPaper = motion(Paper);

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon, path }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  
  return (
    <MotionPaper
      elevation={0}
      onClick={() => navigate(path)}
      whileHover={{ 
        y: -5,
        boxShadow: theme.palette.mode === 'light' 
          ? '0 10px 30px rgba(0, 0, 0, 0.1)' 
          : '0 10px 30px rgba(0, 0, 0, 0.3)'
      }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      sx={{
        p: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.mode === 'light' 
          ? 'rgba(255, 255, 255, 0.8)' 
          : 'rgba(31, 31, 31, 0.8)',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.3s ease',
        '&:hover': {
          borderColor: theme.palette.primary.main,
          '& .arrow-icon': {
            transform: 'translateX(4px)',
            opacity: 1,
          }
        }
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 1.5,
        color: theme.palette.primary.main
      }}>
        {icon}
        <ArrowIcon 
          className="arrow-icon" 
          sx={{ 
            ml: 'auto', 
            opacity: 0.5,
            transition: 'all 0.3s ease'
          }} 
        />
      </Box>
      <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
        {description}
      </Typography>
    </MotionPaper>
  );
};

const WelcomeScreen: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const features = [
    {
      title: 'Merge PDFs',
      description: 'Combine multiple PDF files into a single document',
      icon: <MergeIcon fontSize="large" />,
      path: '/merge-pdfs'
    },
    {
      title: 'Split PDF',
      description: 'Extract specific pages or split a PDF into multiple files',
      icon: <SplitIcon fontSize="large" />,
      path: '/split-pdf'
    },
    {
      title: 'Compress PDF',
      description: 'Reduce PDF file size while maintaining quality',
      icon: <CompressIcon fontSize="large" />,
      path: '/compress-pdf'
    },
    {
      title: 'PDF to Images',
      description: 'Convert PDF pages to image formats like PNG or JPEG',
      icon: <ImageIcon fontSize="large" />,
      path: '/pdf-to-images'
    }
  ];

  return (
    <Box sx={{ 
      maxWidth: '1200px', 
      mx: 'auto', 
      p: { xs: 2, sm: 3, md: 4 },
    }}>
      <Box 
        sx={{ 
          mb: 4, 
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Logo />
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom
          sx={{ 
            mt: 2,
            fontWeight: 800,
            fontFamily: "'Montserrat', sans-serif",
            fontSize: { xs: '2.5rem', sm: '3.5rem' },
            background: theme.palette.mode === 'dark' 
              ? 'linear-gradient(135deg, #8a7fbd 0%, #cd6f47 100%)' 
              : 'linear-gradient(135deg, #6c5dac 0%, #b05730 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textFillColor: 'transparent',
            letterSpacing: '-2px',
            textTransform: 'uppercase'
          }}
        >
          pdfX
        </Typography>
        <Typography 
          variant="h6" 
          color="text.secondary" 
          sx={{ 
            maxWidth: '600px',
            mb: 2,
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 500
          }}
        >
          Transform your PDFs with superpowers! 🚀
        </Typography>
      </Box>

      <Typography 
        variant="h5" 
        component="h2" 
        sx={{ 
          mb: 3, 
          fontWeight: 600,
          textAlign: { xs: 'center', sm: 'left' },
          fontFamily: "'Montserrat', sans-serif",
        }}
      >
        What PDF magic shall we perform today? ✨
      </Typography>

      <Grid container spacing={3}>
        {features.map((feature) => (
          <Grid item xs={12} sm={6} md={3} key={feature.title}>
            <FeatureCard {...feature} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default WelcomeScreen; 