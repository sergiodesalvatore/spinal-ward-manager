import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { usePatientStore } from '../store/usePatientStore';

const WardDashboard = () => {
  const { patients, updatePatient } = usePatientStore();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');

  // Filter out archived patients. Assume active unless explicitly archived or discharged
  const activePatients = patients.filter(p => p.status !== 'Archived' && p.status !== 'Discharged');

  const hasPendingTasks = (p) => {
    if (!p.diariaUpdated) return true;
    if (p.hasCV) {
      const diffTime = Math.abs(new Date() - new Date(p.operationDate));
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays >= 2) return true;
    }
    return false;
  };

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
            <div key={patient.id} className="bg-surface-container-lowest hover:bg-surface-container-low border border-outline-variant/10 rounded-xl p-4 shadow-[0_4px_12px_rgba(25,28,29,0.02)] transition-all active:scale-[0.98]" onClick={() => navigate(`/patient/${patient.id}`)}>
              {/* Row 1: Header - Avatar, Name, Diaria */}
              <div className="flex justify-between items-start mb-4 gap-3">
                <div className="flex gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${patient.location === 'Terapia Intensiva' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'}`}>
                    {getInitials(patient.firstName, patient.lastName)}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-on-surface relative inline-block leading-tight mt-0.5">
                      {patient.firstName} {patient.lastName}
                      {hasPendingTasks(patient) && (
                        <span className="absolute -top-1 -right-3 w-2 h-2 bg-error rounded-full"></span>
                      )}
                    </h2>
                    <div className="text-[10px] text-on-surface-variant font-medium mt-1">Intervento: {new Date(patient.operationDate).toLocaleDateString()}</div>
                  </div>
                </div>
                
                <button 
                  onClick={(e) => { e.stopPropagation(); updatePatient(patient.id, { diariaUpdated: !patient.diariaUpdated }); }}
                  className="p-1 rounded-full active:scale-95 transition-transform shrink-0"
                >
                  {patient.diariaUpdated ? (
                    <span className="material-symbols-outlined text-[24px] text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  ) : (
                    <span className="material-symbols-outlined text-[24px] text-outline-variant">radio_button_unchecked</span>
                  )}
                </button>
              </div>

              {/* Row 2: Editable Info (Letto & Stato) */}
              <div className="flex items-center gap-3 bg-surface-container-high/20 p-2.5 rounded-lg mb-4 border border-outline-variant/5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest shrink-0">Letto</span>
                  <input 
                    type="text" 
                    value={patient.bedNumber}
                    onChange={(e) => updatePatient(patient.id, { bedNumber: e.target.value })}
                    onClick={(e) => e.stopPropagation()}
                    className="w-12 bg-surface-bright rounded px-2 py-1 text-xs font-bold text-on-surface border border-outline-variant/10 focus:ring-1 focus:ring-primary/20 focus:border-primary text-center"
                  />
                </div>
                <div className="h-6 w-[1px] bg-outline-variant/20"></div>
                <select
                  value={patient.location}
                  onChange={(e) => updatePatient(patient.id, { location: e.target.value })}
                  onClick={(e) => e.stopPropagation()}
                  className={`flex-1 text-[10px] font-bold uppercase tracking-wider py-1.5 px-3 pr-6 rounded-md appearance-none bg-no-repeat cursor-pointer border border-outline-variant/5 shadow-sm focus:ring-1 focus:ring-primary/20 ${patient.location === 'Terapia Intensiva' ? 'bg-error-container text-on-error-container' : 'bg-secondary-container text-on-secondary-container'}`}
                  style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.3rem center", backgroundSize: "1.2em 1.2em" }}
                >
                  <option value="Terapia Intensiva">Terapia Intensiva</option>
                  <option value="Reparto">Reparto</option>
                </select>
              </div>

              {/* Row 3: Presidi UI matching Desktop checkboxes */}
              <div className="flex items-center gap-6 px-1">
                <div className="flex items-center gap-2">
                   <div className="flex items-center justify-center p-1 rounded-full bg-surface-container-high relative w-8 h-4 pointer-events-none">
                     <div className={`absolute top-[2px] w-3 h-3 rounded-full bg-white shadow-sm transition-all ${patient.hasDrainage ? 'right-[2px] bg-secondary' : 'left-[2px] bg-outline'}`} />
                   </div>
                   <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest leading-none">Drenaggio</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="flex items-center justify-center p-1 rounded-full bg-surface-container-high relative w-8 h-4 pointer-events-none">
                     <div className={`absolute top-[2px] w-3 h-3 rounded-full bg-white shadow-sm transition-all ${patient.hasCV ? 'right-[2px] bg-secondary' : 'left-[2px] bg-outline'}`} />
                   </div>
                   <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest leading-none">CV Access</span>
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
                          <div className="font-bold text-on-surface relative inline-block">
                            {patient.firstName} {patient.lastName}
                            {hasPendingTasks(patient) && (
                              <span className="absolute top-0 -right-4 w-2 h-2 bg-error rounded-full" title="Task pendenti"></span>
                            )}
                          </div>
                          <div className="text-xs text-on-surface-variant font-medium">Intervento: {new Date(patient.operationDate).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <input 
                        type="text" 
                        value={patient.bedNumber}
                        onChange={(e) => updatePatient(patient.id, { bedNumber: e.target.value })}
                        onClick={(e) => e.stopPropagation()}
                        className="w-16 md:w-20 bg-transparent border border-transparent hover:border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary rounded px-2 py-1 font-bold text-on-surface-variant transition-all"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={patient.location}
                        onChange={(e) => updatePatient(patient.id, { location: e.target.value })}
                        onClick={(e) => e.stopPropagation()}
                        className={`text-[10px] font-bold uppercase tracking-tighter py-1 px-3 pr-7 rounded-full appearance-none bg-no-repeat cursor-pointer border-none focus:ring-2 focus:ring-primary/20 ${patient.location === 'Terapia Intensiva' ? 'bg-error-container text-on-error-container' : 'bg-secondary-container text-on-secondary-container'}`}
                        style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.3rem center", backgroundSize: "1.2em 1.2em" }}
                      >
                        <option value="Terapia Intensiva">Ter. Intensiva</option>
                        <option value="Reparto">Reparto</option>
                      </select>
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
                    <td className="px-4 py-3 text-center">
                      <button 
                         onClick={(e) => { e.stopPropagation(); updatePatient(patient.id, { diariaUpdated: !patient.diariaUpdated }); }}
                         className="p-1 rounded-full hover:bg-surface-container-high transition-colors active:scale-95"
                         title={patient.diariaUpdated ? "Segna come non aggiornato" : "Segna come aggiornato"}
                      >
                        {patient.diariaUpdated ? (
                           <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        ) : (
                           <span className="material-symbols-outlined text-outline-variant hover:text-secondary transition-colors">radio_button_unchecked</span>
                        )}
                      </button>
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
