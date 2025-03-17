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
      <rect
        x="4"
        y="4"
        width="32"
        height="32"
        rx="8"
        fill={`url(#gradient-${isDarkMode ? 'dark' : 'light'})`}
      />
      <path
        d="M12 14H28M12 20H28M12 26H22"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
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