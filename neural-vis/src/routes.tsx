/**
 * Application Routes and Navigation Configuration
 * 
 * This module defines the core routing structure and navigation components for the application.
 * It provides a centralized configuration for routes and a responsive sidebar navigation system.
 * 
 * Features:
 * - Centralized route definitions
 * - Responsive sidebar navigation
 * - Material-UI integration
 * - Icon-based menu items
 * - Persistent drawer implementation
 * 
 * Navigation Structure:
 * - Dashboard: Main overview and quick access
 * - Neural Network: Interactive visualization workspace
 * - Documentation: Comprehensive guides and references
 * - Experiments: Testing and experimentation interface
 * - Settings: Application configuration
 * 
 * Implementation:
 * - Uses React Router for routing
 * - Material-UI Drawer component for sidebar
 * - Responsive design with configurable width
 * - Icon-based navigation items
 * 
 * @module Routes
 */

import {
  BubbleChart,
  Dashboard,
  Description,
  Science,
  Settings
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
import Documentation from './components/network/documentation/Documentation';
import Experiments from './components/network/experiments/Experiments';
import SettingsPage from './components/settings/Settings';
import LandingPage from './pages/LandingPage';
import NetworkPage from './pages/NetworkPage';

// Fixed width for the drawer component
const DRAWER_WIDTH = 240;

/**
 * Props interface for the Sidebar component
 * @interface SidebarProps
 * @property {boolean} isOpen - Controls the visibility of the sidebar
 * @property {() => void} onClose - Callback function to close the sidebar
 */
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Navigation menu items configuration
 * Each item defines a route in the application
 */
const menuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/' },
  { text: 'Neural Network', icon: <BubbleChart />, path: '/network' },
  { text: 'Documentation', icon: <Description />, path: '/docs' },
  { text: 'Experiments', icon: <Science />, path: '/experiments' },
  { text: 'Settings', icon: <Settings />, path: '/settings' },
];

/**
 * Sidebar Component
 * 
 * A responsive navigation drawer that provides access to different sections of the application.
 * Implements Material-UI's persistent drawer pattern with custom styling.
 * 
 * @component
 * @param {SidebarProps} props - Component props
 */
export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const theme = useTheme();
  const navigate = useNavigate();

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
              <ListItemButton onClick={() => navigate(item.path)}>
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

/**
 * Application route configuration
 * Defines the mapping between paths and components
 */
export const routes = [
  {
    path: '/',
    element: <LandingPage />
  },
  {
    path: '/network',
    element: <NetworkPage />
  },
  {
    path: '/docs',
    element: <Documentation />
  },
  {
    path: '/experiments',
    element: <Experiments />
  },
  {
    path: '/settings',
    element: <SettingsPage />
  }
];