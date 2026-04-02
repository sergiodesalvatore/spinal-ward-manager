import React from 'react';
import { differenceInHours, isToday, parseISO } from 'date-fns';
import { Trash2, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

const PatientCard = ({ patient, onUpdate, onDelete }) => {
  const {
    id,
    firstName,
    lastName,
    bedNumber,
    operationDate,
    location,
    diagnosis,
    notes,
    hasDrainage,
    hasCV,
    lastDiariaUpdate,
    rxStatus,
    dischargePrepared
  } = patient;

  const handleToggle = (field, currentVal) => {
    onUpdate(id, { [field]: !currentVal });
  };

  const handleSelect = (field, e) => {
    onUpdate(id, { [field]: e.target.value });
  };

  const handleDiariaToggle = () => {
    const isUpdatedToday = lastDiariaUpdate && isToday(parseISO(lastDiariaUpdate));
    onUpdate(id, {
      lastDiariaUpdate: isUpdatedToday ? null : new Date().toISOString()
    });
  };

  const opDate = parseISO(operationDate);
  const hoursSinceOp = differenceInHours(new Date(), opDate);
  const isPast48h = hoursSinceOp >= 48;

  const isDiariaUpdated = lastDiariaUpdate && isToday(parseISO(lastDiariaUpdate));
  const needsDrainageRemoval = isPast48h && hasDrainage;
  const needsCVRemoval = isPast48h && hasCV;

  return (
    <div style={{
      backgroundColor: 'var(--md-sys-color-surface)',
      borderRadius: 'var(--md-shape-corner-medium)',
      boxShadow: 'var(--md-elevation-1)',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      position: 'relative'
    }}>
      {/* Header */}
      <div className="flex justify-between items-center" style={{ borderBottom: '1px solid var(--md-sys-color-surface-variant)', paddingBottom: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '500', color: 'var(--md-sys-color-primary)' }}>
            {lastName} {firstName}
          </h2>
          <div style={{ fontSize: '14px', color: 'var(--md-sys-color-secondary)', display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
            <span style={{ fontWeight: 600 }}>Letto: {bedNumber}</span>
            {diagnosis && (
              <>
                <span>•</span>
                <span style={{ fontStyle: 'italic' }}>{diagnosis}</span>
              </>
            )}
          </div>
          <div style={{ marginTop: '8px' }}>
            <select 
              value={location}
              onChange={(e) => handleSelect('location', e)}
              style={{
                backgroundColor: location === 'Terapia Intensiva' ? 'var(--md-sys-color-error-container)' : 'var(--md-sys-color-primary-container)', 
                color: location === 'Terapia Intensiva' ? 'var(--md-sys-color-on-error-container)' : 'var(--md-sys-color-on-primary-container)',
                padding: '4px 12px', borderRadius: '12px', fontSize: '13px', fontWeight: '600', border: 'none', outline: 'none', cursor: 'pointer'
              }}
            >
              <option value="Reparto">Reparto</option>
              <option value="Terapia Intensiva">Terapia Intensiva</option>
            </select>
          </div>
        </div>
        <button onClick={() => onDelete(id)} style={{
          background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--md-sys-color-error)',
          padding: '8px', borderRadius: '50%', transition: 'background 0.2s'
        }} className="hover:bg-error-container" title="Elimina paziente">
          <Trash2 size={20} />
        </button>
      </div>

      {/* Alerts */}
      {(needsDrainageRemoval || needsCVRemoval || !isDiariaUpdated) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {needsDrainageRemoval && (
            <div className="bg-warning-container text-warning" style={{ padding: '8px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '500' }}>
              <AlertCircle size={18} /> Rimuovere Drenaggio ({'>'}{hoursSinceOp}h)
            </div>
          )}
          {needsCVRemoval && (
            <div className="bg-warning-container text-warning" style={{ padding: '8px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '500' }}>
              <AlertCircle size={18} /> Rimuovere CV ({'>'}{hoursSinceOp}h)
            </div>
          )}
          {!isDiariaUpdated && (
            <div className="bg-error-container text-error" style={{ padding: '8px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '500', color: 'var(--md-sys-color-error)' }}>
              <AlertCircle size={18} /> Diaria da aggiornare oggi
            </div>
          )}
        </div>
      )}

      {/* Toggles Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        
        <label className="flex justify-between items-center" style={{ cursor: 'pointer' }}>
          <span style={{ fontSize: '15px' }}>Drenaggio in sede</span>
          <div className="md-switch">
            <input type="checkbox" checked={hasDrainage} onChange={() => handleToggle('hasDrainage', hasDrainage)} />
            <span className="md-slider"></span>
          </div>
        </label>

        <label className="flex justify-between items-center" style={{ cursor: 'pointer' }}>
          <span style={{ fontSize: '15px' }}>CV in sede</span>
          <div className="md-switch">
            <input type="checkbox" checked={hasCV} onChange={() => handleToggle('hasCV', hasCV)} />
            <span className="md-slider"></span>
          </div>
        </label>

        <label className="flex justify-between items-center" style={{ cursor: 'pointer' }}>
          <span style={{ fontSize: '15px' }}>Diaria Aggiornata</span>
          <div className="md-switch">
            <input type="checkbox" checked={isDiariaUpdated} onChange={handleDiariaToggle} />
            <span className="md-slider"></span>
          </div>
        </label>

        <label className="flex justify-between items-center" style={{ cursor: 'pointer' }}>
          <span style={{ fontSize: '15px' }}>Dimissioni pronte</span>
          <div className="md-switch">
            <input type="checkbox" checked={dischargePrepared} onChange={() => handleToggle('dischargePrepared', dischargePrepared)} />
            <span className="md-slider"></span>
          </div>
        </label>
      </div>

      {/* Notes */}
      <div style={{ marginTop: '8px' }}>
        <textarea 
          placeholder="Note libere (es. allergie, particolarità)..."
          value={notes || ''}
          onChange={(e) => handleSelect('notes', e)}
          style={{
            width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--md-sys-color-on-surface-variant)',
            backgroundColor: 'transparent', color: 'var(--md-sys-color-on-surface)', fontSize: '14px', minHeight: '60px', resize: 'vertical',
            fontFamily: 'inherit'
          }}
        />
      </div>

      {/* RX Status (visible specifically when needed, or always) */}
      <div style={{ marginTop: '8px', padding: '12px', backgroundColor: 'var(--md-sys-color-surface-variant)', borderRadius: '8px' }}>
        <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: 'var(--md-sys-color-on-surface-variant)', fontWeight: '500' }}>
          Stato RX (Attivo dopo 48h)
        </label>
        <select 
          className="md-select" 
          value={rxStatus} 
          onChange={(e) => handleSelect('rxStatus', e)}
          style={{ padding: '10px' }}
        >
          <option value="Non Richieste">Non Richieste</option>
          <option value="Richieste">Richieste</option>
          <option value="Eseguite">Eseguite</option>
        </select>
        {isPast48h && rxStatus === 'Non Richieste' && (
          <div style={{ color: 'var(--md-sys-color-error)', fontSize: '12px', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <AlertCircle size={14}/> Sono passate {hoursSinceOp}h. Richiedere RX.
          </div>
        )}
        {rxStatus === 'Eseguite' && (
          <div style={{ color: 'var(--md-sys-color-success)', fontSize: '12px', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={14}/> RX Eseguite con successo.
          </div>
        )}
      </div>

      <div style={{ fontSize: '12px', color: 'var(--md-sys-color-on-surface-variant)', textAlign: 'right', marginTop: '8px' }}>
        <Clock size={12} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> Intervento: {opDate.toLocaleDateString()} {opDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
      </div>

    </div>
  );
};

export default PatientCard;
