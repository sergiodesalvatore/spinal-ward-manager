import { useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, Save, Archive } from "lucide-react";
import { usePatientStore } from "../store/usePatientStore";
import {
  postOpDays,
  patientName,
  diaryDone,
  localDate,
  dateLabel,
  activePatient,
} from "../lib/ward";
import SyncMessage from "../components/SyncMessage";
import PatientHistory from "../components/PatientHistory";
function PatientEditor({ patient }) {
  const { updatePatient, pending } = usePatientStore();
  const navigate = useNavigate();
  const [form, setForm] = useState(() => ({ ...patient }));
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(new Set());
  const baseline = useRef(patient._version);
  const change = (e) => {
    if (!dirty.size) {
      baseline.current = patient._version;
      setForm({
        ...patient,
        [e.target.name]:
          e.target.type === "checkbox" ? e.target.checked : e.target.value,
      });
    } else
      setForm({
        ...form,
        [e.target.name]:
          e.target.type === "checkbox" ? e.target.checked : e.target.value,
      });
    setDirty(new Set([...dirty, e.target.name]));
    setSaved(false);
  };
  const submit = async (e) => {
    e.preventDefault();
    const fields = [
      "firstName",
      "lastName",
      "bedNumber",
      "diagnosis",
      "operationDate",
      "location",
      "hasDrainage",
      "hasCV",
      "rxStatus",
      "writtenDischarge",
      "notes",
      "handover",
    ];
    const changes = Object.fromEntries(
      fields.filter((k) => dirty.has(k)).map((k) => [k, form[k]]),
    );
    if (!Object.keys(changes).length) {
      setSaved(true);
      return;
    }
    if (await updatePatient(patient.id, changes, baseline.current)) {
      setDirty(new Set());
      baseline.current += 1;
      setSaved(true);
    }
  };
  const discharge = async () => {
    if (
      window.confirm(
        `Dimettere ${patientName(patient)} e spostare la scheda in archivio?`,
      )
    ) {
      if (
        await updatePatient(patient.id, {
          status: "Discharged",
          dischargeDate: localDate(),
        })
      )
        navigate("/archive");
    }
  };
  const busy = pending.includes(patient.id);
  const display = dirty.size ? form : patient;
  return (
    <>
      <Link to="/" className="back-link">
        <ArrowLeft size={16} />
        Pazienti
      </Link>
      <div className="page-heading">
        <div>
          <h1>{patientName(patient)}</h1>
          <p>
            Letto {patient.bedNumber || "—"} · {patient.location} ·{" "}
            {activePatient(patient) ? "In degenza" : "Dimesso"}
          </p>
        </div>
        {activePatient(patient) && (
          <button
            className="button secondary"
            onClick={discharge}
            disabled={busy}
          >
            <Archive size={16} />
            Dimetti
          </button>
        )}
      </div>
      <SyncMessage />
      <div className="patient-path">
        <div>
          <span>Intervento</span>
          <strong>{dateLabel(patient.operationDate)}</strong>
        </div>
        <div>
          <span>Postoperatorio</span>
          <strong className="postop-day">
            {postOpDays(patient.operationDate) === 0
              ? "Giornata 0"
              : `Giornata ${postOpDays(patient.operationDate)}`}
          </strong>
        </div>
        <div>
          <span>Diaria di oggi</span>
          <button
            className={`diary-button ${diaryDone(patient) ? "complete" : ""}`}
            disabled={busy}
            onClick={() =>
              updatePatient(patient.id, { diariaUpdated: !diaryDone(patient) })
            }
          >
            <Check size={16} />
            {diaryDone(patient) ? "Aggiornata" : "Segna aggiornata"}
          </button>
        </div>
      </div>
      <form onSubmit={submit} className="clinical-form">
        <section className="form-section">
          <div>
            <h2>Cartella del paziente</h2>
            <p>Dati identificativi e ubicazione attuale.</p>
          </div>
          <div className="field-grid">
            <label>
              Nome
              <input
                name="firstName"
                value={display.firstName}
                required
                maxLength={100}
                onChange={change}
              />
            </label>
            <label>
              Cognome
              <input
                name="lastName"
                value={display.lastName}
                required
                maxLength={100}
                onChange={change}
              />
            </label>
            <label className="full-field">
              Diagnosi / intervento
              <input
                name="diagnosis"
                value={display.diagnosis}
                required
                maxLength={500}
                onChange={change}
              />
            </label>
            <label>
              Letto
              <input
                name="bedNumber"
                value={display.bedNumber || ""}
                maxLength={20}
                onChange={change}
              />
            </label>
            <label>
              Data intervento
              <input
                type="date"
                name="operationDate"
                value={display.operationDate}
                required
                onChange={change}
              />
            </label>
            <label className="full-field">
              Ubicazione
              <select
                name="location"
                value={display.location}
                onChange={change}
              >
                <option>Reparto</option>
                <option>Terapia Intensiva</option>
              </select>
            </label>
          </div>
        </section>
        <section className="form-section">
          <div>
            <h2>Presidi e percorso</h2>
            <p>
              {postOpDays(patient.operationDate) >= 2 &&
              (patient.hasCV || patient.hasDrainage)
                ? "Dal secondo giorno postoperatorio: rivalutare i presidi con il team."
                : "Aggiorna lo stato dei presidi e degli accertamenti."}
            </p>
          </div>
          <div className="field-grid">
            <label className="check-field">
              <input
                name="hasDrainage"
                type="checkbox"
                checked={Boolean(display.hasDrainage)}
                onChange={change}
              />
              Drenaggio presente
            </label>
            <label className="check-field">
              <input
                name="hasCV"
                type="checkbox"
                checked={Boolean(display.hasCV)}
                onChange={change}
              />
              Catetere vescicale presente
            </label>
            <label className="full-field">
              Radiografia
              <select
                name="rxStatus"
                value={display.rxStatus || "Non Richiesta"}
                onChange={change}
              >
                <option>Non Richiesta</option>
                <option>Richiesta</option>
                <option>Eseguita</option>
              </select>
            </label>
            <label className="check-field full-field">
              <input
                name="writtenDischarge"
                type="checkbox"
                checked={Boolean(display.writtenDischarge)}
                onChange={change}
              />
              Lettera di dimissione pronta
            </label>
          </div>
        </section>
        <section className="form-section">
          <div>
            <h2>Note e consegne</h2>
            <p>
              Le consegne compaiono anche nella vista dedicata al cambio turno.
            </p>
          </div>
          <div className="field-grid">
            <label className="full-field">
              Note cliniche
              <textarea
                name="notes"
                value={display.notes || ""}
                maxLength={10000}
                rows={4}
                onChange={change}
              />
            </label>
            <label className="full-field">
              Consegna per il team
              <textarea
                name="handover"
                value={display.handover || ""}
                maxLength={5000}
                rows={4}
                onChange={change}
              />
            </label>
          </div>
        </section>
        <div className="form-actions">
          <button
            type="button"
            className="button secondary"
            onClick={() => {
              if (
                !dirty.size ||
                window.confirm(
                  "Scartare le modifiche non salvate e riprendere gli ultimi dati ricevuti?",
                )
              ) {
                setDirty(new Set());
                baseline.current = patient._version;
                setSaved(false);
              }
            }}
          >
            Ripristina campi
          </button>
          <span role="status">{saved ? "Modifiche salvate." : ""}</span>
          <button className="button primary" disabled={busy}>
            <Save size={16} />
            {busy ? "Salvataggio…" : "Salva modifiche"}
          </button>
        </div>
      </form>
      <PatientHistory id={patient.id} />
    </>
  );
}
export default function PatientDetailPage() {
  const { id } = useParams();
  const { patients, isSyncing } = usePatientStore();
  const patient = patients.find((p) => p.id === id);
  if (!patient)
    return (
      <>
        <h1>Cartella paziente</h1>
        <SyncMessage />
        <div className="empty-state">
          <h2>{isSyncing ? "Caricamento…" : "Paziente non trovato"}</h2>
          <Link to="/" className="button secondary">
            Torna ai pazienti
          </Link>
        </div>
      </>
    );
  return <PatientEditor key={patient.id} patient={patient} />;
}
