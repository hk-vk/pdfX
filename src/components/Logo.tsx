import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  textColor?: string;
  variant?: 'horizontal' | 'vertical' | 'icon-only';
}

const Logo: React.FC<LogoProps> = ({ 
  size = 'medium', 
  showText = true, 
  textColor,
  variant = 'horizontal'
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  // Icon sizes based on the size prop
  const iconSizes = {
    small: 24,
    medium: 32,
    large: 48
  };
  
  // Font sizes for the text
  const fontSizes = {
    small: '1rem',
    medium: '1.5rem',
    large: '2.25rem'
  };
  
  // Gradient colors
  const gradientStart = isDarkMode ? '#60a5fa' : '#4361ee';
  const gradientEnd = isDarkMode ? '#3b82f6' : '#3a0ca3';
  
  // Icon element with animation
  const LogoIcon = (
    <motion.div
      whileHover={{ rotate: [0, -10, 0], scale: 1.05 }}
      transition={{ duration: 0.5 }}
    >
      <Box
        sx={{
          position: 'relative',
          width: iconSizes[size],
          height: iconSizes[size],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(135deg, ${gradientStart}, ${gradientEnd})`,
          borderRadius: '12px',
          boxShadow: `0 4px 12px ${isDarkMode ? 'rgba(59, 130, 246, 0.3)' : 'rgba(58, 12, 163, 0.25)'}`,
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: `conic-gradient(transparent, transparent, transparent, ${isDarkMode ? '#93c5fd' : '#4361ee'})`,
            animation: 'rotate 4s linear infinite',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: 3,
            borderRadius: '9px',
            background: isDarkMode ? '#1e293b' : 'white',
          },
          '@keyframes rotate': {
            '0%': {
              transform: 'rotate(0deg)',
            },
            '100%': {
              transform: 'rotate(360deg)',
            },
          },
        }}
      >
        <PictureAsPdfIcon 
          sx={{ 
            color: isDarkMode ? '#60a5fa' : '#4361ee',
            fontSize: iconSizes[size] * 0.7,
            position: 'relative',
            zIndex: 1,
          }} 
        />
      </Box>
    </motion.div>
  );
  
  // Text element
  const LogoText = showText && (
    <Typography
      variant={size === 'small' ? 'h6' : size === 'medium' ? 'h5' : 'h4'}
      component="span"
      sx={{
        fontWeight: 700,
        letterSpacing: '-0.05em',
        color: textColor || 'inherit',
        ml: variant === 'horizontal' ? 1 : 0,
        mt: variant === 'vertical' ? 1 : 0,
        fontSize: fontSizes[size],
      }}
    >
      <Box component="span" sx={{ color: isDarkMode ? '#60a5fa' : '#4361ee' }}>pdf</Box>
      <Box 
        component="span" 
        sx={{ 
          background: `linear-gradient(135deg, ${gradientStart}, ${gradientEnd})`,
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontStyle: 'italic',
          fontWeight: 800,
        }}
      >
        X
      </Box>
    </Typography>
  );
  
  if (variant === 'icon-only') {
    return LogoIcon;
  }
  
  return (
    <Box 
      sx={{
        display: 'flex',
        alignItems: 'center',
        flexDirection: variant === 'vertical' ? 'column' : 'row',
      }}
    >
      {LogoIcon}
      {LogoText}
    </Box>
  );
};

export default Logo; 