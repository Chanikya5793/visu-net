/**
 * Navbar Component
 * 
 * A responsive navigation bar that adapts to sidebar state and provides core navigation functionality.
 * 
 * Features:
 * - Responsive layout that adjusts with sidebar state
 * - Theme toggle button
 * - GitHub repository link
 * - Hamburger menu for sidebar toggle
 * 
 * Props:
 * @param {() => void} onMenuClick - Callback function for menu button click
 * @param {boolean} isOpen - Current state of the sidebar
 * @param {React.RefObject<HTMLButtonElement>} menuButtonRef - Reference to menu button for accessibility
 */

import { GitHub, LightMode, Menu } from '@mui/icons-material';
import { AppBar, IconButton, Toolbar, Typography, useTheme } from '@mui/material';
import { useContext } from 'react';
import { ColorModeContext } from './Layout';

interface NavbarProps {
  onMenuClick: () => void;
  isOpen: boolean;
  menuButtonRef: React.RefObject<HTMLButtonElement>;
}

export default function Navbar({ onMenuClick, isOpen, menuButtonRef }: NavbarProps) {
  // Access theme object for styling and transitions
  const theme = useTheme();
  // Access color mode context for theme toggling
  const colorMode = useContext(ColorModeContext);

  return (
    <AppBar
      position="fixed"
      sx={{
        // Ensure navbar stays above other content
        zIndex: theme.zIndex.drawer + 1,
        // Smooth transition for sidebar interaction
        transition: 'margin 225ms cubic-bezier(0.4, 0, 0.6, 1) 0ms',
        // Adjust margin and width based on sidebar state
        marginLeft: isOpen ? '240px' : 0,
        width: isOpen ? `calc(100% - 240px)` : '100%',
      }}
    >
      <Toolbar>
        {/* Hamburger menu button */}
        <IconButton
          color="inherit"
          aria-label="toggle drawer"
          onClick={onMenuClick}
          edge="start"
          ref={menuButtonRef}
          sx={{ mr: 2 }}
        >
          <Menu />
        </IconButton>
        {/* Application title */}
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          Neural Network Visualization
        </Typography>
        {/* Theme toggle button */}
        <IconButton color="inherit" onClick={colorMode.toggleColorMode}>
          <LightMode />
        </IconButton>
        {/* GitHub repository link */}
        <IconButton
          color="inherit"
          href="https://github.com/yourusername/neural-vis"
          target="_blank"
        >
          <GitHub />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}
