import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { motion } from 'framer-motion';

interface PageHeaderProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, description, icon }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  return (
    <Box sx={{ mb: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          {icon && (
            <Box 
              sx={{ 
                color: isDarkMode ? 'primary.light' : 'primary.main',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {icon}
            </Box>
          )}
          <Typography 
            variant="h4" 
            component="h1"
            sx={{ 
              fontWeight: 700,
              fontFamily: "'Montserrat', sans-serif",
              background: isDarkMode
                ? 'linear-gradient(135deg, #8a7fbd 0%, #6c5dac 100%)'
                : 'linear-gradient(135deg, #6c5dac 0%, #41376c 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textFillColor: 'transparent'
            }}
          >
            {title}
          </Typography>
        </Box>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{ 
            maxWidth: '600px',
            fontFamily: "'Montserrat', sans-serif"
          }}
        >
          {description}
        </Typography>
      </motion.div>
    </Box>
  );
};

export default PageHeader; 