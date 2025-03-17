import { createTheme, ThemeOptions } from '@mui/material/styles';
import { PaletteMode } from '@mui/material';

// Create a theme instance for each mode
const getThemeOptions = (mode: PaletteMode): ThemeOptions => {
  const isDark = mode === 'dark';

  return {
    palette: {
      mode,
      primary: {
        main: isDark ? '#8a7fbd' : '#6c5dac', // Claude purple
        light: isDark ? '#a9a1ce' : '#8a7fbd',
        dark: isDark ? '#6c5dac' : '#41376c',
        contrastText: '#ffffff',
      },
      secondary: {
        main: isDark ? '#cd6f47' : '#b05730', // Claude orange/terracotta
        light: isDark ? '#d88e6f' : '#cd6f47',
        dark: isDark ? '#b05730' : '#884325',
        contrastText: '#ffffff',
      },
      error: {
        main: '#ef4444',
        light: '#f87171',
        dark: '#dc2626',
      },
      warning: {
        main: '#f59e0b',
        light: '#fbbf24',
        dark: '#d97706',
      },
      info: {
        main: '#3b82f6',
        light: '#60a5fa',
        dark: '#2563eb',
      },
      success: {
        main: isDark ? '#34d399' : '#10b981',
        light: isDark ? '#6ee7b7' : '#34d399',
        dark: isDark ? '#10b981' : '#059669',
      },
      text: {
        primary: isDark ? '#f0eee5' : '#121212',
        secondary: isDark ? '#d1d5db' : '#6b7280',
        disabled: isDark ? '#6b7280' : '#d1d5db',
      },
      background: {
        default: isDark ? '#121212' : '#f0eee5', // Claude cream background
        paper: isDark ? '#1f1f1f' : '#ffffff',
      },
      divider: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
      action: {
        active: isDark ? '#e5e7eb' : '#4b5563',
        hover: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
        selected: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
        disabled: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
        disabledBackground: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
      },
    },
    typography: {
      fontFamily: '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
      h1: {
        fontWeight: 700,
        fontSize: '2.5rem',
        lineHeight: 1.2,
        letterSpacing: '-0.02em',
      },
      h2: {
        fontWeight: 600,
        fontSize: '2rem',
        lineHeight: 1.2,
        letterSpacing: '-0.02em',
      },
      h3: {
        fontWeight: 600,
        fontSize: '1.75rem',
        lineHeight: 1.2,
        letterSpacing: '-0.01em',
      },
      h4: {
        fontWeight: 600,
        fontSize: '1.5rem',
        lineHeight: 1.2,
        letterSpacing: '-0.01em',
      },
      h5: {
        fontWeight: 600,
        fontSize: '1.25rem',
        lineHeight: 1.2,
      },
      h6: {
        fontWeight: 600,
        fontSize: '1rem',
        lineHeight: 1.2,
      },
      subtitle1: {
        fontWeight: 500,
        fontSize: '1rem',
        lineHeight: 1.5,
      },
      subtitle2: {
        fontWeight: 500,
        fontSize: '0.875rem',
        lineHeight: 1.5,
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.6,
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.6,
      },
      button: {
        fontWeight: 500,
        fontSize: '0.875rem',
        textTransform: 'none',
        letterSpacing: '0.01em',
      },
      caption: {
        fontSize: '0.75rem',
        lineHeight: 1.5,
      },
      overline: {
        fontSize: '0.75rem',
        fontWeight: 500,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
      },
    },
    shape: {
      borderRadius: 12,
    },
    shadows: [
      'none',
      '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    ],
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: 'none',
            fontWeight: 500,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none',
            },
          },
          contained: {
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            '&:hover': {
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            },
          },
          containedPrimary: {
            background: isDark 
              ? 'linear-gradient(135deg, #a9a1ce, #8a7fbd)'
              : 'linear-gradient(135deg, #6c5dac, #41376c)',
            '&:hover': {
              background: isDark 
                ? 'linear-gradient(135deg, #a9a1ce, #6c5dac)'
                : 'linear-gradient(135deg, #8a7fbd, #6c5dac)',
            },
          },
          containedSecondary: {
            background: isDark 
              ? 'linear-gradient(135deg, #d88e6f, #cd6f47)'
              : 'linear-gradient(135deg, #b05730, #884325)',
            '&:hover': {
              background: isDark 
                ? 'linear-gradient(135deg, #d88e6f, #b05730)'
                : 'linear-gradient(135deg, #cd6f47, #b05730)',
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: 'none',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            backgroundColor: isDark 
              ? 'rgba(18, 18, 18, 0.8)'
              : 'rgba(240, 238, 229, 0.8)',
            borderBottom: '1px solid',
            borderColor: isDark 
              ? 'rgba(255, 255, 255, 0.1)'
              : 'rgba(0, 0, 0, 0.05)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            border: '1px solid',
            borderColor: isDark 
              ? 'rgba(255, 255, 255, 0.05)'
              : 'rgba(0, 0, 0, 0.05)',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              transform: 'translateY(-2px)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
          elevation1: {
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          },
          elevation2: {
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          },
          elevation3: {
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          },
          elevation4: {
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          },
          elevation8: {
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          },
          elevation16: {
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          },
          elevation24: {
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? '#1f1f1f' : '#f0eee5',
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: '1px solid',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
          },
          head: {
            fontWeight: 600,
            color: isDark ? '#f0eee5' : '#121212',
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:last-child td': {
              borderBottom: 0,
            },
            '&:hover': {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.01)',
            },
          },
        },
      },
      MuiListItem: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            '&.Mui-selected': {
              backgroundColor: isDark ? 'rgba(138, 127, 189, 0.16)' : 'rgba(108, 93, 172, 0.08)',
              '&:hover': {
                backgroundColor: isDark ? 'rgba(138, 127, 189, 0.24)' : 'rgba(108, 93, 172, 0.16)',
              },
            },
            '&:hover': {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
            },
          },
        },
      },
      MuiListItemIcon: {
        styleOverrides: {
          root: {
            minWidth: 40,
            color: isDark ? '#a9a1ce' : '#6c5dac',
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontWeight: 500,
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 16,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          },
        },
      },
      MuiDialogTitle: {
        styleOverrides: {
          root: {
            fontSize: '1.25rem',
            fontWeight: 600,
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
          },
        },
      },
    },
  };
};

// Create theme instances
export const lightTheme = createTheme(getThemeOptions('light'));
export const darkTheme = createTheme(getThemeOptions('dark')); 