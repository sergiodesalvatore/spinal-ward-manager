import React, { useState } from 'react';
import { UserPlus, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const AddPatientModal = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    bedNumber: '',
    location: 'Reparto',
    diagnosis: 'Scoliosi',
    notes: '',
    operationDate: new Date().toISOString().slice(0, 16) // "YYYY-MM-DDThh:mm" format for datetime-local
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.bedNumber) return;

    const newPatient = {
      id: uuidv4(),
      firstName: formData.firstName,
      lastName: formData.lastName,
      bedNumber: formData.bedNumber,
      location: formData.location,
      diagnosis: formData.diagnosis,
      notes: formData.notes,
      operationDate: new Date(formData.operationDate).toISOString(),
      hasDrainage: true, // Defaulting to true as standard post-op
      hasCV: true,
      lastDiariaUpdate: null,
      rxStatus: 'Non Richieste',
      dischargePrepared: false
    };

    onAdd(newPatient);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-surface">
        <div className="flex justify-between items-center mb-4">
          <h2 style={{ fontSize: '24px', fontWeight: '500', color: 'var(--md-sys-color-primary)' }} className="flex items-center gap-2">
            <UserPlus size={24} /> Nuovo Paziente
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px' }}>
            <X size={24} color="var(--md-sys-color-on-surface-variant)" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-col gap-4 mt-4">
          
          <div className="md-input-group">
            <input required type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="md-input" placeholder=" " />
            <label className="md-label">Nome</label>
          </div>

          <div className="md-input-group">
            <input required type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="md-input" placeholder=" " />
            <label className="md-label">Cognome</label>
          </div>

          <div className="flex gap-4">
            <div className="md-input-group" style={{ flex: 1 }}>
              <input required type="text" name="bedNumber" value={formData.bedNumber} onChange={handleChange} className="md-input" placeholder=" " />
              <label className="md-label">Numero Letto</label>
            </div>

            <div className="md-input-group" style={{ flex: 2 }}>
              <select name="location" value={formData.location} onChange={handleChange} className="md-select">
                <option value="Reparto">Reparto</option>
                <option value="Terapia Intensiva">Terapia Intensiva</option>
              </select>
              <label className="md-label">Reparto / T.I.</label>
            </div>
          </div>

          <div className="md-input-group">
            <select name="diagnosis" value={formData.diagnosis} onChange={handleChange} className="md-select">
              <option value="Scoliosi">Scoliosi</option>
              <option value="Scheuermann">Scheuermann</option>
              <option value="Spondilolistesi">Spondilolistesi</option>
              <option value="Infezione">Infezione</option>
              <option value="Altro">Altro</option>
            </select>
            <label className="md-label">Diagnosi</label>
          </div>

          <div className="md-input-group">
            <textarea 
              name="notes" 
              value={formData.notes} 
              onChange={handleChange} 
              className="md-input" 
              placeholder=" " 
              style={{ minHeight: '60px', resize: 'vertical', fontFamily: 'inherit' }}
            />
            <label className="md-label">Note (Opzionale)</label>
          </div>

          <div className="md-input-group">
            <input 
              required 
              type="datetime-local" 
              name="operationDate" 
              value={formData.operationDate} 
              onChange={handleChange} 
              className="md-input" 
              placeholder=" " 
            />
            <label className="md-label">Data e Ora Intervento</label>
          </div>

          <div className="flex justify-between mt-4">
            <button type="button" onClick={onClose} className="md-button-text">Annulla</button>
            <button type="submit" className="md-button">Salva Paziente</button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default AddPatientModal;
