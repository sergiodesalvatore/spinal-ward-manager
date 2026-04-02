import React, { useState } from 'react';
import { ActivitySquare, Settings, Cloud, CloudOff } from 'lucide-react';
import WardDashboard from './pages/WardDashboard';
import SettingsModal from './components/SettingsModal';
import { usePatientStore } from './store/usePatientStore';
import './index.css';

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { syncUrl, isSyncing } = usePatientStore();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="app-bar">
        <div className="app-title">
          <ActivitySquare size={28} />
          Spinal Ward Manager
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.9 }}>
            {syncUrl ? (
              <span style={{ color: 'var(--md-sys-color-primary-container)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Cloud size={16} /> {isSyncing ? 'Sincronizzazione...' : 'Sincronizzato'}
              </span>
            ) : (
              <span style={{ color: 'var(--md-sys-color-surface-variant)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CloudOff size={16} /> Solo Locale
              </span>
            )}
          </div>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            title="Impostazioni Google Fogli"
          >
            <Settings size={22} className="hover:text-primary-container transition-colors" />
          </button>
        </div>
      </header>

      <main className="main-container" style={{ flex: 1, width: '100%' }}>
        <WardDashboard />
      </main>

      <footer style={{
        padding: '24px',
        textAlign: 'center',
        color: 'var(--md-sys-color-on-surface-variant)',
        fontSize: '14px'
      }}>
        Spinal Ward Manager &copy; {new Date().getFullYear()} • Sviluppato per Chirurgia Vertebrale / Ortopedia
      </footer>

      {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} />}
    </div>
  );
}

export default App;
