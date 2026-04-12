import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { usePatientStore } from '../store/usePatientStore';

const WardDashboard = () => {
  const { patients, updatePatient } = usePatientStore();
  const navigate = useNavigate();
  const [tooltipPatientId, setTooltipPatientId] = useState(null);
  const [filter, setFilter] = useState('All');

  // Filter out archived patients. Assume active unless explicitly archived or discharged
  const activePatients = patients.filter(p => p.status !== 'Archived' && p.status !== 'Discharged');

  const daysSinceOp = (p) => Math.floor((new Date() - new Date(p.operationDate)) / (1000 * 60 * 60 * 24));

  // RX ui status based on rxStatus field (same field used in PatientDetailPage)
  // 'hidden' = <48h, 'needed' = >=48h not requested, 'requested' = requested not done, 'done' = Eseguita
  const getRxStatus = (p) => {
    if (daysSinceOp(p) < 2) return 'hidden';
    if (p.rxStatus === 'Eseguita') return 'done';
    if (p.rxStatus === 'Richiesta') return 'requested';
    return 'needed'; // null / 'Non Richiesta'
  };

  const hasPendingTasks = (p) => {
    if (!p.diariaUpdated) return true;
    const days = daysSinceOp(p);
    if (p.hasCV && days >= 2) return true;
    if (p.hasDrainage && days >= 2) return true;
    if (days >= 2 && p.rxStatus !== 'Eseguita') return true;
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
  const alertCount = activePatients.filter(p => {
    const days = daysSinceOp(p);
    return (p.hasDrainage && days >= 2) || (p.hasCV && days >= 2);
  }).length; 

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
        <div className="md:hidden flex flex-col gap-4 pb-32">
          {sortedPatients.map(patient => (
            <div 
              key={patient.id} 
              onClick={() => navigate(`/patient/${patient.id}`)}
              className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden border border-gray-100 transition-all active:scale-[0.98]"
            >
              <div className="p-5 flex flex-col gap-4">
                {/* Card Header: Name, Badge, Status Icon */}
                <div className="flex items-start justify-between">
                  <div className="flex flex-col gap-0.5">
                    <h3 className="text-xl font-bold text-gray-900 leading-tight">
                      {patient.firstName} {patient.lastName}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div 
                        onClick={(e) => { e.stopPropagation(); updatePatient(patient.id, { location: patient.location === 'Reparto' ? 'Terapia Intensiva' : 'Reparto' }); }}
                        className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider cursor-pointer active:scale-95 transition-transform ${patient.location === 'Reparto' ? 'bg-secondary-container text-on-secondary-container' : 'bg-error-container text-on-error-container'}`}
                      >
                        {patient.location === 'Reparto' ? 'REPARTO' : 'INTENSIVA'}
                      </div>
                      <div className="flex items-center gap-1.5 ml-1">
                        <span className="text-[10px] font-bold text-gray-400">BED</span>
                        <input 
                          type="text" 
                          value={patient.bedNumber || ''} 
                          onChange={(e) => updatePatient(patient.id, { bedNumber: e.target.value })}
                          onClick={(e) => e.stopPropagation()}
                          placeholder="-"
                          className="w-10 bg-gray-50 border border-gray-200 rounded px-1.5 py-0.5 text-xs font-bold text-gray-800 focus:ring-1 focus:ring-primary focus:border-primary text-center"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Big Status Radio/Check Icon */}
                  <button 
                    onClick={(e) => { e.stopPropagation(); updatePatient(patient.id, { diariaUpdated: !patient.diariaUpdated, diariaUpdatedAt: new Date().toISOString() }); }}
                    className="shrink-0 p-1"
                  >
                    {patient.diariaUpdated ? (
                      <div className="w-8 h-8 rounded-full bg-[#3CC09E] flex items-center justify-center text-white">
                        <span className="material-symbols-outlined text-[20px] font-bold">check</span>
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full border-2 border-gray-200 flex items-center justify-center"></div>
                    )}
                  </button>
                </div>

                {/* Alert Banners: CV & DRAINAGE > 48h */}
                <div className="flex flex-col gap-2">
                  {patient.hasCV && daysSinceOp(patient) >= 2 && (
                    <div className="bg-[#FFE5E5] p-3 rounded-xl flex items-center gap-3 border border-[#FFD1D1]">
                      <span className="material-symbols-outlined text-[#D32F2F] text-[24px]">warning</span>
                      <p className="text-[11px] font-extrabold text-[#9B1C1C] uppercase tracking-tighter leading-none">
                        RIMUOVERE CV: SUPERATE 48 ORE
                      </p>
                    </div>
                  )}
                  {patient.hasDrainage && daysSinceOp(patient) >= 2 && (
                    <div className="bg-[#E0F2FE] p-3 rounded-xl flex items-center gap-3 border border-[#BAE6FD]">
                      <span className="material-symbols-outlined text-[#0284C7] text-[24px]">warning</span>
                      <p className="text-[11px] font-extrabold text-[#0369A1] uppercase tracking-tighter leading-none">
                        RIMUOVERE DRENAGGIO: SUPERATE 48 ORE
                      </p>
                    </div>
                  )}
                </div>

                {/* Control Toggles: DRAINAGE & CV */}
                <div className="grid grid-cols-2 gap-3 mt-1">
                  {/* Drainage Toggle */}
                  <button 
                    onClick={(e) => { e.stopPropagation(); updatePatient(patient.id, { hasDrainage: !patient.hasDrainage }); }}
                    className={`flex items-center justify-between p-4 rounded-xl transition-all ${patient.hasDrainage ? 'bg-[#005FA3] text-white shadow-md' : 'bg-[#F1F5F9] text-gray-500'}`}
                  >
                    <span className="text-[11px] font-black uppercase tracking-widest">DRENAGGIO</span>
                    <div className={`w-8 h-4 rounded-full relative transition-all ${patient.hasDrainage ? 'bg-white/40' : 'bg-gray-300'}`}>
                      <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all shadow-sm ${patient.hasDrainage ? 'left-4.5' : 'left-0.5'}`}></div>
                    </div>
                  </button>

                  {/* CV Access Toggle */}
                  <button 
                    onClick={(e) => { e.stopPropagation(); updatePatient(patient.id, { hasCV: !patient.hasCV }); }}
                    className={`flex items-center justify-between p-4 rounded-xl transition-all ${patient.hasCV ? 'bg-[#3CC09E] text-white shadow-md' : 'bg-[#F1F5F9] text-gray-500'}`}
                  >
                    <span className="text-[11px] font-black uppercase tracking-widest">CV ACCESS</span>
                    <div className={`w-8 h-4 rounded-full relative transition-all ${patient.hasCV ? 'bg-white/40' : 'bg-gray-300'}`}>
                      <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all shadow-sm ${patient.hasCV ? 'left-4.5' : 'left-0.5'}`}></div>
                    </div>
                  </button>
                </div>

                {/* Dimissione Toggle - ONLY AFTER 48H */}
                {daysSinceOp(patient) >= 2 && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); updatePatient(patient.id, { writtenDischarge: !patient.writtenDischarge }); }}
                    className={`flex items-center justify-between p-4 rounded-xl transition-all mt-1 ${patient.writtenDischarge ? 'bg-[#7C4DFF] text-white shadow-md' : 'bg-[#F1F5F9] text-gray-500'}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">description</span>
                      <span className="text-[11px] font-black uppercase tracking-widest">DIMISS. SCRITTA</span>
                    </div>
                    <div className={`w-8 h-4 rounded-full relative transition-all ${patient.writtenDischarge ? 'bg-white/40' : 'bg-gray-300'}`}>
                      <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all shadow-sm ${patient.writtenDischarge ? 'left-4.5' : 'left-0.5'}`}></div>
                    </div>
                  </button>
                )}

                {/* RX Row - Integrated if needed, or separate pulse */}
                {daysSinceOp(patient) >= 2 && patient.rxStatus !== 'Eseguita' && (
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      const nextStatus = patient.rxStatus === 'Richiesta' ? 'Eseguita' : 'Richiesta';
                      updatePatient(patient.id, { rxStatus: nextStatus }); 
                    }}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                      patient.rxStatus === 'Richiesta' 
                        ? 'bg-amber-50 text-amber-600 border-amber-100' 
                        : 'bg-red-50 text-red-600 border-red-100 animate-pulse'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">radiology</span>
                    <span className="text-[11px] font-bold uppercase">
                      {patient.rxStatus === 'Richiesta' ? 'RX RICHIESTA' : 'RX DA RICHIEDERE'}
                    </span>
                  </button>
                )}

                {/* Status Footer: Diaria */}
                <div className="pt-4 border-t border-gray-100 flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">DIARIA:</span>
                  {patient.diariaUpdated ? (
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[#3CC09E] text-[14px] font-bold">check</span>
                      <span className="text-[11px] font-bold text-[#3CC09E]">
                        Completata {patient.diariaUpdatedAt ? new Date(patient.diariaUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'OGGI'}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[11px] font-bold text-gray-400">Da aggiornare</span>
                  )}
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

        {/* Floating Bottom Navigation for Mobile */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 pb-8 bg-white border-t border-gray-100 flex justify-around items-center gap-2 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] rounded-t-3xl">
          <NavLink 
            to="/" 
            className={({ isActive }) => `flex flex-col items-center gap-1 flex-1 py-1 transition-all ${isActive ? 'text-[#005FA3]' : 'text-gray-400'}`}
          >
            <div className={`w-12 h-12 flex flex-col items-center justify-center rounded-2xl transition-all ${filter === 'All' ? 'bg-[#005FA3] text-white shadow-lg' : 'bg-transparent'}`}>
              <span className="material-symbols-outlined text-[24px]">group</span>
              <span className="text-[9px] font-black uppercase tracking-tighter mt-0.5">ATTIVI</span>
            </div>
          </NavLink>

          <NavLink 
            to="/add" 
            className="flex flex-col items-center gap-1 flex-1 py-1 text-gray-400"
          >
            <div className="w-12 h-12 flex flex-col items-center justify-center rounded-2xl bg-gray-50 border border-gray-100">
              <span className="material-symbols-outlined text-[24px]">add_circle</span>
              <span className="text-[9px] font-black uppercase tracking-tighter mt-0.5">NUOVO</span>
            </div>
          </NavLink>

          <NavLink 
            to="/archive" 
            className={({ isActive }) => `flex flex-col items-center gap-1 flex-1 py-1 transition-all ${isActive ? 'text-[#005FA3]' : 'text-gray-400'}`}
          >
            <div className="w-12 h-12 flex flex-col items-center justify-center rounded-2xl bg-gray-50 border border-gray-100">
              <span className="material-symbols-outlined text-[24px]">archive</span>
              <span className="text-[9px] font-black uppercase tracking-tighter mt-0.5">ARCHIVIO</span>
            </div>
          </NavLink>
        </div>

        {/* Search FAB */}
        <div className="md:hidden fixed bottom-24 right-4 z-40">
          <button className="w-14 h-14 rounded-3xl bg-[#005FA3] text-white shadow-xl flex items-center justify-center active:scale-95 transition-transform">
            <span className="material-symbols-outlined text-[28px]">search</span>
          </button>
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
                  <th className="px-4 py-3 text-center text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Dren.</th>
                  <th className="px-4 py-3 text-center text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">CV</th>
                  <th className="px-4 py-3 text-center text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Dimiss.</th>
                  <th className="px-4 py-3 text-center text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Diaria</th>
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant text-center">RX</th>
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
                            <button type="button" className="relative w-2 h-2 bg-error rounded-full ml-2" onClick={(e) => { e.stopPropagation(); setTooltipPatientId(tooltipPatientId === patient.id ? null : patient.id); }} title="Task pendenti"></button>
                          )}
                          {tooltipPatientId === patient.id && (
                            <div className="absolute z-10 mt-1 w-56 bg-surface-container-high text-on-surface p-2 rounded shadow-lg">
                                {!patient.diariaUpdated && <p className="text-sm py-0.5">📋 Diaria non aggiornata</p>}
                                {patient.hasCV && daysSinceOp(patient) >= 2 && <p className="text-sm py-0.5">🩺 CV da rimuovere ({daysSinceOp(patient)} gg)</p>}
                                {patient.hasDrainage && daysSinceOp(patient) >= 2 && <p className="text-sm py-0.5">💧 Drenaggio da rimuovere ({daysSinceOp(patient)} gg)</p>}
                                {daysSinceOp(patient) >= 2 && patient.rxStatus !== 'Eseguita' && <p className="text-sm py-0.5">🩻 RX da richiedere</p>}
                            </div>
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
                    <td className="px-4 py-5 text-center" onClick={(e) => e.stopPropagation()}>
                       {/* Drainage toggle */}
                       <label className="inline-flex items-center cursor-pointer">
                         <input type="checkbox" className="sr-only peer" checked={!!patient.hasDrainage} onChange={(e) => updatePatient(patient.id, { hasDrainage: e.target.checked })} />
                         <div className="relative w-11 h-6 bg-surface-container-high rounded-full peer-checked:bg-secondary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:w-5 after:h-5 after:bg-white after:rounded-full after:transition-all peer-checked:after:translate-x-5" />
                       </label>
                    </td>
                    <td className="px-4 py-5 text-center" onClick={(e) => e.stopPropagation()}>
                       {/* CV toggle */}
                       <label className="inline-flex items-center cursor-pointer">
                         <input type="checkbox" className="sr-only peer" checked={!!patient.hasCV} onChange={(e) => updatePatient(patient.id, { hasCV: e.target.checked })} />
                         <div className="relative w-11 h-6 bg-surface-container-high rounded-full peer-checked:bg-secondary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:w-5 after:h-5 after:bg-white after:rounded-full after:transition-all peer-checked:after:translate-x-5" />
                       </label>
                    </td>
                    <td className="px-4 py-5 text-center" onClick={(e) => e.stopPropagation()}>
                       {/* Dimissione toggle */}
                       {daysSinceOp(patient) >= 2 ? (
                         <label className="inline-flex items-center cursor-pointer">
                           <input type="checkbox" className="sr-only peer" checked={!!patient.writtenDischarge} onChange={(e) => updatePatient(patient.id, { writtenDischarge: e.target.checked })} />
                           <div className="relative w-11 h-6 bg-surface-container-high rounded-full peer-checked:bg-[#7C4DFF] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:w-5 after:h-5 after:bg-white after:rounded-full after:transition-all peer-checked:after:translate-x-5" />
                         </label>
                       ) : (
                         <span className="text-outline-variant text-[10px] font-medium">–</span>
                       )}
                    </td>
                    <td className="px-4 py-5 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => updatePatient(patient.id, { diariaUpdated: !patient.diariaUpdated })}
                          className="hover:opacity-70 transition-opacity active:scale-95"
                          title={patient.diariaUpdated ? 'Segna come non aggiornato' : 'Segna come aggiornato'}
                        >
                          {patient.diariaUpdated ? (
                            <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                          ) : (
                            <span className="material-symbols-outlined text-outline-variant hover:text-secondary transition-colors">radio_button_unchecked</span>
                          )}
                        </button>
                    </td>
                    <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                       {(() => {
                         const status = getRxStatus(patient);
                         if (status === 'hidden') return (
                           <span className="text-outline-variant text-xs">–</span>
                         );
                         if (status === 'done') return (
                           <button
                             onClick={() => updatePatient(patient.id, { rxStatus: 'Richiesta' })}
                             className="flex items-center gap-1 mx-auto text-secondary text-xs font-bold"
                             title="RX eseguita – clicca per tornare a Richiesta"
                           >
                             <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>radiology</span>
                             <span>Eseguita</span>
                           </button>
                         );
                         if (status === 'requested') return (
                           <button
                             onClick={() => updatePatient(patient.id, { rxStatus: 'Eseguita' })}
                             className="flex items-center gap-1 mx-auto text-warning text-xs font-bold"
                             title="RX richiesta – clicca per segnare come eseguita"
                           >
                             <span className="material-symbols-outlined text-base">radiology</span>
                             <span>Richiesta</span>
                           </button>
                         );
                         // needed
                         return (
                           <button
                             onClick={() => updatePatient(patient.id, { rxStatus: 'Richiesta' })}
                             className="flex items-center gap-1 mx-auto text-error text-xs font-bold animate-pulse"
                             title="RX da richiedere – clicca per segnare come richiesta"
                           >
                             <span className="material-symbols-outlined text-base">radiology</span>
                             <span>Da fare</span>
                           </button>
                         );
                       })()}
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
