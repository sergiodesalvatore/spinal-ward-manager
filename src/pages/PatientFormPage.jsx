import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatientStore } from '../store/usePatientStore';
import { v4 as uuidv4 } from 'uuid';

const PatientFormPage = () => {
  const { addPatient } = usePatientStore();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    bedNumber: '',
    diagnosis: '',
    notes: '',
    location: 'Terapia Intensiva',
    hasDrainage: true,
    hasCV: true,
    operationDate: new Date().toISOString().split('T')[0],
    operationTime: '08:00',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newPatient = {
      id: uuidv4(),
      ...formData,
      status: 'Active',
      diariaUpdated: false,
      rxStatus: 'Non Richiesta',
    };
    addPatient(newPatient);
    navigate('/');
  };

  return (
    <div className="flex-1 overflow-y-auto bg-surface-bright relative p-4 md:p-10">
      {/* Hero Header Section */}
      <div className="max-w-4xl mx-auto mb-6 md:mb-8 mt-2 md:mt-0">
        <div className="flex items-center gap-4 mb-2">
          <span className="w-8 h-1 bg-primary rounded-full"></span>
          <p className="text-primary font-bold uppercase tracking-widest text-xs">Registrazione Clinica</p>
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold font-headline text-on-surface tracking-tight">Inserisci Paziente</h2>
        <p className="text-on-surface-variant mt-2 max-w-2xl font-medium text-sm md:text-base">
          Configurazione del profilo paziente post-operatorio e parametri vitali.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 pb-20">
        
        {/* Section: Personal Information */}
        <div className="md:col-span-8 bg-surface-container-lowest p-6 md:p-8 rounded-xl shadow-[0_8px_24px_rgba(25,28,29,0.04)] border border-outline-variant/10">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-primary">person</span>
            <h3 className="text-lg font-bold font-headline">Dati Anagrafici e Clinici</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-2">
              <label className="block text-xs md:text-sm font-semibold text-on-surface-variant px-1 uppercase tracking-widest">Nome</label>
              <input required type="text" name="firstName" value={formData.firstName} onChange={handleChange}
                className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all placeholder:text-outline-variant" placeholder="es. Marco" />
            </div>
            <div className="space-y-2">
              <label className="block text-xs md:text-sm font-semibold text-on-surface-variant px-1 uppercase tracking-widest">Cognome</label>
              <input required type="text" name="lastName" value={formData.lastName} onChange={handleChange}
                className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all placeholder:text-outline-variant" placeholder="es. Rossi" />
            </div>
            
            <div className="space-y-2">
              <label className="block text-xs md:text-sm font-semibold text-on-surface-variant px-1 uppercase tracking-widest">Diagnosi / Note</label>
              <input required type="text" name="diagnosis" value={formData.diagnosis} onChange={handleChange}
                className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all placeholder:text-outline-variant" placeholder="es. Scoliosi Idiopatica" />
            </div>

            <div className="space-y-2">
              <label className="block text-xs md:text-sm font-semibold text-on-surface-variant px-1 uppercase tracking-widest">Numero Letto</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline">bed</span>
                <input required type="text" name="bedNumber" value={formData.bedNumber} onChange={handleChange}
                  className="w-full bg-surface-container-low border-none rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all placeholder:text-outline-variant" placeholder="402" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs md:text-sm font-semibold text-on-surface-variant px-1 uppercase tracking-widest">Data Intervento</label>
              <input required type="date" name="operationDate" value={formData.operationDate} onChange={handleChange}
                className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all" />
            </div>

            <div className="space-y-2">
              <label className="block text-xs md:text-sm font-semibold text-on-surface-variant px-1 uppercase tracking-widest">Ora Fine Intervento</label>
              <input required type="time" name="operationTime" value={formData.operationTime} onChange={handleChange}
                className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all" />
            </div>
          </div>
        </div>

        {/* Section: Clinical Status (Styled like Mobile Design) */}
        <div className="md:col-span-4 bg-surface-container-low rounded-xl p-6 shadow-sm border border-outline-variant/10">
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-secondary">clinical_notes</span>
            <h2 className="text-lg font-bold text-on-surface font-headline">Stato Iniziale</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-xl">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-on-surface">Ubicazione Paziente</span>
                <span className="text-xs text-on-surface-variant">Attiva per ICU</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={formData.location === 'Terapia Intensiva'} onChange={(e) => handleChange({ target: { name: 'location', type: 'value', value: e.target.checked ? 'Terapia Intensiva' : 'Reparto' } })} />
                <div className="w-11 h-6 bg-surface-container-highest rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                <span className="ml-3 text-xs font-bold text-secondary uppercase tracking-tighter w-12">{formData.location === 'Terapia Intensiva' ? 'ICU' : 'WARD'}</span>
              </label>
            </div>

            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-outline pt-2 px-1">PRESIDI MEDICI</p>

            <div className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-secondary-container/30 flex items-center justify-center">
                  <span className="material-symbols-outlined text-secondary text-sm">water_drop</span>
                </div>
                <span className="text-sm font-medium text-on-surface">Drenaggio</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" name="hasDrainage" className="sr-only peer" checked={formData.hasDrainage} onChange={handleChange} />
                <div className="w-11 h-6 bg-surface-container-highest rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-error-container/30 flex items-center justify-center">
                  <span className="material-symbols-outlined text-error text-sm">monitor_heart</span>
                </div>
                <span className="text-sm font-medium text-on-surface">Accesso CV</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" name="hasCV" className="sr-only peer" checked={formData.hasCV} onChange={handleChange} />
                <div className="w-11 h-6 bg-surface-container-highest rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="md:col-span-12 flex flex-col-reverse md:flex-row items-center justify-end gap-4 pt-6 mt-2 md:border-t border-outline-variant/20">
          <button type="button" onClick={() => navigate(-1)} className="w-full md:w-auto px-8 py-4 md:py-3 rounded-xl md:rounded-full font-bold text-on-surface-variant hover:bg-surface-container-high transition-all active:scale-95 duration-150">
            Annulla
          </button>
          <button type="submit" className="w-full md:w-auto px-10 py-4 md:py-3 rounded-xl md:rounded-full bg-gradient-to-br from-primary to-primary-container md:bg-none text-white font-bold md:shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all duration-150 flex items-center justify-center gap-2">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>save</span>
            Salva Paziente
          </button>
        </div>
      </form>
    </div>
  );
};

export default PatientFormPage;
