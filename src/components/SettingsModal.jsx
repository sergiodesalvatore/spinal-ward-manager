import React, { useState } from 'react';
import { Settings, X, Database, Save, ExternalLink } from 'lucide-react';
import { usePatientStore } from '../store/usePatientStore';

const SettingsModal = ({ onClose }) => {
  const { syncUrl, syncApiKey, saveSyncConfig } = usePatientStore();
  // Extract Bin ID if they currently have the full URL, otherwise just use it
  const currentBinId = syncUrl.replace('https://api.jsonbin.io/v3/b/', '');
  const [binId, setBinId] = useState(currentBinId);
  const [apiKey, setApiKey] = useState(syncApiKey);

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanBinId = binId.trim();
    // Auto costrusice l'URL corretto per evitare malintesi
    const finalUrl = `https://api.jsonbin.io/v3/b/${cleanBinId}`;
    saveSyncConfig(finalUrl, apiKey.trim());
    onClose();
    window.location.reload();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-surface">
        <div className="flex justify-between items-center mb-4">
          <h2 style={{ fontSize: '24px', fontWeight: '500', color: 'var(--md-sys-color-primary)' }} className="flex items-center gap-2">
            <Settings size={24} /> Impostazioni Cloud Sicuro
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px' }}>
            <X size={24} color="var(--md-sys-color-on-surface-variant)" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-col gap-4 mt-4">
          
          <div style={{ padding: '16px', backgroundColor: 'var(--md-sys-color-secondary-container)', color: 'var(--md-sys-color-on-secondary-container)', borderRadius: '8px', fontSize: '13px', marginBottom: '8px', lineHeight: '1.5' }}>
            <Database size={16} style={{ display: 'inline', marginBottom: '-3px', marginRight: '4px' }} />
            Stiamo usando <b>JSONBin.io</b> (gratuito e sicuro al 100%) per la memoria condivisa dell'App. 
            <br/><br/>
            Vai su <a href="https://jsonbin.io" target="_blank" rel="noreferrer" style={{ color: 'var(--md-sys-color-primary)', display: 'inline-flex', alignItems: 'center' }}>jsonbin.io <ExternalLink size={12}/></a>, crea un account, vai in "Create Bin" e metti `[]`. Copia l'URL che ti genera (nella barra URL del browser) e copialo qui sotto, insieme alla tua "Master Key" (si trova in "API Keys").
          </div>

          <div className="md-input-group">
            <input required type="text" value={binId} onChange={(e) => setBinId(e.target.value)} className="md-input" placeholder="Es. 65eb3abc2..." />
            <label className="md-label">Il tuo "BIN ID"</label>
          </div>

          <div className="md-input-group">
            <input required type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} className="md-input" placeholder="Es: $2a$10$wT0XoF7..." />
            <label className="md-label">Master API Key (X-Master-Key)</label>
          </div>

          <div className="flex justify-between mt-4">
            <button type="button" onClick={onClose} className="md-button-text">Annulla</button>
            <button type="submit" className="md-button"><Save size={18} /> Salva e Connetti</button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default SettingsModal;
