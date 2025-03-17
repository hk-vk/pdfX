import React from 'react';
import { Box, BoxProps, useTheme, alpha } from '@mui/material';
import { motion, MotionProps } from 'framer-motion';

interface GlassmorphicContainerProps extends BoxProps {
  blurStrength?: number;
  borderOpacity?: number;
  backgroundOpacity?: number;
  hoverEffect?: boolean;
  motionProps?: MotionProps;
}

const GlassmorphicContainer: React.FC<GlassmorphicContainerProps> = ({
  children,
  blurStrength = 8,
  borderOpacity = 0.1,
  backgroundOpacity = 0.1,
  hoverEffect = false,
  motionProps,
  sx,
  ...props
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const baseStyles = {
    position: 'relative',
    background: isDarkMode
      ? alpha(theme.palette.background.paper, backgroundOpacity)
      : alpha(theme.palette.background.paper, backgroundOpacity),
    backdropFilter: `blur(${blurStrength}px)`,
    WebkitBackdropFilter: `blur(${blurStrength}px)`,
    border: '1px solid',
    borderColor: isDarkMode
      ? alpha(theme.palette.common.white, borderOpacity)
      : alpha(theme.palette.common.black, borderOpacity),
    transition: 'all 0.3s ease',
    '&::before': {
      content: '""',
      position: 'absolute',
      inset: 0,
      borderRadius: 'inherit',
      padding: '1px',
      background: `linear-gradient(135deg, ${
        isDarkMode
          ? alpha(theme.palette.primary.main, 0.2)
          : alpha(theme.palette.primary.main, 0.1)
      }, transparent)`,
      WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
      WebkitMaskComposite: 'xor',
      maskComposite: 'exclude',
      pointerEvents: 'none',
    },
    ...(hoverEffect && {
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: `0 8px 20px ${
          isDarkMode
            ? alpha(theme.palette.common.black, 0.3)
            : alpha(theme.palette.primary.main, 0.15)
        }`,
        borderColor: isDarkMode
          ? alpha(theme.palette.common.white, borderOpacity * 2)
          : alpha(theme.palette.common.black, borderOpacity * 2),
        '&::before': {
          background: `linear-gradient(135deg, ${
            isDarkMode
              ? alpha(theme.palette.primary.main, 0.3)
              : alpha(theme.palette.primary.main, 0.2)
          }, transparent)`,
        },
      },
    }),
    ...sx,
  };

  const Container = motionProps ? motion(Box) : Box;

  return (
    <Container
      {...props}
      {...(motionProps || {})}
      sx={baseStyles}
    >
      {children}
    </Container>
  );
};

export default GlassmorphicContainer; 