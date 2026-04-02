import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import WardDashboard from './pages/WardDashboard';
import PatientFormPage from './pages/PatientFormPage';
import ArchivePage from './pages/ArchivePage';
import PatientDetailPage from './pages/PatientDetailPage';
import SettingsModal from './components/SettingsModal';
import { usePatientStore } from './store/usePatientStore';
import './index.css';

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Just to initialize the store and trigger background sync on app mount
  usePatientStore();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout setIsSettingsOpen={setIsSettingsOpen} />}>
          <Route index element={<WardDashboard />} />
          <Route path="add" element={<PatientFormPage />} />
          <Route path="archive" element={<ArchivePage />} />
          <Route path="patient/:id" element={<PatientDetailPage />} />
        </Route>
      </Routes>

      {/* Settings Modal is preserved as a popup globally accessible from MainLayout */}
      {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} />}
    </BrowserRouter>
  );
}

export default App;
