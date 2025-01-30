import { Box, CssBaseline, ThemeProvider, useMediaQuery } from '@mui/material';
import { createContext, useMemo, useRef, useState } from 'react';
import { darkTheme, lightTheme } from '../../theme/theme';
import { Footer } from './Footer';
import Navbar from './Navbar';
import OnboardingOverlay from './OnboardingOverlay';
import Sidebar from './Sidebar';

export const ColorModeContext = createContext({ 
  toggleColorMode: () => {},
  mode: 'light'
});

export default function Layout({ children }: { children: React.ReactNode }) {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [mode, setMode] = useState<'light' | 'dark'>(prefersDarkMode ? 'dark' : 'light');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
      mode,
    }),
    [mode]
  );

  const theme = useMemo(
    () => mode === 'light' ? lightTheme : darkTheme,
    [mode]
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <CssBaseline />
          <Navbar 
            onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            isOpen={isSidebarOpen}
            menuButtonRef={menuButtonRef}
          />
          <Sidebar 
            isOpen={isSidebarOpen} 
            onClose={() => setIsSidebarOpen(false)}
          />
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
