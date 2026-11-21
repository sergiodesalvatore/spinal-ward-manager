import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  ArrowUpRight,
  Check,
  Circle,
  Archive,
  MoveLeft,
  ClipboardList,
} from "lucide-react";
import { usePatientStore } from "../store/usePatientStore";
import {
  patientCount,
  activePatient,
  patientName,
  postOpDays,
  diaryDone,
  tasksFor,
  localDate,
} from "../lib/ward";
import SyncMessage from "../components/SyncMessage";
import Modal from "../components/Modal";
function HandoverContent({ patient, busy, onDischarge }) {
  return (
    <>
      <span className="bed-label">
        Letto {patient.bedNumber || "—"} · Giornata{" "}
        {postOpDays(patient.operationDate)}
      </span>
      <h3 className="handover-selected-name">{patientName(patient)}</h3>
      <p className="handover-preview-note">
        {patient.handover || "Nessuna consegna annotata per questo paziente."}
      </p>
      <div className="preview-facts">
        <span>
          <Check size={15} />
          Diaria {diaryDone(patient) ? "aggiornata" : "da aggiornare"}
        </span>
        <span>RX: {patient.rxStatus?.toLowerCase() || "non richiesta"}</span>
        <span>
          Presidi:{" "}
          {[
            patient.hasDrainage ? "drenaggio" : null,
            patient.hasCV ? "CV" : null,
          ]
            .filter(Boolean)
            .join(" · ") || "nessuno"}
        </span>
      </div>
      <Link className="button secondary" to={`/patient/${patient.id}`}>
        Apri cartella <ArrowUpRight size={16} />
      </Link>
      <button
        className="button primary"
        disabled={busy}
        onClick={() => onDischarge(patient)}
      >
        <Archive size={16} />
        Dimetti paziente
      </button>
    </>
  );
}
export default function WardDashboard() {
  const {
    patients,
    updatePatient,
    isSyncing,
    pending,
    error,
    demo,
    lastSynced,
  } = usePatientStore();
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("Tutti");
  const [attention, setAttention] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [mobileHandover, setMobileHandover] = useState(false);
  const [swipedPatient, setSwipedPatient] = useState(null);
  const [dischargePatient, setDischargePatient] = useState(null);
  const swipeStart = useRef(null),
    swipeMoved = useRef(false);
  const unavailable = !demo && !lastSynced;
  const active = patients.filter(activePatient);
  const scoped = active.filter(
    (p) =>
      (location === "Tutti" || p.location === location) &&
      `${patientName(p)} ${p.bedNumber} ${p.diagnosis}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const filtered = scoped
    .filter((p) => !attention || tasksFor(p).length)
    .sort((a, b) =>
      (a.bedNumber || "").localeCompare(b.bedNumber || "", "it", {
        numeric: true,
      }),
    );
  const selected = filtered.find((p) => p.id === selectedId) || filtered[0];
  const mobileSelected = active.find((p) => p.id === selectedId);
  const diaries = scoped.filter((p) => !diaryDone(p)).length;
  const devices = scoped.filter(
    (p) => postOpDays(p.operationDate) >= 2 && (p.hasDrainage || p.hasCV),
  ).length;
  const choosePatient = (p) => {
    setSelectedId(p.id);
    setMobileHandover(window.matchMedia("(max-width: 1000px)").matches);
  };
  const requestDischarge = (p) => {
    setMobileHandover(false);
    setDischargePatient(p);
  };
  const discharge = async () => {
    if (!dischargePatient || pending.includes(dischargePatient.id)) return;
    if (
      await updatePatient(dischargePatient.id, {
        status: "Discharged",
        dischargeDate: localDate(),
      })
    ) {
      setDischargePatient(null);
      setSwipedPatient(null);
    }
  };
  return (
    <>
      <SyncMessage />
      <section className="ward-lead" aria-label="Riepilogo del reparto">
        <div className="lead-heading">
          <div>
            <p className="lead-date">
              Spine team ·{" "}
              {new Intl.DateTimeFormat("it-IT", {
                timeZone: "Europe/Rome",
                weekday: "long",
                day: "numeric",
                month: "long",
              }).format(new Date())}
            </p>
            <h1>Pazienti in reparto</h1>
          </div>
          <Link to="/add" className="button lead-add">
            <Plus size={18} />
            Nuovo paziente
          </Link>
        </div>
        <div className="ward-counts" aria-label="Riepilogo della selezione">
          <div>
            <strong>{unavailable ? "—" : scoped.length}</strong>
            <span>pazienti</span>
          </div>
          <div>
            <strong>
              {unavailable
                ? "—"
                : scoped.filter((p) => p.location === "Terapia Intensiva")
                    .length}
            </strong>
            <span>in intensiva</span>
          </div>
          <div>
            <strong>{unavailable ? "—" : diaries}</strong>
            <span>diarie da fare</span>
          </div>
        </div>
      </section>
      <div className="dashboard-columns">
        <section className="dashboard-list" aria-labelledby="ward-list">
          <div className="dashboard-list-heading">
            <h2 id="ward-list">
              Pazienti del reparto{" "}
              <span>
                {unavailable
                  ? "In attesa dei dati"
                  : patientCount(filtered.length)}
              </span>
            </h2>
            <Link
              to="/add"
              className="button primary mobile-add"
              aria-label="Nuovo paziente"
            >
              <Plus size={20} />
            </Link>
          </div>
          <div className="dashboard-toolbar">
            <label className="search-field">
              <Search size={18} />
              <span className="sr-only">Cerca paziente, letto o diagnosi</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cerca paziente, letto o diagnosi"
                type="search"
              />
            </label>
            <div className="dashboard-filters">
              <div className="location-tabs" aria-label="Ubicazione">
                {["Tutti", "Reparto", "Terapia Intensiva"].map((value) => (
                  <button
                    key={value}
                    aria-pressed={location === value}
                    onClick={() => setLocation(value)}
                  >
                    {value === "Terapia Intensiva" ? "Intensiva" : value}
                  </button>
                ))}
              </div>
              <label className="filter-check">
                <input
                  type="checkbox"
                  checked={attention}
                  onChange={(e) => setAttention(e.target.checked)}
                />
                Da rivedere
              </label>
            </div>
          </div>
          {isSyncing && !patients.length ? (
            <div className="loading-state" role="status">
              Caricamento dei pazienti…
            </div>
          ) : !filtered.length ? (
            <div className="empty-state">
              <h3>
                {error
                  ? "Pazienti non disponibili"
                  : active.length
                    ? "Nessun risultato"
                    : "Nessun paziente in reparto"}
              </h3>
              <p>
                {error
                  ? "Riprova il collegamento per caricare i dati."
                  : active.length
                    ? "Prova con un altro nome o modifica i filtri."
                    : "Aggiungi il primo paziente per iniziare il giro visita."}
              </p>
              {!active.length && !error && (
                <Link to="/add" className="button primary">
                  Aggiungi un paziente
                </Link>
              )}
            </div>
          ) : (
            <div className="patient-card-grid">
              {filtered.map((p) => (
                <div
                  className={`patient-swipe-shell ${swipedPatient === p.id ? "is-open" : ""} ${selected?.id === p.id ? "is-selected" : ""}`}
                  key={p.id}
                >
                  <button
                    className="swipe-discharge"
                    disabled={pending.includes(p.id)}
                    tabIndex={swipedPatient === p.id ? 0 : -1}
                    aria-hidden={swipedPatient !== p.id}
                    onClick={() => requestDischarge(p)}
                    aria-label={`Dimetti ${patientName(p)}`}
                  >
                    <Archive size={20} />
                    Dimetti
                  </button>
                  <article
                    className={`patient-card ${swipedPatient === p.id ? "swiped" : ""}`}
                    onClickCapture={(e) => {
                      if (swipeMoved.current) {
                        e.preventDefault();
                        e.stopPropagation();
                        swipeMoved.current = false;
                      }
                    }}
                    onPointerDown={(e) => {
                      swipeMoved.current = false;
                      swipeStart.current = { x: e.clientX, y: e.clientY };
                    }}
                    onPointerMove={(e) => {
                      const start = swipeStart.current;
                      if (!start) return;
                      const dx = e.clientX - start.x,
                        dy = e.clientY - start.y;
                      if (
                        Math.abs(dx) > Math.abs(dy) * 1.4 &&
                        Math.abs(dx) > 36
                      ) {
                        setSwipedPatient(dx < 0 ? p.id : null);
                        swipeMoved.current = true;
                        swipeStart.current = null;
                      }
                    }}
                    onPointerUp={() => {
                      swipeStart.current = null;
                    }}
                    onPointerCancel={() => {
                      swipeStart.current = null;
                    }}
                  >
                    <div className="patient-card-top">
                      <span className="bed-label">
                        Letto {p.bedNumber || "—"}
                      </span>
                      <span className="postop-day">
                        {postOpDays(p.operationDate) === 0
                          ? "Intervento oggi"
                          : `Giornata ${postOpDays(p.operationDate)}`}
                      </span>
                    </div>
                    <button
                      className="patient-card-select"
                      onClick={() => choosePatient(p)}
                      aria-label={`Apri consegna di ${patientName(p)}`}
                      aria-pressed={selected?.id === p.id}
                    >
                      <span className="patient-name">{patientName(p)}</span>
                      <span className="patient-diagnosis">{p.diagnosis}</span>
                    </button>
                    <div className="patient-card-footer">
                      <button
                        className={`diary-button ${diaryDone(p) ? "complete" : ""}`}
                        disabled={pending.includes(p.id)}
                        onClick={() =>
                          updatePatient(p.id, { diariaUpdated: !diaryDone(p) })
                        }
                        aria-label={`${diaryDone(p) ? "Segna diaria da aggiornare" : "Segna diaria aggiornata"}: ${patientName(p)}`}
                      >
                        {diaryDone(p) ? (
                          <Check size={16} />
                        ) : (
                          <Circle size={15} />
                        )}
                        Diaria {diaryDone(p) ? "aggiornata" : "da fare"}
                      </button>
                      <span
                        className={`location-tag ${p.location === "Terapia Intensiva" ? "intensive" : ""}`}
                      >
                        {p.location === "Terapia Intensiva"
                          ? "Intensiva"
                          : "Reparto"}
                      </span>
                    </div>
                    <div className="patient-card-clinical">
                      <span>
                        RX: {p.rxStatus?.toLowerCase() || "non richiesta"}
                      </span>
                      <span
                        className={
                          postOpDays(p.operationDate) >= 2 &&
                          (p.hasCV || p.hasDrainage)
                            ? "attention-text"
                            : ""
                        }
                      >
                        {[
                          p.hasDrainage ? "Drenaggio" : null,
                          p.hasCV ? "CV" : null,
                        ]
                          .filter(Boolean)
                          .join(" · ") || "Nessun presidio"}
                        {postOpDays(p.operationDate) >= 2 &&
                        (p.hasCV || p.hasDrainage)
                          ? " · Da rivalutare"
                          : ""}
                      </span>
                    </div>
                    <div className="patient-card-actions">
                      <Link className="text-link" to={`/patient/${p.id}`}>
                        Cartella <ArrowUpRight size={15} />
                      </Link>
                      <button
                        className="mobile-discharge-toggle"
                        onClick={() =>
                          setSwipedPatient(swipedPatient === p.id ? null : p.id)
                        }
                        aria-label={`Mostra azione dimissione per ${patientName(p)}`}
                        aria-expanded={swipedPatient === p.id}
                      >
                        <Archive size={17} />
                        <span>Dimetti</span>
                      </button>
                    </div>
                  </article>
                </div>
              ))}
            </div>
          )}
          {filtered.length > 0 && (
            <p className="swipe-hint">
              <MoveLeft size={15} />
              Scorri una scheda a sinistra per dimettere
            </p>
          )}
        </section>
        <aside
          className="dashboard-rail"
          aria-label="Consegna del paziente selezionato"
        >
          <section className="handover-preview">
            <div className="section-heading">
              <h2>Consegna del team</h2>
              <ClipboardList size={19} />
            </div>
            {selected ? (
              <HandoverContent
                patient={selected}
                busy={pending.includes(selected.id)}
                onDischarge={requestDischarge}
              />
            ) : (
              <p>Seleziona un paziente per leggere la consegna.</p>
            )}
          </section>
          <div className="presidi-summary">
            <h2>Da riprendere al giro</h2>
            <p>
              {unavailable
                ? "In attesa dei dati"
                : `${devices} ${devices === 1 ? "paziente con presidi da rivalutare" : "pazienti con presidi da rivalutare"} dal secondo giorno postoperatorio.`}
            </p>
            <Link className="text-link" to="/handover">
              Tutte le consegne <ArrowUpRight size={15} />
            </Link>
          </div>
        </aside>
      </div>
      <p className="ward-footnote">
        Le verifiche dei presidi seguono il giorno postoperatorio. La
        valutazione resta al team clinico.
      </p>
      {mobileHandover && mobileSelected && (
        <div className="mobile-handover-modal">
          <Modal
            title="Consegna del team"
            onClose={() => setMobileHandover(false)}
          >
            <HandoverContent
              patient={mobileSelected}
              busy={pending.includes(mobileSelected.id)}
              onDischarge={requestDischarge}
            />
          </Modal>
        </div>
      )}
      {dischargePatient && (
        <Modal
          title="Conferma dimissione"
          onClose={() => {
            if (!pending.includes(dischargePatient.id))
              setDischargePatient(null);
          }}
        >
          <p className="discharge-confirm-copy">
            Dimettere <strong>{patientName(dischargePatient)}</strong>? La
            cartella sarà spostata in archivio, dove potrai consultarla o
            riammettere il paziente.
          </p>
          {error && (
            <p className="field-error" role="alert">
              {error}
            </p>
          )}
          <div className="dialog-actions">
            <button
              className="button secondary"
              disabled={pending.includes(dischargePatient.id)}
              onClick={() => setDischargePatient(null)}
            >
              Annulla
            </button>
            <button
              className="button destructive"
              disabled={pending.includes(dischargePatient.id)}
              onClick={discharge}
            >
              {pending.includes(dischargePatient.id)
                ? "Salvataggio…"
                : "Dimetti e archivia"}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
