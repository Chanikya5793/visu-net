/**
 * Sidebar Component
 * 
 * A responsive sidebar navigation component that provides the main navigation structure
 * for the application. It includes a persistent drawer that can be toggled on/off.
 * 
 * Features:
 * - Persistent drawer with smooth transitions
 * - Dynamic menu items with icons
 * - Responsive layout integration
 * - Auto-close on navigation (mobile-friendly)
 * 
 * Props:
 * @param {boolean} isOpen - Controls the visibility of the sidebar
 * @param {() => void} onClose - Callback function to close the sidebar
 */

import {
    BubbleChart,
    Dashboard,
    Description,
    Science,
    Settings as SettingsIcon
} from '@mui/icons-material';
import {
    Box,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
    useTheme
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Fixed width for the drawer component
const DRAWER_WIDTH = 240;

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// Navigation menu items configuration
const menuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/' },
  { text: 'Neural Network', icon: <BubbleChart />, path: '/network' },
  { text: 'Documentation', icon: <Description />, path: '/docs' },
  { text: 'Experiments', icon: <Science />, path: '/experiments' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const theme = useTheme();
  const navigate = useNavigate();

  // Handle navigation and sidebar closure
  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={isOpen}
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
        },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto' }}>
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton onClick={() => handleNavigation(item.path)}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
}
