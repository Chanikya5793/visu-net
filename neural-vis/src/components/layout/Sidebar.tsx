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

const DRAWER_WIDTH = 240;

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/' },
  { text: 'Neural Network', icon: <BubbleChart />, path: '/network' },
  { text: 'Documentation', icon: <Description />, path: '/docs' },
  { text: 'Experiments', icon: <Science />, path: '/experiments' },
  { text: 'Settings', icon: <Settings />, path: '/settings' },
];

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
