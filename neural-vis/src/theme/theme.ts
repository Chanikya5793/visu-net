/**
 * Theme Configuration
 * 
 * Defines the application's theme settings using Material-UI's createTheme.
 * Provides both light and dark theme variants with consistent color palettes
 * and component style overrides.
 * 
 * Light Theme:
 * - Primary: Blue (#2196f3) with light/dark variants
 * - Secondary: Pink (#ff4081) with light/dark variants
 * - Background: Light gray (#f5f5f5) with white paper
 * - Custom component styles for AppBar and Drawer
 * 
 * Dark Theme:
 * - Primary: Light blue (#90caf9) with light/dark variants
 * - Secondary: Light pink (#f48fb1) with light/dark variants
 * - Background: Dark gray (#121212) with slightly lighter paper
 * - Custom component styles for dark mode AppBar and Drawer
 * 
 * Component Overrides:
 * - AppBar: Custom background and text colors
 * - Drawer: Custom background color and image settings
 * 
 * Usage:
 * Import the desired theme and use with Material-UI's ThemeProvider:
 * ```tsx
 * import { lightTheme, darkTheme } from './theme';
 * <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
 * ```
 */

import { createTheme } from '@mui/material/styles';

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2196f3',
      light: '#64b5f6',
      dark: '#1976d2',
    },
    secondary: {
      main: '#ff4081',
      light: '#ff79b0',
      dark: '#c60055',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#2196f3',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff',
          backgroundImage: 'none',
        },
      },
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
      light: '#e3f2fd',
      dark: '#42a5f5',
    },
    secondary: {
      main: '#f48fb1',
      light: '#fce4ec',
      dark: '#f06292',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e1e1e',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1e1e1e',
        },
      },
    },
  },
});
