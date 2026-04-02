import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { usePatientStore } from '../store/usePatientStore';
import PatientCard from '../components/PatientCard';
import AddPatientModal from '../components/AddPatientModal';

const WardDashboard = () => {
  const { patients, addPatient, updatePatient, deletePatient } = usePatientStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sorting: Terapia Intensiva first, then by Operation Date
  const sortedPatients = [...patients].sort((a, b) => {
    if (a.location === 'Terapia Intensiva' && b.location !== 'Terapia Intensiva') return -1;
    if (a.location !== 'Terapia Intensiva' && b.location === 'Terapia Intensiva') return 1;
    return new Date(b.operationDate) - new Date(a.operationDate);
  });

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 style={{ fontSize: '28px', color: 'var(--md-sys-color-primary)', fontWeight: '400' }}>Pazienti Ricoverati</h1>
          <p style={{ color: 'var(--md-sys-color-on-surface-variant)', marginTop: '4px' }}>
            Totale: {patients.length} pazienti
          </p>
        </div>
        
        <button className="md-fab" onClick={() => setIsModalOpen(true)}>
          <Plus size={24} /> Aggiungi Paziente
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
        gap: '24px',
        marginTop: '24px'
      }}>
        {sortedPatients.map(patient => (
          <PatientCard 
            key={patient.id}
            patient={patient}
            onUpdate={updatePatient}
            onDelete={deletePatient}
          />
        ))}
      </div>

      {patients.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '48px',
          color: 'var(--md-sys-color-secondary)',
          backgroundColor: 'var(--md-sys-color-surface-variant)',
          borderRadius: '16px',
          marginTop: '48px'
        }}>
          Nessun paziente in reparto. Clicca su "Aggiungi Paziente" per iniziare.
        </div>
      )}

      {isModalOpen && (
        <AddPatientModal 
          onClose={() => setIsModalOpen(false)}
          onAdd={addPatient}
        />
      )}
    </div>
  );
};

export default WardDashboard;
