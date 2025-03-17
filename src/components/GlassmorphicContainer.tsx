import React from 'react';
import { Box, useTheme, BoxProps } from '@mui/material';

interface GlassmorphicContainerProps extends BoxProps {
  variant?: 'default' | 'hover' | 'gradient' | 'accent' | 'card' | 'floating';
}

const GlassmorphicContainer: React.FC<GlassmorphicContainerProps> = ({
  children,
  variant = 'default',
  sx,
  ...props
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  return (
    <Box
      {...props}
      sx={{
        position: 'relative',
        background: isDarkMode 
          ? 'rgba(31, 31, 31, 0.7)' 
          : 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.3s ease',
        ...(variant === 'hover' && {
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 4,
            borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
          }
        }),
        ...(variant === 'gradient' && {
          background: isDarkMode 
            ? 'linear-gradient(135deg, rgba(31, 31, 31, 0.8) 0%, rgba(41, 41, 41, 0.8) 100%)' 
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(240, 240, 240, 0.8) 100%)',
          borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
        }),
        ...(variant === 'accent' && {
          borderLeft: '4px solid',
          borderLeftColor: 'primary.main',
        }),
        ...(variant === 'card' && {
          borderRadius: 2,
          boxShadow: 1,
          '&:hover': {
            boxShadow: 2,
          }
        }),
        ...(variant === 'floating' && {
          boxShadow: 2,
          border: 'none',
          '&:hover': {
            boxShadow: 4,
            transform: 'translateY(-4px)',
          }
        }),
        ...sx
      }}
    >
      {children}
    </Box>
  );
};

export default GlassmorphicContainer; 