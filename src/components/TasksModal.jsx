import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatientStore } from '../store/usePatientStore';

const TasksModal = ({ onClose }) => {
  const { patients } = usePatientStore();
  const navigate = useNavigate();

  const activePatients = patients.filter(p => p.status !== 'Archived' && p.status !== 'Discharged');
  
  const tasks = [];
  activePatients.forEach(p => {
    if (!p.diariaUpdated) {
      tasks.push({ patient: p, type: 'diaria', label: 'Aggiornare Diaria' });
    }
    if (p.hasCV) {
      const diffTime = Math.abs(new Date() - new Date(p.operationDate));
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays >= 2) {
        tasks.push({ patient: p, type: 'cv', label: 'Rimuovere CV (>48h)' });
      }
    }
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-surface-bright w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative z-10 flex flex-col max-h-[80vh]">
        <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center bg-error-container/20">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-error-container text-on-error-container flex items-center justify-center">
               <span className="material-symbols-outlined">notifications_active</span>
             </div>
             <div>
               <h2 className="text-xl font-bold font-headline text-on-surface">Cose Da Fare</h2>
               <p className="text-xs font-semibold text-on-surface-variant">{tasks.length} task pendenti</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 bg-surface-container-high rounded-full text-on-surface-variant hover:bg-outline-variant/20 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto flex-1 bg-surface-container-lowest">
          {tasks.length === 0 ? (
            <div className="py-12 text-center text-on-surface-variant flex flex-col items-center">
              <span className="material-symbols-outlined text-4xl mb-2 opacity-50">check_circle</span>
              <p className="font-bold text-sm">Tutti i task sono stati completati!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task, idx) => (
                <div key={`${task.patient.id}-${idx}`} className="flex items-center justify-between p-4 rounded-2xl border border-outline-variant/10 bg-surface-bright hover:bg-surface-container-low transition-colors group">
                  <div className="flex items-start gap-4">
                    <div className="mt-0.5">
                      {task.type === 'cv' ? (
                         <span className="material-symbols-outlined text-error">warning</span>
                      ) : (
                         <span className="material-symbols-outlined text-secondary">assignment_late</span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-on-surface">{task.label}</p>
                      <p className="text-xs font-semibold text-on-surface-variant">Letto {task.patient.bedNumber || 'N/D'} • {task.patient.firstName} {task.patient.lastName}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      onClose();
                      navigate(`/patient/${task.patient.id}`);
                    }}
                    className="p-2 text-primary hover:bg-primary/10 rounded-xl transition-colors"
                  >
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TasksModal;
