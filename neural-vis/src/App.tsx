import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout';
import LandingPage from './pages/LandingPage';
import NetworkPage from './pages/NetworkPage';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/network" element={<NetworkPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;