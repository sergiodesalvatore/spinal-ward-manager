import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  ArrowUpRight,
  Check,
  Circle,
  SlidersHorizontal,
  Archive,
} from "lucide-react";
import { usePatientStore } from "../store/usePatientStore";
import {
  patientCount,
  activePatient,
  patientName,
  postOpDays,
  diaryDone,
  tasksFor,
  dateLabel,
  localDate,
} from "../lib/ward";
import SyncMessage from "../components/SyncMessage";
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
  const [swipedPatient, setSwipedPatient] = useState(null);
  const swipeStart = useRef(null);
  const swipeMoved = useRef(false);
  const discharge = async (patient) => {
    if (
      !window.confirm(
        `Dimettere ${patientName(patient)} e spostare la scheda in archivio?`,
      )
    )
      return;
    if (
      await updatePatient(patient.id, {
        status: "Discharged",
        dischargeDate: localDate(),
      })
    )
      setSwipedPatient(null);
  };
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
  const diaries = scoped.filter((p) => !diaryDone(p)).length;
  const devices = scoped.filter(
    (p) => postOpDays(p.operationDate) >= 2 && (p.hasDrainage || p.hasCV),
  ).length;
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Pazienti in reparto</h1>
          <p>Il punto sul postoperatorio, un paziente alla volta.</p>
        </div>
        <Link to="/add" className="button primary">
          <Plus size={17} />
          Nuovo paziente
        </Link>
      </div>
      <SyncMessage />
      <div className="metrics-strip" aria-label="Riepilogo della selezione">
        <div>
          <span>Pazienti nella selezione</span>
          <strong>{unavailable ? "—" : scoped.length}</strong>
        </div>
        <div>
          <span>In terapia intensiva</span>
          <strong>
            {unavailable
              ? "—"
              : scoped.filter((p) => p.location === "Terapia Intensiva").length}
          </strong>
        </div>
        <div>
          <span>Diarie da aggiornare</span>
          <strong>{unavailable ? "—" : diaries}</strong>
        </div>
        <div>
          <span>Presidi da rivalutare</span>
          <strong>{unavailable ? "—" : devices}</strong>
        </div>
      </div>
      <section className="ward-panel" aria-labelledby="ward-list">
        <div className="list-heading">
          <h2 id="ward-list">
            Giro visita{" "}
            <span>
              {unavailable
                ? "In attesa dei dati"
                : patientCount(filtered.length)}
            </span>
          </h2>
          <Link to="/handover" className="text-link">
            Apri le consegne <ArrowUpRight size={15} />
          </Link>
        </div>
        <div className="list-toolbar">
          <label className="search-field">
            <Search size={17} />
            <span className="sr-only">Cerca paziente, letto o diagnosi</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cerca paziente, letto o diagnosi"
              type="search"
            />
          </label>
          <div className="filter-group">
            <label className="select-field">
              <SlidersHorizontal size={16} />
              <span className="sr-only">Ubicazione</span>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              >
                <option>Tutti</option>
                <option>Reparto</option>
                <option>Terapia Intensiva</option>
              </select>
            </label>
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
                  : "Il reparto è pronto"}
            </h3>
            <p>
              {error
                ? "Riprova il collegamento per caricare i dati."
                : active.length
                  ? "Prova con un altro nome o modifica i filtri."
                  : "Aggiungi il primo paziente per iniziare il giro visita."}
            </p>
            {!active.length && !error && (
              <Link to="/add" className="button secondary">
                Aggiungi un paziente
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="patient-table-wrap">
              <table className="patient-table">
                <thead>
                  <tr>
                    <th>Paziente</th>
                    <th className="numeric">Letto</th>
                    <th className="numeric">Postoperatorio</th>
                    <th>Presidi</th>
                    <th>Diaria di oggi</th>
                    <th>RX</th>
                    <th>
                      <span className="sr-only">Cartella</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <Link className="patient-name" to={`/patient/${p.id}`}>
                          {patientName(p)}
                        </Link>
                        <span className="cell-subline">{p.diagnosis}</span>
                      </td>
                      <td className="numeric bed-number">
                        {p.bedNumber || "—"}
                      </td>
                      <td className="numeric">
                        <span className="postop-day">
                          {postOpDays(p.operationDate) === 0
                            ? "Oggi"
                            : `Giornata ${postOpDays(p.operationDate)}`}
                        </span>
                        <span className="cell-subline">
                          {dateLabel(p.operationDate)}
                        </span>
                      </td>
                      <td>
                        <span>
                          {[
                            p.hasDrainage ? "Drenaggio" : null,
                            p.hasCV ? "CV" : null,
                          ]
                            .filter(Boolean)
                            .join(" · ") || "Nessuno"}
                        </span>
                        {postOpDays(p.operationDate) >= 2 &&
                          (p.hasCV || p.hasDrainage) && (
                            <span className="cell-subline attention-text">
                              Da rivalutare
                            </span>
                          )}
                      </td>
                      <td>
                        <button
                          className={`diary-button ${diaryDone(p) ? "complete" : ""}`}
                          disabled={pending.includes(p.id)}
                          onClick={() =>
                            updatePatient(p.id, {
                              diariaUpdated: !diaryDone(p),
                            })
                          }
                          aria-label={`${diaryDone(p) ? "Segna da aggiornare" : "Segna diaria aggiornata"}: ${patientName(p)}`}
                        >
                          {diaryDone(p) ? (
                            <Check size={16} />
                          ) : (
                            <Circle size={15} />
                          )}
                          {diaryDone(p) ? "Aggiornata" : "Da aggiornare"}
                        </button>
                      </td>
                      <td>
                        <span
                          className={`status-tag ${p.rxStatus === "Richiesta" ? "waiting" : ""}`}
                        >
                          {p.rxStatus === "Non Richiesta"
                            ? "Non richiesta"
                            : p.rxStatus || "—"}
                        </span>
                      </td>
                      <td>
                        <Link
                          to={`/patient/${p.id}`}
                          className="icon-button"
                          aria-label={`Apri cartella di ${patientName(p)}`}
                        >
                          <ArrowUpRight size={18} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="patient-mobile-list">
              {filtered.map((p) => (
                <div className="patient-swipe-shell" key={p.id}>
                  <button
                    className="swipe-discharge"
                    disabled={pending.includes(p.id)}
                    tabIndex={swipedPatient === p.id ? 0 : -1}
                    aria-hidden={swipedPatient !== p.id}
                    onClick={() => discharge(p)}
                    aria-label={`Dimetti ${patientName(p)}`}
                  >
                    <Archive size={20} />
                    Dimetti
                  </button>
                  <article
                    className={`patient-mobile ${swipedPatient === p.id ? "swiped" : ""}`}
                    onClickCapture={(e) => {
                      if (swipeMoved.current) {
                        e.preventDefault();
                        e.stopPropagation();
                        swipeMoved.current = false;
                      }
                    }}
                    onPointerDown={(e) => {
                      swipeMoved.current = false;
                      swipeStart.current = {
                        x: e.clientX,
                        y: e.clientY,
                      };
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
                    <div className="patient-mobile-heading">
                      <Link className="patient-name" to={`/patient/${p.id}`}>
                        {patientName(p)}
                      </Link>
                      <span className="bed-label">
                        Letto {p.bedNumber || "—"}
                      </span>
                    </div>
                    <p>{p.diagnosis}</p>
                    <div className="patient-mobile-facts">
                      <span className="postop-day">
                        {postOpDays(p.operationDate) === 0
                          ? "Intervento oggi"
                          : `Giornata ${postOpDays(p.operationDate)}`}
                      </span>
                      <span>
                        {p.location === "Terapia Intensiva"
                          ? "Intensiva"
                          : "Reparto"}
                      </span>
                      <span>
                        RX:{" "}
                        {p.rxStatus === "Non Richiesta"
                          ? "non richiesta"
                          : p.rxStatus?.toLowerCase()}
                      </span>
                    </div>
                    <div className="patient-mobile-footer">
                      <button
                        className={`diary-button ${diaryDone(p) ? "complete" : ""}`}
                        disabled={pending.includes(p.id)}
                        onClick={() =>
                          updatePatient(p.id, { diariaUpdated: !diaryDone(p) })
                        }
                      >
                        {diaryDone(p) ? (
                          <Check size={16} />
                        ) : (
                          <Circle size={15} />
                        )}
                        Diaria {diaryDone(p) ? "aggiornata" : "da aggiornare"}
                      </button>
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
                        <Archive size={16} />
                      </button>
                    </div>
                    <div className="mobile-devices">
                      Presidi:{" "}
                      {[
                        p.hasDrainage ? "drenaggio" : null,
                        p.hasCV ? "CV" : null,
                      ]
                        .filter(Boolean)
                        .join(" · ") || "nessuno"}
                      {postOpDays(p.operationDate) >= 2 &&
                      (p.hasCV || p.hasDrainage)
                        ? " · Da rivalutare"
                        : ""}
                    </div>
                  </article>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
      <div className="ward-footnote">
        <span>
          Le verifiche dei presidi seguono il giorno postoperatorio, non l’ora
          dell’intervento.
        </span>
        <span>La valutazione resta al team clinico.</span>
      </div>
    </>
  );
}
