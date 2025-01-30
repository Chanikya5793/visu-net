/**
 * App Component
 * 
 * The root component of the Neural Network Visualization application.
 * It sets up the core application structure including routing, theming, and layout.
 * 
 * Features:
 * - Implements React Router for navigation
 * - Provides theme context using Material-UI ThemeProvider
 * - Integrates with settings store for theme preferences
 * - Wraps all routes in a consistent layout
 * 
 * Routes:
 * - / : Landing page with application overview
 * - /network : Interactive neural network visualization
 * - /docs : Comprehensive documentation and guides
 * - /experiments : Interface for running network experiments
 * - /settings : Application settings and preferences
 * 
 * Theme Management:
 * - Uses Material-UI's createTheme for consistent styling
 * - Supports dynamic dark/light mode switching
 * - Theme preferences persist across sessions
 * 
 * Layout Structure:
 * - Consistent header with navigation
 * - Responsive sidebar for easy access to features
 * - Main content area with route-specific components
 * 
 * State Management:
 * - Uses Zustand for global state management
 * - Settings store manages theme and visualization preferences
 * 
 * @component
 */

import { ThemeProvider, createTheme } from '@mui/material';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Documentation from './components/network/documentation/Documentation';
import Experiments from './components/network/experiments/Experiments';
import Settings from './components/network/settings/Settings';
import LandingPage from './pages/LandingPage';
import NetworkPage from './pages/NetworkPage';
import { useSettingsStore } from './stores/settingsStore';

/**
 * Main application component that sets up routing and theming.
 * Uses the settings store to determine the current theme mode.
 * 
 * @returns {JSX.Element} The root application component with routing and theme context
 */
function App() {
  const { darkMode } = useSettingsStore();
  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/network" element={<NetworkPage />} />
            <Route path="/docs" element={<Documentation />} />
            <Route path="/experiments" element={<Experiments />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;