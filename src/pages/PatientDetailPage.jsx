import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePatientStore } from '../store/usePatientStore';

const PatientDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { patients, updatePatient } = usePatientStore();

  const patient = patients.find(p => p.id === id);

  if (!patient) {
    return <div className="p-8 text-center text-on-surface-variant">Paziente non trovato.</div>;
  }

  const handleUpdate = (field, value) => {
    updatePatient(id, { [field]: value });
  };

  const calculatePostOpDays = (dateStr) => {
    if(!dateStr) return 0;
    const diffTime = Math.abs(new Date() - new Date(dateStr));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays;
  };

  const handleDischarge = () => {
    if(window.confirm("Sei sicuro di voler dimettere e archiviare il paziente?")) {
      updatePatient(id, { status: 'Discharged', dischargeDate: new Date().toISOString().split('T')[0] });
      navigate('/archive');
    }
  };

  const postOpDays = calculatePostOpDays(patient.operationDate);
  const is48hPassed = postOpDays >= 2;

  return (
    <div className="flex-1 overflow-y-auto min-h-screen">
      {/* Mobile Top padding compensator covered by MainLayout */}
      <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8 pb-24">
        
        {/* Navigation Breadcrumb */}
        <div className="hidden md:flex items-center space-x-2 text-on-surface-variant text-xs mb-2">
          <span onClick={() => navigate('/')} className="cursor-pointer hover:text-primary">Patients</span>
          <span className="material-symbols-outlined text-[10px]">chevron_right</span>
          <span>{patient.location}</span>
          <span className="material-symbols-outlined text-[10px]">chevron_right</span>
          <span className="text-primary font-semibold">Cartella Clinica</span>
        </div>

        {/* Hero Section */}
        <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mt-2 md:mt-0">
          <div>
             <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label md:hidden block mb-1">Letto {patient.bedNumber}</span>
             <h2 className="text-3xl font-extrabold font-headline text-on-surface tracking-tight">{patient.firstName} {patient.lastName}</h2>
             <p className="text-on-surface-variant font-medium hidden md:flex items-center mt-1">
                <span className="material-symbols-outlined text-sm mr-1">bed</span>
                Numero Letto: <span className="text-on-surface font-bold ml-1">{patient.bedNumber}</span>
             </p>
             <p className="text-sm font-bold text-primary mt-1">{patient.diagnosis}</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0 justify-between md:justify-end">
             <span className="px-3 py-1 bg-secondary-container text-on-secondary-container text-xs font-bold rounded-full uppercase tracking-wider">
               Post-Op Day {postOpDays}
             </span>
             <button onClick={handleDischarge} className="bg-surface-container-high text-on-surface-variant px-4 py-2 md:px-6 md:py-2.5 rounded-xl font-bold text-sm shadow-sm hover:opacity-90 active:scale-95 transition-all flex items-center">
               <span className="material-symbols-outlined md:mr-2 text-sm">inventory_2</span>
               <span className="hidden md:inline">Dimetti e Archivia</span>
             </button>
          </div>
        </section>

        {/* Status bar */}
        <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden mb-6">
          <div className="h-full bg-primary w-2/3 rounded-full"></div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Section 1: Diaria (Checklist) */}
          <div className="md:col-span-4 space-y-4">
            <div className="bg-surface-container-low p-5 md:p-6 rounded-xl relative overflow-hidden group border border-transparent hover:border-outline-variant/15 transition-all">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity hidden md:block">
                <span className="material-symbols-outlined text-6xl">event_note</span>
              </div>
              <h3 className="font-headline font-bold text-lg mb-4 flex items-center text-on-surface">
                <span className="w-8 h-8 rounded-lg bg-primary-fixed text-primary flex items-center justify-center mr-3">
                  <span className="material-symbols-outlined text-sm">today</span>
                </span>
                Diaria Giornaliera
              </h3>
              <div className="bg-surface-container-lowest p-4 rounded-xl shadow-[0_4px_12px_rgba(25,28,29,0.03)] space-y-4">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Data Odierna</span>
                  <span className="text-sm font-semibold">{new Date().toLocaleDateString('it-IT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <label className="flex items-center p-3 rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer group border border-outline-variant/10 md:border-none">
                  <input 
                    type="checkbox" 
                    checked={patient.diariaUpdated || false} 
                    onChange={(e) => handleUpdate('diariaUpdated', e.target.checked)}
                    className="w-5 h-5 rounded border-outline text-secondary focus:ring-secondary transition-all custom-checkbox" 
                  />
                  <span className="ml-3 text-sm font-semibold text-on-surface group-hover:text-secondary">Conferma Diaria Aggiornata</span>
                </label>
              </div>
            </div>

            {/* Side Note / Presidi */}
            <div className="bg-secondary-container/30 p-5 md:p-6 rounded-xl border border-secondary/10">
              <h4 className="text-[10px] font-bold text-on-secondary-container uppercase tracking-widest mb-2 flex justify-between">
                <span>Stato Presidi</span>
                <span className="text-on-secondary-container/70">{patient.location}</span>
              </h4>
               <div className="flex flex-col gap-2">
                 <label className="flex items-center justify-between">
                   <span className="text-sm font-bold text-secondary">Drenaggio Attivo</span>
                   <input type="checkbox" checked={patient.hasDrainage || false} onChange={e => handleUpdate('hasDrainage', e.target.checked)} className="w-4 h-4 rounded text-secondary" />
                 </label>
                 <label className="flex items-center justify-between">
                   <span className="text-sm font-bold text-secondary">Catetere Vescicale</span>
                   <input type="checkbox" checked={patient.hasCV || false} onChange={e => handleUpdate('hasCV', e.target.checked)} className="w-4 h-4 rounded text-secondary" />
                 </label>
               </div>
            </div>
          </div>

          {/* Section 2: Post-Operatorio 48h */}
          <div className="md:col-span-8 space-y-6">
            <div className="bg-surface-container-low p-5 md:p-6 rounded-xl relative border border-transparent hover:border-outline-variant/15 transition-all">
              <h3 className="font-headline font-bold text-lg mb-4 md:mb-6 flex items-center text-on-surface">
                <span className="w-8 h-8 rounded-lg bg-tertiary-fixed text-tertiary flex items-center justify-center mr-3">
                  <span className="material-symbols-outlined text-sm">timer</span>
                </span>
                Checkpoint 48 ore
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Rimozione CV with Alert */}
                <div className={`p-5 rounded-xl flex flex-col justify-between shadow-sm border-l-4 ${patient.hasCV && is48hPassed ? 'bg-surface-container-lowest border-error' : 'bg-surface-container-lowest border-outline-variant/30'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Catheter Status</p>
                      <p className="text-sm font-bold text-on-surface">Rimozione CV</p>
                    </div>
                    {patient.hasCV && is48hPassed && (
                      <span className="material-symbols-outlined text-error" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                    )}
                  </div>
                  {patient.hasCV ? (
                     is48hPassed ? (
                      <div className="bg-error-container p-3 rounded-lg">
                        <p className="text-xs font-bold text-on-error-container flex items-center">
                          <span className="material-symbols-outlined text-sm mr-2">alarm</span>
                          SCADUTO: OLTRE 48 ORE
                        </p>
                      </div>
                     ) : (
                      <div className="bg-surface-container p-3 rounded-lg">
                        <p className="text-xs font-bold text-on-surface flex items-center">
                          <span className="material-symbols-outlined text-sm mr-2">schedule</span>
                          In Range {`<`} 48h
                        </p>
                      </div>
                     )
                  ) : (
                    <div className="bg-secondary-container p-3 rounded-lg">
                       <p className="text-xs font-bold text-on-secondary-container flex items-center">
                          <span className="material-symbols-outlined text-sm mr-2" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                          GIA' RIMOSSO
                        </p>
                    </div>
                  )}
                </div>

                {/* RX Checkpoints */}
                <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm flex flex-col space-y-4 border-l-4 border-primary">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Radiology Progress</p>
                    <p className="text-sm font-bold text-on-surface">Radiologia (RX)</p>
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center p-2 rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer group">
                      <input type="checkbox" checked={patient.rxStatus === 'Richiesta' || patient.rxStatus === 'Eseguita'} onChange={(e) => handleUpdate('rxStatus', e.target.checked ? 'Richiesta' : 'Non Richiesta')} className="w-5 h-5 rounded border-outline text-primary transition-all custom-checkbox" />
                      <span className="ml-3 text-sm font-medium text-on-surface">RX Richiesta</span>
                    </label>
                    <label className="flex items-center p-2 rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer group">
                      <input type="checkbox" checked={patient.rxStatus === 'Eseguita'} onChange={(e) => handleUpdate('rxStatus', e.target.checked ? 'Eseguita' : 'Richiesta')} className="w-5 h-5 rounded border-outline text-primary transition-all custom-checkbox" />
                      <span className="ml-3 text-sm font-medium text-on-surface">RX Eseguita</span>
                    </label>
                  </div>
                </div>
                
              </div>
            </div>

            {/* Note cliniche espandibili */}
            <div className="bg-surface-container-low p-5 md:p-6 rounded-xl border border-transparent">
               <h3 className="font-headline font-bold text-lg mb-3 flex items-center text-on-surface">Note Cliniche</h3>
               <textarea 
                  value={patient.notes || ''}
                  onChange={(e) => handleUpdate('notes', e.target.value)}
                  placeholder="Aggiungi note cliniche, osservazioni infermieristiche o prescrizioni..."
                  className="w-full bg-surface-container-lowest rounded-xl border-none p-4 min-h-[120px] focus:ring-2 focus:ring-primary/20 text-sm font-medium"
               ></textarea>
            </div>
            
          </div>
        </div>

        {/* Simulated Image Focus Card (From HTML Design) */}
        <section className="bg-surface-container-highest p-1 rounded-2xl md:mt-8">
          <div className="bg-white rounded-xl overflow-hidden shadow-sm grid grid-cols-1 md:grid-cols-2">
            <div className="p-6 md:p-8 space-y-4">
              <span className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded uppercase tracking-widest">Visione Post-Operatoria</span>
              <h4 className="text-xl md:text-2xl font-headline font-extrabold text-on-surface tracking-tight">Post-Surgical Alignment</h4>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                  (Simulazione) Il referto indica un corretto allineatore. Mezzi di sintesi in sede. Si attende validazione in stazione eretta.
              </p>
            </div>
            <div className="h-48 md:h-full relative group cursor-zoom-in bg-slate-900">
               <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4 z-10 pointer-events-none">
                 <p className="text-white text-sm font-bold">Vista AP Colonna</p>
                 <p className="text-white/70 text-[10px]">Reference placeholder</p>
               </div>
               <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDhStw62rgHSTMFWnJc3msn4Ue3ugzE2vXuvi75kiErAVNmtcELDxFpMfh1vPmaKqLmLFdkkxSSXivO_pQgOEhJyHTjjQmUZCh2nOuOfoGIFn4NNrL3XI9vJpy8b-HB7CArBTB0ol2fSwVjTJvmG61vwxdG6s9nCt0q8s76H-C2ajenu5pRc5Ig5ihjn3jsXNyFKNTjvAJek1zkNt0coRviW26jMSmnewmrfUiHOrCBELtb3mgSY10FCxhzDoI6wFya0G1JgIhfnG7r" alt="scoliosis x-ray" className="w-full h-full object-cover grayscale opacity-80" />
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default PatientDetailPage;
