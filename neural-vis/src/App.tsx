import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Documentation from './components/network/documentation/Documentation';
import Experiments from './components/network/experiments/Experiments';
import Settings from './components/network/settings/Settings';
import LandingPage from './pages/LandingPage';
import NetworkPage from './pages/NetworkPage';
import { ThemeProvider, createTheme } from '@mui/material';
import { useSettingsStore } from './stores/settingsStore';

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