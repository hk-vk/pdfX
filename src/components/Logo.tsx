import React from 'react';
import { useTheme, Typography, Box } from '@mui/material';

interface LogoProps {
  size?: 'small' | 'large';
}

const Logo: React.FC<LogoProps> = ({ size = 'small' }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Typography
        variant={size === 'large' ? 'h2' : 'h6'}
        component="span"
        sx={{
          fontFamily: "'Montserrat', sans-serif",
          fontWeight: 800,
          fontSize: size === 'large' ? { xs: '3rem', sm: '4rem' } : '1.5rem',
          letterSpacing: size === 'large' ? '-2px' : '-0.5px',
          background: isDarkMode
            ? 'linear-gradient(135deg, #8a7fbd 0%, #6c5dac 100%)'
            : 'linear-gradient(135deg, #6c5dac 0%, #41376c 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          textFillColor: 'transparent'
        }}
      >
        pdf
      </Typography>
      <Typography
        variant={size === 'large' ? 'h2' : 'h6'}
        component="span"
        sx={{
          fontFamily: "'Montserrat', sans-serif",
          fontWeight: 800,
          fontSize: size === 'large' ? { xs: '3rem', sm: '4rem' } : '1.5rem',
          letterSpacing: size === 'large' ? '-2px' : '-0.5px',
          background: isDarkMode
            ? 'linear-gradient(135deg, #cd6f47 0%, #b05730 100%)'
            : 'linear-gradient(135deg, #b05730 0%, #884325 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          textFillColor: 'transparent'
        }}
      >
        X
      </Typography>
    </Box>
  );
};

export default Logo; 