import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Printer } from "lucide-react";
import { usePatientStore } from "../store/usePatientStore";
import {
  patientCount,
  activePatient,
  tasksFor,
  patientName,
  postOpDays,
  diaryDone,
} from "../lib/ward";
import SyncMessage from "../components/SyncMessage";
export default function HandoverPage() {
  const { patients, error, isSyncing, demo, lastSynced } = usePatientStore();
  const [onlyNotes, setOnlyNotes] = useState(false);
  const rows = patients
    .filter(
      (p) => activePatient(p) && (onlyNotes ? p.handover : tasksFor(p).length),
    )
    .sort((a, b) =>
      (a.bedNumber || "").localeCompare(b.bedNumber || "", "it", {
        numeric: true,
      }),
    );
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Consegne del reparto</h1>
          <p>Le informazioni da passare al prossimo turno.</p>
        </div>
        <button className="button secondary" onClick={() => window.print()}>
          <Printer size={16} />
          Stampa consegne
        </button>
      </div>
      <SyncMessage />
      <section className="ward-panel">
        <div className="list-heading">
          <h2>
            Da riprendere al giro{" "}
            <span>
              {!demo && !lastSynced
                ? "In attesa dei dati"
                : patientCount(rows.length)}
            </span>
          </h2>
          <label className="filter-check">
            <input
              type="checkbox"
              checked={onlyNotes}
              onChange={(e) => setOnlyNotes(e.target.checked)}
            />
            Solo con consegna
          </label>
        </div>
        {!rows.length ? (
          <div className="empty-state">
            <h3>
              {error
                ? "Consegne non disponibili"
                : isSyncing
                  ? "Caricamento delle consegne…"
                  : "Nessuna consegna in sospeso"}
            </h3>
            <p>
              {error
                ? "Riprova il collegamento per caricare le consegne."
                : "Le note del team e le verifiche del giro visita compariranno qui."}
            </p>
          </div>
        ) : (
          <div className="handover-list">
            {rows.map((p) => (
              <article className="handover-row" key={p.id}>
                <div className="handover-person">
                  <span className="bed-label">Letto {p.bedNumber || "—"}</span>
                  <Link to={`/patient/${p.id}`} className="patient-name">
                    {patientName(p)}
                  </Link>
                  <span className="cell-subline">
                    {p.location} · Giornata {postOpDays(p.operationDate)}
                  </span>
                </div>
                <div className="handover-content">
                  {p.handover && <p className="handover-note">{p.handover}</p>}
                  <div className="task-tags">
                    {!diaryDone(p) && <span>Diaria da aggiornare</span>}
                    {postOpDays(p.operationDate) >= 2 &&
                      (p.hasCV || p.hasDrainage) && (
                        <span>
                          Rivalutare{" "}
                          {[
                            p.hasDrainage ? "drenaggio" : null,
                            p.hasCV ? "CV" : null,
                          ]
                            .filter(Boolean)
                            .join(" e ")}
                        </span>
                      )}
                    {p.rxStatus === "Richiesta" && <span>RX in attesa</span>}
                    {p.writtenDischarge && (
                      <span>Lettera di dimissione pronta</span>
                    )}
                  </div>
                </div>
                <Link to={`/patient/${p.id}`} className="text-link no-print">
                  Cartella <ArrowUpRight size={15} />
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
      <p className="ward-footnote">
        Le consegne riflettono l’ultima sincronizzazione. Controlla
        l’aggiornamento prima del cambio turno.
      </p>
    </>
  );
}
