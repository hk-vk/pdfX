import React from 'react';
import { IconButton, Box, useTheme, alpha } from '@mui/material';
import { motion } from 'framer-motion';
import { DarkMode as DarkModeIcon, LightMode as LightModeIcon } from '@mui/icons-material';

interface ThemeToggleProps {
  isDarkMode: boolean;
  toggleColorMode: () => void;
  variant?: 'simple' | 'fancy';
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  isDarkMode, 
  toggleColorMode,
  variant = 'simple'
}) => {
  const theme = useTheme();
  
  if (variant === 'simple') {
    return (
      <IconButton 
        onClick={toggleColorMode}
        sx={{
          color: theme => theme.palette.text.primary,
          transition: 'all 0.3s ease',
          '&:hover': {
            color: theme => theme.palette.primary.main,
            transform: 'scale(1.1)',
          }
        }}
      >
        {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>
    );
  }
  
  return (
    <motion.div
      initial={false}
      animate={{ 
        rotate: isDarkMode ? 180 : 0,
        scale: 1
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      transition={{ 
        type: "spring",
        stiffness: 200,
        damping: 10
      }}
    >
      <IconButton
        onClick={toggleColorMode}
        sx={{
          position: 'relative',
          width: 40,
          height: 40,
          borderRadius: '12px',
          background: theme => `linear-gradient(135deg, ${
            isDarkMode 
              ? alpha(theme.palette.primary.dark, 0.2)
              : alpha(theme.palette.primary.light, 0.2)
          }, ${
            isDarkMode
              ? alpha(theme.palette.primary.main, 0.1)
              : alpha(theme.palette.primary.main, 0.1)
          })`,
          backdropFilter: 'blur(10px)',
          border: '1px solid',
          borderColor: theme => isDarkMode 
            ? alpha(theme.palette.primary.main, 0.2)
            : alpha(theme.palette.primary.main, 0.1),
          boxShadow: theme => `0 4px 12px ${
            isDarkMode
              ? alpha(theme.palette.common.black, 0.3)
              : alpha(theme.palette.primary.main, 0.2)
          }`,
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: theme => `conic-gradient(
              transparent,
              transparent,
              transparent,
              ${isDarkMode ? theme.palette.primary.main : theme.palette.primary.light}
            )`,
            animation: 'rotate 4s linear infinite',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: 2,
            borderRadius: '10px',
            background: theme => isDarkMode 
              ? theme.palette.background.paper
              : theme.palette.background.default,
          },
          '@keyframes rotate': {
            '0%': {
              transform: 'rotate(0deg)',
            },
            '100%': {
              transform: 'rotate(360deg)',
            },
          },
          '&:hover': {
            '&::before': {
              animation: 'rotate 2s linear infinite',
            },
          },
        }}
      >
        <Box
          component={motion.div}
          animate={{
            scale: [1, 1.2, 1],
            rotate: isDarkMode ? [0, 180, 180] : [180, 0, 0],
          }}
          transition={{
            duration: 0.4,
            ease: "easeInOut",
          }}
          sx={{
            position: 'relative',
            zIndex: 1,
            color: theme => isDarkMode 
              ? theme.palette.primary.main
              : theme.palette.primary.main,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
        </Box>
      </IconButton>
    </motion.div>
  );
};

export default ThemeToggle; 