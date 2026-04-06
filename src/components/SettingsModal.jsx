import React from 'react';

const SettingsModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest w-full max-w-lg rounded-2xl shadow-2xl p-6 md:p-8 relative">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl md:text-2xl font-bold font-headline text-primary flex items-center gap-2">
            <span className="material-symbols-outlined">database</span> Stato Database
          </h2>
          <button onClick={onClose} className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors">
             <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex flex-col gap-5">
          <div className="p-5 bg-primary/5 text-on-surface border border-primary/10 rounded-2xl text-sm leading-relaxed">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">bolt</span>
              </div>
              <div>
                <p className="font-bold text-base">Sincronizzazione Real-time</p>
                <p className="text-xs text-on-surface-variant">Attivo tramite Supabase</p>
              </div>
            </div>
            <p className="text-on-surface-variant">
              L'app è ora collegata a un database professionale ad alte prestazioni (PostgreSQL). Tutte le tue modifiche sono sincronizzate istantaneamente tra tutti i tuoi dispositivi senza ritardi.
            </p>
          </div>

          <div className="bg-surface-container-low p-4 rounded-xl">
             <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 px-1">Sicurezza</h4>
             <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
               La connessione è protetta tramite chiavi API crittografate. Per motivi di sicurezza, la configurazione del database è gestita a livello di sistema.
             </p>
             <div className="flex items-center gap-2 text-xs font-bold text-secondary">
               <span className="material-symbols-outlined text-sm">check_circle</span>
               <span>Connessione Protetta</span>
             </div>
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-outline-variant/10">
            <button type="button" onClick={onClose} className="px-8 py-2.5 rounded-xl bg-primary text-white font-bold shadow-sm hover:opacity-90 transition-opacity">
              Chiudi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
