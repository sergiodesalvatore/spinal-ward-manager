import React, { useState } from 'react';
import { usePatientStore } from '../store/usePatientStore';

const SettingsModal = ({ onClose }) => {
  const { syncUrl, syncApiKey, saveSyncConfig } = usePatientStore();
  const currentBinId = syncUrl.replace('https://api.jsonbin.io/v3/b/', '');
  const [binId, setBinId] = useState(currentBinId);
  const [apiKey, setApiKey] = useState(syncApiKey);

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanBinId = binId.trim();
    const finalUrl = `https://api.jsonbin.io/v3/b/${cleanBinId}`;
    saveSyncConfig(finalUrl, apiKey.trim());
    onClose();
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest w-full max-w-lg rounded-2xl shadow-2xl p-6 md:p-8 relative">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl md:text-2xl font-bold font-headline text-primary flex items-center gap-2">
            <span className="material-symbols-outlined">settings</span> Impostazioni Database
          </h2>
          <button onClick={onClose} className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors">
             <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="p-4 bg-secondary-container/20 text-on-surface border border-secondary/10 rounded-xl text-sm leading-relaxed">
            <p className="font-medium">
              Stiamo usando <b>JSONBin.io</b> (gratuito e sicuro al 100%) per la memoria condivisa dell'App. 
            </p>
            <p className="mt-2 text-xs text-on-surface-variant">
              Incolla il tuo BIN ID e la tua Master Key per connettere automaticamente tutte le schede dei tuoi pazienti a questo dispositivo.
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-widest px-1">Il tuo "BIN ID"</label>
            <input required type="text" value={binId} onChange={(e) => setBinId(e.target.value)} className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 transition-all font-medium" placeholder="Es. 65eb3abc2..." />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-widest px-1">Master API Key</label>
            <input required type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 transition-all font-medium" placeholder="Es: $2a$10$wT0XoF7..." />
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-outline-variant/10">
            <button type="button" onClick={onClose} className="px-6 py-2 rounded-xl font-bold text-on-surface-variant hover:bg-surface-container-high transition-colors">Annulla</button>
            <button type="submit" className="px-6 py-2 rounded-xl bg-primary text-white font-bold flex items-center gap-2 shadow-sm hover:opacity-90 transition-opacity">
              <span className="material-symbols-outlined text-sm">save</span> Salva
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsModal;
