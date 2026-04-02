import React, { useState } from 'react';
import { usePatientStore } from '../store/usePatientStore';

const ArchivePage = () => {
  const { patients, updatePatient, deletePatient } = usePatientStore();
  const [searchTerm, setSearchTerm] = useState('');

  // Filter archived patients
  const archivedPatients = patients.filter(p => p.status === 'Archived' || p.status === 'Discharged');

  // Apply search
  const filteredArchive = archivedPatients.filter(p => {
    const term = searchTerm.toLowerCase();
    return p.firstName?.toLowerCase().includes(term) || 
           p.lastName?.toLowerCase().includes(term) || 
           p.id?.toLowerCase().includes(term);
  });

  const getInitials = (name, surname) => {
    return `${name?.charAt(0) || ''}${surname?.charAt(0) || ''}`.toUpperCase();
  };

  const handleRestore = (id) => {
    if(window.confirm("Sei sicuro di voler riportare il paziente in reparto?")) {
      updatePatient(id, { status: 'Active' });
    }
  };

  const handleDelete = (id) => {
    if(window.confirm("Attenzione: Questo eliminerà permanentemente la cartella. Continuare?")) {
      deletePatient(id);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-background md:p-8">
      {/* Mobile Header / Search embedded */}
      <div className="md:hidden px-4 pt-4 mb-6 space-y-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-extrabold font-headline tracking-tight text-on-surface">Archivio Pazienti</h2>
          <p className="text-sm text-on-surface-variant font-body">Gestione cartelle pazienti dimessi</p>
        </div>
        <div className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-outline">
            <span className="material-symbols-outlined text-lg">search</span>
          </div>
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 pl-12 pr-4 bg-surface-container-high border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline" 
            placeholder="Cerca per nome o ID..." 
          />
        </div>
      </div>

      <div className="hidden md:block max-w-7xl w-full mx-auto mb-10">
        <nav className="flex items-center gap-2 text-xs font-medium text-on-surface-variant mb-2">
          <span>Gestione</span>
          <span className="material-symbols-outlined text-[10px]">chevron_right</span>
          <span className="text-primary">Archivio Pazienti</span>
        </nav>
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-on-surface tracking-tight mb-1 font-headline">Pazienti Dimessi / Archivio</h1>
            <p className="text-on-surface-variant text-sm">Consultazione storica e gestione dati sensibili.</p>
          </div>
          <div className="flex gap-3">
             <div className="relative group flex items-center">
                <span className="absolute left-3 material-symbols-outlined text-slate-400 text-sm">search</span>
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-xl text-sm w-64 focus:ring-2 focus:ring-primary/20 transition-all" 
                  placeholder="Cerca in archivio..." 
                />
              </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-0 grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Stats Section (Desktop Only) */}
        <div className="hidden lg:block col-span-12 lg:col-span-3 space-y-6">
          <div className="p-5 bg-surface-container-low rounded-xl border-l-4 border-primary">
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Totale Dimessi</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-on-surface">{archivedPatients.length}</span>
            </div>
          </div>
          <div className="p-5 bg-surface-container-low rounded-xl">
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Ritenzione Dati</p>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-3xl font-black text-on-surface">10</span>
              <span className="text-sm font-medium text-on-surface-variant">Anni rimanenti</span>
            </div>
            <div className="w-full bg-outline-variant/20 h-1.5 rounded-full">
              <div className="bg-secondary h-1.5 rounded-full w-2/3"></div>
            </div>
          </div>
        </div>

        {/* List Table / Cards */}
        <div className="col-span-12 lg:col-span-9">
          {/* Mobile view */}
          <div className="md:hidden space-y-3 pb-12">
            {filteredArchive.map(patient => (
              <div key={patient.id} className="bg-surface-container-lowest rounded-xl p-4 transition-all duration-200 hover:bg-surface-container-low shadow-[0_4px_12px_rgba(25,28,29,0.03)] border border-outline-variant/5">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-primary tracking-widest uppercase mb-0.5">ID: {patient.id.slice(0,6)}</span>
                    <h3 className="text-base font-bold font-headline text-on-surface">{patient.firstName} {patient.lastName}</h3>
                  </div>
                  <span className="bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    {patient.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-on-surface-variant font-semibold uppercase tracking-tighter">Intervento</span>
                    <span className="text-xs font-medium">{new Date(patient.operationDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-on-surface-variant font-semibold uppercase tracking-tighter">Dimissione</span>
                    <span className="text-xs font-medium">{patient.dischargeDate ? new Date(patient.dischargeDate).toLocaleDateString() : 'N/D'}</span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-outline-variant/10 flex justify-end gap-3">
                  <button onClick={() => handleDelete(patient.id)} className="p-2 text-error">
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                  <button onClick={() => handleRestore(patient.id)} className="text-xs font-bold text-primary flex items-center gap-1">
                    RIPRISTINA <span className="material-symbols-outlined text-sm">settings_backup_restore</span>
                  </button>
                </div>
              </div>
            ))}
            {filteredArchive.length === 0 && (
               <div className="py-12 flex flex-col items-center justify-center gap-3 opacity-30">
                 <span className="material-symbols-outlined text-3xl">inventory_2</span>
                 <p className="text-xs font-bold tracking-widest uppercase">ARCHIVIO VUOTO</p>
               </div>
            )}
          </div>

          {/* Desktop view */}
          <div className="hidden md:block bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden border border-outline-variant/10">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low/50">
                    <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">Paziente</th>
                    <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">Dettaglio</th>
                    <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">Data Operazione</th>
                    <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest text-right">Azioni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {filteredArchive.map(patient => (
                    <tr key={patient.id} className="group hover:bg-surface-container-low transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant font-bold text-sm">
                            {getInitials(patient.firstName, patient.lastName)}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-on-surface">{patient.firstName} {patient.lastName}</div>
                            <div className="text-xs text-on-surface-variant">ID: #{patient.id.slice(0,6)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="px-2 py-1 bg-surface-container-high text-on-surface-variant rounded-lg text-xs font-semibold">Ex Letto {patient.bedNumber}</span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm font-medium text-on-surface">{new Date(patient.operationDate).toLocaleDateString()}</div>
                        <div className="text-[10px] text-secondary font-bold uppercase">{patient.status}</div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleRestore(patient.id)} className="p-2 hover:bg-primary-fixed text-primary rounded-lg transition-colors" title="Ripristina">
                            <span className="material-symbols-outlined text-xl">settings_backup_restore</span>
                          </button>
                          <button onClick={() => handleDelete(patient.id)} className="p-2 hover:bg-error-container text-error rounded-lg transition-colors" title="Elimina">
                            <span className="material-symbols-outlined text-xl">delete_forever</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredArchive.length === 0 && (
                 <div className="py-12 flex flex-col items-center justify-center gap-3 opacity-30">
                   <span className="material-symbols-outlined text-3xl">inventory_2</span>
                   <p className="text-xs font-bold tracking-widest uppercase">ARCHIVIO VUOTO</p>
                 </div>
              )}
            </div>
            
            <div className="px-6 py-4 bg-surface-container-low/30 border-t border-outline-variant/10 flex justify-between items-center hidden md:flex">
              <span className="text-xs font-medium text-on-surface-variant">Visualizzati {filteredArchive.length} di {archivedPatients.length} pazienti archiviati</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ArchivePage;
