import React from 'react';
import { useTheme, Typography, Box } from '@mui/material';

interface LogoProps {
  width?: number;
  height?: number;
}

const Logo: React.FC<LogoProps> = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  return (
    <Typography
      variant="h6"
      sx={{
        fontFamily: "'Montserrat', sans-serif",
        fontWeight: 800,
        fontSize: '1.5rem',
        letterSpacing: '-0.5px',
        background: isDarkMode
          ? 'linear-gradient(135deg, #8a7fbd 0%, #cd6f47 100%)'
          : 'linear-gradient(135deg, #6c5dac 0%, #b05730 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        textFillColor: 'transparent',
        textTransform: 'uppercase'
      }}
    >
      pdfX
    </Typography>
  );
};

export default Logo; 