import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, ArrowUpRight, RotateCcw, Trash2 } from "lucide-react";
import { usePatientStore } from "../store/usePatientStore";
import {
  activePatient,
  patientName,
  dateLabel,
  patientCount,
} from "../lib/ward";
import SyncMessage from "../components/SyncMessage";
import { PatientTeamBadges } from "../components/PatientTeam";
export default function ArchivePage() {
  const {
    patients,
    updatePatient,
    deletePatient,
    pending,
    role,
    error,
    isSyncing,
    demo,
    lastSynced,
  } = usePatientStore();
  const [query, setQuery] = useState("");
  const rows = patients
    .filter(
      (p) =>
        !activePatient(p) &&
        `${patientName(p)} ${p.id}`.toLowerCase().includes(query.toLowerCase()),
    )
    .sort((a, b) =>
      (b.dischargeDate || "").localeCompare(a.dischargeDate || ""),
    );
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Archivio pazienti</h1>
          <p>Cartelle dei pazienti dimessi.</p>
        </div>
      </div>
      <SyncMessage />
      <section className="ward-panel">
        <div className="list-heading">
          <h2>
            Cartelle archiviate{" "}
            <span>
              {!demo && !lastSynced
                ? "In attesa dei dati"
                : patientCount(rows.length)}
            </span>
          </h2>
        </div>
        <div className="list-toolbar">
          <label className="search-field">
            <Search size={17} />
            <span className="sr-only">Cerca nell’archivio</span>
            <input
              type="search"
              placeholder="Cerca per nome o identificativo"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
        </div>
        {!rows.length ? (
          <div className="empty-state">
            <h3>
              {error
                ? "Archivio non disponibile"
                : isSyncing
                  ? "Caricamento dell’archivio…"
                  : query
                    ? "Nessuna cartella trovata"
                    : "Nessun paziente dimesso"}
            </h3>
            <p>
              {error
                ? "Riprova il collegamento per caricare le cartelle."
                : query
                  ? "Prova con un altro nome."
                  : "Le cartelle compariranno qui dopo la dimissione."}
            </p>
          </div>
        ) : (
          <div className="archive-list">
            {rows.map((p) => (
              <article className="archive-row" key={p.id}>
                <div>
                  <Link className="patient-name" to={`/patient/${p.id}`}>
                    {patientName(p)}
                  </Link>
                  <span className="cell-subline">{p.diagnosis}</span>
                  <PatientTeamBadges patient={p} />
                </div>
                <div>
                  <span className="cell-subline">Dimissione</span>
                  {dateLabel(p.dischargeDate)}
                </div>
                <div className="row-actions">
                  <button
                    className="button secondary"
                    disabled={pending.includes(p.id)}
                    onClick={() => {
                      if (
                        window.confirm(
                          `Riportare ${patientName(p)} in reparto?`,
                        )
                      )
                        updatePatient(p.id, {
                          status: "Active",
                          dischargeDate: null,
                        });
                    }}
                  >
                    <RotateCcw size={15} />
                    <span>Riammetti</span>
                  </button>
                  {role === "admin" && (
                    <button
                      className="icon-button danger"
                      disabled={pending.includes(p.id)}
                      aria-label={`Elimina cartella di ${patientName(p)}`}
                      onClick={() => {
                        if (
                          window.confirm(
                            `Eliminare definitivamente la cartella di ${patientName(p)}? Questa operazione non è annullabile.`,
                          )
                        )
                          deletePatient(p.id);
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                  <Link
                    className="icon-button"
                    to={`/patient/${p.id}`}
                    aria-label={`Apri cartella di ${patientName(p)}`}
                  >
                    <ArrowUpRight size={17} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
