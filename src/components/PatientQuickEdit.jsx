import { useState } from "react";

export default function PatientQuickEdit({ patient, busy, error, onSave }) {
  const [initial] = useState(() => ({
    bedNumber: patient.bedNumber || "",
    location: patient.location || "Reparto",
    hasCV: Boolean(patient.hasCV),
    hasDrainage: Boolean(patient.hasDrainage),
  }));
  const [version] = useState(patient._version);
  const [draft, setDraft] = useState(initial);
  const [failed, setFailed] = useState(false);
  const changes = Object.fromEntries(
    Object.entries(draft).filter(([field, value]) => value !== initial[field]),
  );
  const dirty = Object.keys(changes).length > 0;
  const change = (event) => {
    const { name, type, checked, value } = event.target;
    setDraft((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
    setFailed(false);
  };
  const submit = async (event) => {
    event.preventDefault();
    if (!dirty || busy) return;
    setFailed(false);
    if (!(await onSave(changes, version))) setFailed(true);
  };
  return (
    <form className="patient-quick-edit" onSubmit={submit}>
      <fieldset disabled={busy}>
        <legend>Ubicazione e presidi</legend>
        <div className="field-grid">
          <label>
            Letto
            <input
              name="bedNumber"
              maxLength={20}
              value={draft.bedNumber}
              onChange={change}
            />
          </label>
          <label>
            Ubicazione
            <select name="location" value={draft.location} onChange={change}>
              <option>Reparto</option>
              <option>Terapia Intensiva</option>
            </select>
          </label>
          <label className="check-field">
            <input
              type="checkbox"
              name="hasCV"
              checked={draft.hasCV}
              onChange={change}
            />
            CV presente
          </label>
          <label className="check-field">
            <input
              type="checkbox"
              name="hasDrainage"
              checked={draft.hasDrainage}
              onChange={change}
            />
            Drenaggio presente
          </label>
        </div>
      </fieldset>
      {failed && (
        <p className="field-error" role="alert">
          {error || "Modifiche non salvate. Riprova."}
        </p>
      )}
      <button
        className="button primary"
        type="submit"
        disabled={busy || !dirty}
      >
        {busy ? "Salvataggio…" : "Salva modifiche"}
      </button>
    </form>
  );
}
