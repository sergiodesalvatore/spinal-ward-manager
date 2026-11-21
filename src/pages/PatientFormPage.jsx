import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import { usePatientStore } from "../store/usePatientStore";
import { localDate } from "../lib/ward";
import SyncMessage from "../components/SyncMessage";
import { PatientTeamFields } from "../components/PatientTeam";
export default function PatientFormPage() {
  const navigate = useNavigate();
  const { addPatient } = usePatientStore();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    consultant: "",
    resident: "",
    bedNumber: "",
    diagnosis: "",
    operationDate: localDate(),
    location: "Terapia Intensiva",
    hasDrainage: true,
    hasCV: true,
    notes: "",
    handover: "",
  });
  const change = (e) =>
    setForm({
      ...form,
      [e.target.name]:
        e.target.type === "checkbox" ? e.target.checked : e.target.value,
    });
  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const ok = await addPatient({
        ...form,
        id: crypto.randomUUID(),
        status: "Active",
        diariaUpdated: false,
        rxStatus: "Non Richiesta",
        writtenDischarge: false,
      });
      if (ok) navigate("/");
    } finally {
      setSaving(false);
    }
  };
  return (
    <>
      <Link to="/" className="back-link">
        <ArrowLeft size={16} />
        Pazienti
      </Link>
      <div className="page-heading">
        <div>
          <h1>Nuovo paziente</h1>
          <p>Apri la scheda per il percorso postoperatorio.</p>
        </div>
      </div>
      <SyncMessage />
      <form onSubmit={submit} className="clinical-form">
        <section className="form-section">
          <div>
            <h2>Anagrafica e intervento</h2>
            <p>
              Le informazioni essenziali per riconoscere il paziente durante il
              giro visita.
            </p>
          </div>
          <div className="field-grid">
            <label>
              Nome
              <input
                name="firstName"
                required
                maxLength={100}
                value={form.firstName}
                onChange={change}
                autoComplete="off"
              />
            </label>
            <label>
              Cognome
              <input
                name="lastName"
                required
                maxLength={100}
                value={form.lastName}
                onChange={change}
                autoComplete="off"
              />
            </label>
            <label className="full-field">
              Diagnosi / intervento
              <input
                name="diagnosis"
                required
                maxLength={500}
                value={form.diagnosis}
                onChange={change}
              />
            </label>
            <label>
              Letto
              <input
                name="bedNumber"
                maxLength={20}
                value={form.bedNumber}
                onChange={change}
              />
            </label>
            <label>
              Data intervento
              <input
                name="operationDate"
                type="date"
                required
                value={form.operationDate}
                onChange={change}
              />
            </label>
          </div>
        </section>
        <section className="form-section">
          <div>
            <h2>Team del paziente</h2>
            <p>Referente e specializzando presente all’intervento.</p>
          </div>
          <div className="field-grid">
            <PatientTeamFields patient={form} onChange={change} required />
          </div>
        </section>
        <section className="form-section">
          <div>
            <h2>Ubicazione e presidi</h2>
            <p>Lo stato sarà modificabile anche dalla dashboard.</p>
          </div>
          <div className="field-grid">
            <label className="full-field">
              Ubicazione
              <select name="location" value={form.location} onChange={change}>
                <option>Terapia Intensiva</option>
                <option>Reparto</option>
              </select>
            </label>
            <label className="check-field">
              <input
                type="checkbox"
                name="hasDrainage"
                checked={form.hasDrainage}
                onChange={change}
              />
              Drenaggio presente
            </label>
            <label className="check-field">
              <input
                type="checkbox"
                name="hasCV"
                checked={form.hasCV}
                onChange={change}
              />
              Catetere vescicale presente
            </label>
          </div>
        </section>
        <section className="form-section">
          <div>
            <h2>Note e consegne</h2>
            <p>Informazioni da ritrovare al prossimo giro e al cambio turno.</p>
          </div>
          <div className="field-grid">
            <label className="full-field">
              Note cliniche
              <textarea
                name="notes"
                maxLength={10000}
                value={form.notes}
                onChange={change}
                rows={3}
              />
            </label>
            <label className="full-field">
              Consegna per il team
              <textarea
                name="handover"
                maxLength={5000}
                value={form.handover}
                onChange={change}
                rows={3}
              />
            </label>
          </div>
        </section>
        <div className="form-actions">
          <Link to="/" className="button secondary">
            Annulla
          </Link>
          <button className="button primary" disabled={saving}>
            <Plus size={17} />
            {saving ? "Salvataggio…" : "Aggiungi paziente"}
          </button>
        </div>
      </form>
    </>
  );
}
