import { Box, CssBaseline, ThemeProvider, useMediaQuery } from '@mui/material';
import { keyframes } from '@mui/system';
import { createContext, useEffect, useMemo, useRef, useState } from 'react';
import { darkTheme, lightTheme } from '../../theme/theme';
import { Footer } from './Footer';
import Navbar from './Navbar';
import OnboardingOverlay from './OnboardingOverlay';
import Sidebar from './Sidebar';

// Animation for the hint circle that appears for first-time visitors
const pulseAnimation = keyframes`
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.4;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

// Context for managing color mode (light/dark) across the application
export const ColorModeContext = createContext({ 
  toggleColorMode: () => {},
  mode: 'light'
});

// Main layout component that wraps the entire application
/**
 * Layout Component
 * 
 * A React component that provides the main application layout structure with responsive
 * sidebar, navbar, and content area. Manages theme switching and layout state.
 * 
 * Features:
 * - Responsive sidebar navigation
 * - Theme switching (light/dark mode)
 * - Persistent layout state
 * - First-time user hints
 * - Accessibility support
 * 
 * Props:
 * @param {React.ReactNode} children - Child components to render in the main content area
 * 
 * State Management:
 * - Theme mode (light/dark)
 * - Sidebar visibility
 * - First-time visitor hints
 * 
 * Layout Structure:
 * - Fixed top navigation bar
 * - Collapsible sidebar
 * - Main content area with padding
 * - Responsive breakpoints
 * 
 * Implementation:
 * - Uses Material-UI components and theming
 * - Context-based theme management
 * - Local storage for user preferences
 * - CSS-in-JS styling with emotion
 * 
 * @component
 */

export default function Layout({ children }: { children: React.ReactNode }) {
  // Detect user's system preference for dark mode
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  // State for managing theme mode
  const [mode, setMode] = useState<'light' | 'dark'>(prefersDarkMode ? 'dark' : 'light');
  // State for controlling sidebar visibility
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // State for showing first-time visitor hint
  const [showHint, setShowHint] = useState(true);
  // Reference to the menu button for accessibility
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Check if user has visited before and manage hint visibility
  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisitedBefore');
    if (hasVisited) {
      setShowHint(false);
    } else {
      localStorage.setItem('hasVisitedBefore', 'true');
    }
  }, []);

  // Memoized color mode context value to prevent unnecessary re-renders
  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
      mode,
    }),
    [mode]
  );

  // Memoized theme object based on current mode
  const theme = useMemo(
    () => mode === 'light' ? lightTheme : darkTheme,
    [mode]
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <CssBaseline />
          {/* First-time visitor hint animation */}
          {showHint && (
            <Box
              sx={{
                position: 'fixed',
                top: '15px',
                left: '15px',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                border: '2px solid',
                borderColor: 'primary.main',
                animation: `${pulseAnimation} 2s infinite`,
                zIndex: theme.zIndex.drawer + 2,
                pointerEvents: 'none'
              }}
            />
          )}
          {/* Main navigation bar */}
          <Navbar 
            onMenuClick={() => {
              setIsSidebarOpen(!isSidebarOpen);
              setShowHint(false);
            }} 
            isOpen={isSidebarOpen}
            menuButtonRef={menuButtonRef}
          />
          {/* Sidebar navigation */}
          <Sidebar 
            isOpen={isSidebarOpen} 
            onClose={() => setIsSidebarOpen(false)}
          />
          {/* Main content area with dynamic margin based on sidebar state */}
          <OnboardingOverlay anchorEl={menuButtonRef.current} />
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: 3,
              mt: 8,
              transition: 'margin 225ms cubic-bezier(0.4, 0, 0.6, 1) 0ms',
              marginLeft: isSidebarOpen ? '240px' : 0,
            }}
          >
            {children}
          </Box>
          <Footer />
        </Box>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
