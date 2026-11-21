import { useState } from "react";
import { apiRequest } from "../lib/auth";
import { usePatientStore } from "../store/usePatientStore";
const fieldNames = {
  consultant: "referente",
  resident: "specializzando",
  firstName: "nome",
  lastName: "cognome",
  bedNumber: "letto",
  diagnosis: "diagnosi",
  notes: "note cliniche",
  handover: "consegna",
  location: "ubicazione",
  status: "stato",
  rxStatus: "RX",
  hasDrainage: "drenaggio",
  hasCV: "catetere",
  writtenDischarge: "lettera di dimissione",
  diariaUpdated: "diaria",
  operationDate: "data intervento",
  dischargeDate: "dimissione",
};
export default function PatientHistory({ id }) {
  const { demo } = usePatientStore();
  const [events, setEvents] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await apiRequest(
        "/api/audit?id=" + encodeURIComponent(id),
      );
      setEvents(result.events);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <section className="history-panel">
      <div className="list-heading">
        <h2>Ultime modifiche</h2>
        <button
          className="button secondary"
          disabled={loading || demo}
          onClick={load}
        >
          {loading
            ? "Caricamento…"
            : events
              ? "Aggiorna registro"
              : "Apri registro"}
        </button>
      </div>
      {demo ? (
        <p className="history-note">
          Il registro è disponibile sulle cartelle salvate nel reparto.
        </p>
      ) : error ? (
        <p className="history-note field-error" role="alert">
          {error}
        </p>
      ) : events ? (
        <div className="history-list">
          {events.length ? (
            events.map((event, i) => (
              <div key={i}>
                <span>
                  {event.action === "create"
                    ? "Apertura cartella"
                    : event.action === "import"
                      ? "Importazione"
                      : event.action === "delete"
                        ? "Eliminazione"
                        : `Aggiornamento: ${event.fields
                            .filter((f) => f !== "diariaUpdatedAt")
                            .map((f) => fieldNames[f] || f)
                            .join(", ")}`}
                </span>
                <small>
                  {event.actor_email} ·{" "}
                  {new Date(event.created_at).toLocaleString("it-IT", {
                    timeZone: "Europe/Rome",
                  })}
                </small>
              </div>
            ))
          ) : (
            <p className="history-note">Nessuna modifica registrata.</p>
          )}
        </div>
      ) : (
        <p className="history-note">
          Consulta chi ha aggiornato la cartella e quando.
        </p>
      )}
    </section>
  );
}
