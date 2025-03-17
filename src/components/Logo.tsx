import React from 'react';
import { Box, useTheme } from '@mui/material';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

export interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  height?: number;
  width?: number;
}

const Logo: React.FC<LogoProps> = ({ size = 'medium', height, width }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  // Determine size based on prop
  let logoSize = 40;
  if (size === 'small') logoSize = 32;
  if (size === 'large') logoSize = 64;
  
  // Use explicit height/width if provided
  const finalHeight = height || logoSize;
  const finalWidth = width || logoSize;

  return (
    <MotionBox
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, type: 'spring', stiffness: 120 }}
      sx={{
        height: finalHeight,
        width: finalWidth,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg
        width={finalWidth}
        height={finalHeight}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background Circle */}
        <circle 
          cx="32" 
          cy="32" 
          r="30" 
          fill={`url(#paint0_linear_${isDarkMode ? 'dark' : 'light'})`} 
        />
        
        {/* PDF Text */}
        <path 
          d="M16 24H22C24.2091 24 26 25.7909 26 28V28C26 30.2091 24.2091 32 22 32H16V24Z" 
          fill="white" 
        />
        <path 
          d="M16 32H20C22.2091 32 24 33.7909 24 36V36C24 38.2091 22.2091 40 20 40H16V32Z" 
          fill="white" 
        />
        <path 
          d="M28 24H34C36.2091 24 38 25.7909 38 28V28C38 30.2091 36.2091 32 34 32H28V24Z" 
          fill="white" 
        />
        <path 
          d="M28 32H32V40H28V32Z" 
          fill="white" 
        />
        <path 
          d="M40 24H48L44 32L48 40H40V24Z" 
          fill="white" 
        />
        
        {/* Gradient definitions */}
        <defs>
          <linearGradient 
            id="paint0_linear_light" 
            x1="10" 
            y1="10" 
            x2="54" 
            y2="54" 
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#4361EE" />
            <stop offset="1" stopColor="#3A0CA3" />
          </linearGradient>
          <linearGradient 
            id="paint0_linear_dark" 
            x1="10" 
            y1="10" 
            x2="54" 
            y2="54" 
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#60A5FA" />
            <stop offset="1" stopColor="#3B82F6" />
          </linearGradient>
        </defs>
      </svg>
    </MotionBox>
  );
};

export default Logo; 