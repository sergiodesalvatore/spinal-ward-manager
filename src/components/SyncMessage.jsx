import { usePatientStore } from "../store/usePatientStore";
import { AlertCircle } from "lucide-react";
export default function SyncMessage() {
  const { error, refresh, lastSynced } = usePatientStore();
  if (!error) return null;
  return (
    <div className="sync-error" role="alert">
      <AlertCircle size={18} />
      <div>
        <strong>Connessione da verificare</strong>
        <p>{error}</p>
        {lastSynced && (
          <small>
            Ultima lettura riuscita: {lastSynced.toLocaleTimeString("it-IT")}. I
            dati visualizzati potrebbero essere cambiati.
          </small>
        )}
      </div>
      <button className="button secondary" onClick={refresh}>
        Riprova
      </button>
    </div>
  );
}
