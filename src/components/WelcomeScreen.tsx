import React from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  useTheme, 
  alpha,
  Container,
  Button
} from '@mui/material';
import { motion } from 'framer-motion';
import { 
  MergeType as MergeIcon,
  ContentCut as SplitIcon,
  Compress as CompressIcon,
  Image as ImageIcon,
  QuestionMark as QuestionIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import GlassmorphicContainer from './GlassmorphicContainer';

// Create motion components
const MotionBox = motion(Box);
const MotionPaper = motion(Paper);

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  to: string;
  delay: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, to, delay }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  return (
    <Grid item xs={12} sm={6} md={3}>
      <MotionBox
        component={Link}
        to={to}
        sx={{ 
          textDecoration: 'none',
          display: 'block',
          height: '100%'
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.5,
          delay: delay,
          ease: [0.25, 0.1, 0.25, 1.0]
        }}
        whileHover={{ y: -5 }}
      >
        <GlassmorphicContainer
          sx={{
            p: 3,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            borderRadius: 3,
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              transform: 'translateY(-5px)',
              borderColor: theme.palette.primary.main,
            },
          }}
        >
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.8)} 0%, ${alpha(theme.palette.primary.dark, 0.9)} 100%)`,
              color: 'white',
              boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
            }}
          >
            {icon}
          </Box>
          <Typography 
            variant="h6" 
            component="h3" 
            gutterBottom
            sx={{ 
              fontWeight: 600,
              fontFamily: '"Geist Sans", sans-serif',
            }}
          >
            {title}
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ 
              flex: 1,
              fontFamily: '"Geist Sans", sans-serif',
            }}
          >
            {description}
          </Typography>
        </GlassmorphicContainer>
      </MotionBox>
    </Grid>
  );
};

const WelcomeScreen: React.FC = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const features = [
    {
      icon: <MergeIcon fontSize="large" />,
      title: "Merge PDFs",
      description: "Combine multiple PDF files into a single document with drag-and-drop simplicity.",
      to: "/merge",
      delay: 0.1
    },
    {
      icon: <SplitIcon fontSize="large" />,
      title: "Split PDF",
      description: "Extract specific pages or split a PDF into multiple separate documents.",
      to: "/split",
      delay: 0.2
    },
    {
      icon: <CompressIcon fontSize="large" />,
      title: "Compress PDF",
      description: "Reduce file size while maintaining quality for easier sharing and storage.",
      to: "/compress",
      delay: 0.3
    },
    {
      icon: <ImageIcon fontSize="large" />,
      title: "PDF to Images",
      description: "Convert PDF pages to high-quality images in various formats and resolutions.",
      to: "/to-images",
      delay: 0.4
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <MotionBox
        sx={{ textAlign: 'center', mb: 8 }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center',
            alignItems: 'center',
            mb: 2
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.8)} 0%, ${alpha(theme.palette.primary.dark, 0.9)} 100%)`,
              color: 'white',
              boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.5)}`,
            }}
          >
            <QuestionIcon sx={{ fontSize: 40 }} />
          </Box>
        </Box>
        
        <Typography 
          variant="h2" 
          component="h1" 
          gutterBottom
          sx={{ 
            fontWeight: 800,
            fontFamily: '"Geist Sans", sans-serif',
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2
          }}
        >
          What would you like to do?
        </Typography>
        
        <Typography 
          variant="h6" 
          color="text.secondary"
          sx={{ 
            maxWidth: 600, 
            mx: 'auto',
            mb: 4,
            fontFamily: '"Geist Sans", sans-serif',
          }}
        >
          Select a tool below to get started with your PDF tasks.
          All processing happens right in your browser for maximum privacy.
        </Typography>
      </MotionBox>

      <Grid container spacing={3}>
        {features.map((feature) => (
          <FeatureCard
            key={feature.title}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
            to={feature.to}
            delay={feature.delay}
          />
        ))}
      </Grid>

      <MotionBox
        sx={{ 
          mt: 8, 
          textAlign: 'center',
          p: 4,
          borderRadius: 4,
          bgcolor: alpha(theme.palette.primary.main, isDarkMode ? 0.15 : 0.05),
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Typography 
          variant="h6" 
          gutterBottom
          sx={{ 
            fontWeight: 600,
            fontFamily: '"Geist Sans", sans-serif',
          }}
        >
          Need more advanced features?
        </Typography>
        <Typography 
          variant="body1"
          sx={{ 
            mb: 3,
            fontFamily: '"Geist Sans", sans-serif',
          }}
        >
          We're constantly adding new tools to make your PDF workflow easier.
        </Typography>
        <Button 
          variant="outlined" 
          color="primary"
          component="a"
          href="https://github.com/hk-vk/pdfX"
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1,
            fontFamily: '"Geist Sans", sans-serif',
          }}
        >
          Visit GitHub Repository
        </Button>
      </MotionBox>
    </Container>
  );
};

export default WelcomeScreen; 