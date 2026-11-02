import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GasProvider } from './lib/store.jsx';
import { Layout } from './components/ui.jsx';
import AlarmOverlay from './components/AlarmOverlay.jsx';
import Dashboard from './pages/Dashboard.jsx';
import FloorUnit from './pages/FloorUnit.jsx';
import CeilingUnit from './pages/CeilingUnit.jsx';
import AlertsPage from './pages/AlertsPage.jsx';
import Refill from './pages/Refill.jsx';
import Family from './pages/Family.jsx';
import History from './pages/History.jsx';

export default function App() {
  return (
    <GasProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/floor" element={<FloorUnit />} />
            <Route path="/ceiling" element={<CeilingUnit />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/refill" element={<Refill />} />
            <Route path="/family" element={<Family />} />
            <Route path="/history" element={<History />} />
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </Layout>
        <AlarmOverlay />
      </BrowserRouter>
    </GasProvider>
  );
}
