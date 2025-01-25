import { GitHub, LightMode, Menu } from '@mui/icons-material';
import { AppBar, IconButton, Toolbar, Typography, useTheme } from '@mui/material';
import { useContext } from 'react';
import { ColorModeContext } from './Layout';

interface NavbarProps {
  onMenuClick: () => void;
  isOpen: boolean;
}

export default function Navbar({ onMenuClick, isOpen }: NavbarProps) {
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: theme.zIndex.drawer + 1,
        transition: 'margin 225ms cubic-bezier(0.4, 0, 0.6, 1) 0ms',
        marginLeft: isOpen ? '240px' : 0,
        width: isOpen ? `calc(100% - 240px)` : '100%',
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="toggle drawer"
          onClick={onMenuClick}
          edge="start"
          sx={{ mr: 2 }}
        >
          <Menu />
        </IconButton>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          Neural Network Visualization
        </Typography>
        <IconButton color="inherit" onClick={colorMode.toggleColorMode}>
          <LightMode />
        </IconButton>
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
