import React from 'react';
import { useTheme } from '@mui/material';

interface LogoProps {
  width?: number;
  height?: number;
}

const Logo: React.FC<LogoProps> = ({ width = 40, height = 40 }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  // Claude.ai inspired color palette
  const primaryColor = isDarkMode ? '#8a7fbd' : '#6c5dac'; // Claude purple
  const secondaryColor = isDarkMode ? '#cd6f47' : '#b05730'; // Claude orange/terracotta
  
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background shape */}
      <path
        d="M8 4h24a4 4 0 014 4v24a4 4 0 01-4 4H8a4 4 0 01-4-4V8a4 4 0 014-4z"
        fill={`url(#gradient-${isDarkMode ? 'dark' : 'light'})`}
      />
      
      {/* Text elements */}
      <text
        x="20"
        y="25"
        fontSize="16"
        fontWeight="bold"
        fontFamily="Montserrat, sans-serif"
        fill="white"
        textAnchor="middle"
        letterSpacing="0"
      >
        pdfX
      </text>
      
      {/* Decorative elements */}
      <path
        d="M12 30l4-4m12 4l-4-4"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.6"
      />

      <defs>
        <linearGradient
          id={`gradient-${isDarkMode ? 'dark' : 'light'}`}
          x1="4"
          y1="4"
          x2="36"
          y2="36"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor={primaryColor} />
          <stop offset="100%" stopColor={secondaryColor} />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default Logo; 