import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { usePatientStore } from '../store/usePatientStore';

const WardDashboard = () => {
  const { patients, updatePatient } = usePatientStore();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');

  // Filter out archived patients. Assume active unless explicitly archived or discharged
  const activePatients = patients.filter(p => p.status !== 'Archived' && p.status !== 'Discharged');

  const filteredPatients = activePatients.filter(p => {
    if (filter === 'All') return true;
    return p.location === filter;
  });

  const sortedPatients = [...filteredPatients].sort((a, b) => {
    if (a.location === 'Terapia Intensiva' && b.location !== 'Terapia Intensiva') return -1;
    if (a.location !== 'Terapia Intensiva' && b.location === 'Terapia Intensiva') return 1;
    return new Date(b.operationDate) - new Date(a.operationDate);
  });

  const icuCount = activePatients.filter(p => p.location === 'Terapia Intensiva').length;
  // Temporary fake alert logic for visual match
  const alertCount = activePatients.filter(p => p.hasDrainage || p.hasCV).length; 

  const getInitials = (name, surname) => {
    return `${name?.charAt(0) || ''}${surname?.charAt(0) || ''}`.toUpperCase();
  };

  return (
    <div className="md:p-8 flex-1 overflow-y-auto">
      <div className="max-w-7xl mx-auto p-4 md:p-0">
        
        {/* Header - Desktop & Mobile */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-6 md:mb-8 gap-4 mt-2 md:mt-0">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-on-surface mb-1 md:mb-2 font-headline">Pazienti Attivi</h1>
            <p className="text-sm text-on-surface-variant font-body">Monitoraggio clinico post-operatorio in tempo reale.</p>
          </div>
          <div className="flex bg-surface-container-high p-1 rounded-full overflow-x-auto w-full md:w-auto">
            <button 
              onClick={() => setFilter('All')}
              className={`px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${filter === 'All' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}>
              Tutti
            </button>
            <button 
              onClick={() => setFilter('Terapia Intensiva')}
              className={`px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${filter === 'Terapia Intensiva' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}>
              Terapia Intensiva
            </button>
            <button 
               onClick={() => setFilter('Reparto')}
               className={`px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${filter === 'Reparto' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}>
              Reparto
            </button>
          </div>
        </div>

        {/* Mobile View: Cards */}
        <div className="md:hidden space-y-4">
          {sortedPatients.map(patient => (
            <div key={patient.id} className="bg-surface-container-lowest rounded-xl p-5 shadow-[0_8px_24px_rgba(25,28,29,0.04)] relative overflow-hidden transition-all active:scale-[0.98]" onClick={() => navigate(`/patient/${patient.id}`)}>
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-on-surface">{patient.firstName} {patient.lastName}</h2>
                    {patient.location === 'Terapia Intensiva' ? (
                      <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container text-[10px] font-bold uppercase tracking-wider">ICU</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant text-[10px] font-bold uppercase tracking-wider">Ward</span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest">Letto {patient.bedNumber}</p>
                </div>
                {patient.diariaUpdated ? (
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container">
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-surface-container text-outline">
                     <span className="material-symbols-outlined text-[20px]">radio_button_unchecked</span>
                  </div>
                )}
              </div>

              {patient.location === 'Terapia Intensiva' && patient.hasCV && (
                 <div className="mb-4 bg-error-container flex items-center gap-3 p-3 rounded-xl">
                   <span className="material-symbols-outlined text-on-error-container">warning</span>
                   <span className="text-xs font-bold text-on-error-container uppercase">Attenzione Presidi</span>
                 </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low border-none">
                  <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-tight">Drenaggio</span>
                  <div className={`w-10 h-5 rounded-full relative p-0.5 ${patient.hasDrainage ? 'bg-secondary' : 'bg-surface-variant'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full absolute ${patient.hasDrainage ? 'right-0.5' : 'left-0.5'}`}></div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low border-none">
                  <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-tight">CV Access</span>
                  <div className={`w-10 h-5 rounded-full relative p-0.5 ${patient.hasCV ? 'bg-secondary' : 'bg-surface-variant'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full absolute ${patient.hasCV ? 'right-0.5' : 'left-0.5'}`}></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {sortedPatients.length === 0 && (
             <div className="text-center py-12 opacity-50">
               <span className="material-symbols-outlined text-4xl mb-2">person_off</span>
               <p className="text-sm font-bold">Nessun paziente in questa categoria.</p>
             </div>
          )}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden border border-outline-variant/5">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Nome & Cognome</th>
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Letto</th>
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Stato</th>
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant text-center">Drenaggio</th>
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant text-center">CV</th>
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant text-center">Diaria</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant text-right">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {sortedPatients.map(patient => (
                  <tr key={patient.id} className="hover:bg-surface-container-low transition-colors group cursor-pointer" onClick={() => navigate(`/patient/${patient.id}`)}>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${patient.location === 'Terapia Intensiva' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'}`}>
                          {getInitials(patient.firstName, patient.lastName)}
                        </div>
                        <div>
                          <div className="font-bold text-on-surface">{patient.firstName} {patient.lastName}</div>
                          <div className="text-xs text-on-surface-variant font-medium">Intervento: {new Date(patient.operationDate).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-5 font-bold text-on-surface-variant">{patient.bedNumber}</td>
                    <td className="px-4 py-5">
                      {patient.location === 'Terapia Intensiva' ? (
                        <span className="px-3 py-1 bg-error-container text-on-error-container text-[10px] font-bold rounded-full uppercase tracking-tighter">Terapia Intensiva</span>
                      ) : (
                        <span className="px-3 py-1 bg-secondary-container text-on-secondary-container text-[10px] font-bold rounded-full uppercase tracking-tighter">Reparto</span>
                      )}
                    </td>
                    <td className="px-4 py-5 text-center">
                       <label className="relative inline-flex items-center cursor-pointer pointer-events-none">
                        <input type="checkbox" className="sr-only peer" checked={patient.hasDrainage || false} readOnly />
                        <div className="w-11 h-6 bg-surface-container-high rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                      </label>
                    </td>
                    <td className="px-4 py-5 text-center">
                      <label className="relative inline-flex items-center cursor-pointer pointer-events-none">
                        <input type="checkbox" className="sr-only peer" checked={patient.hasCV || false} readOnly />
                        <div className="w-11 h-6 bg-surface-container-high rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                      </label>
                    </td>
                    <td className="px-4 py-5 text-center">
                      {patient.diariaUpdated ? (
                         <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      ) : (
                         <span className="material-symbols-outlined text-outline-variant">radio_button_unchecked</span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button className="text-primary font-bold text-xs hover:underline" onClick={(e) => { e.stopPropagation(); navigate(`/patient/${patient.id}`); }}>Vedi Cartella</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {sortedPatients.length === 0 && (
              <div className="text-center py-12 text-on-surface-variant">Nessun paziente trovato.</div>
            )}
          </div>
        </div>

        {/* Footer Summary Info (Desktop) */}
        <div className="hidden md:grid mt-8 grid-cols-1 md:grid-cols-3 gap-6 pb-8">
          <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white">
                <span className="material-symbols-outlined">person</span>
              </div>
              <div>
                <div className="text-2xl font-black text-primary">{activePatients.length}</div>
                <div className="text-xs font-bold text-primary/70 uppercase tracking-widest">Totale Pazienti</div>
              </div>
            </div>
          </div>
          <div className="bg-secondary/5 p-6 rounded-2xl border border-secondary/10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center text-white">
                <span className="material-symbols-outlined">monitor_heart</span>
              </div>
              <div>
                <div className="text-2xl font-black text-secondary">{icuCount}</div>
                <div className="text-xs font-bold text-secondary/70 uppercase tracking-widest">Terapia Intensiva</div>
              </div>
            </div>
          </div>
          <div className="bg-error/5 p-6 rounded-2xl border border-error/10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-error rounded-xl flex items-center justify-center text-white">
                <span className="material-symbols-outlined">notification_important</span>
              </div>
              <div>
                <div className="text-2xl font-black text-error">{alertCount}</div>
                <div className="text-xs font-bold text-error/70 uppercase tracking-widest">Presidi Attivi</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default WardDashboard;
