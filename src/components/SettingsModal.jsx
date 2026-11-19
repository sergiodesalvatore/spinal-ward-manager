import Modal from "./Modal";
import { usePatientStore } from "../store/usePatientStore";
export default function SettingsModal({ onClose, onSignOut }) {
  const { demo, lastSynced, error, refresh } = usePatientStore();
  const downloadOldCache = () => {
    const old = localStorage.getItem("spine-ward-patients");
    if (!old) {
      window.alert(
        "Su questo browser non è presente la vecchia copia locale. Prova sul dispositivo usato in precedenza.",
      );
      return;
    }
    const url = URL.createObjectURL(
      new Blob([old], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "scolioward-recupero-locale.json";
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <Modal title="Impostazioni" onClose={onClose}>
      <section className="settings-section">
        <h3>Collegamento e sincronizzazione</h3>
        <p>
          {demo
            ? "La demo funziona in memoria e non accede al database."
            : error
              ? "Connessione non disponibile. Nessun salvataggio viene confermato senza risposta del server."
              : lastSynced
                ? "Collegamento a Neon riuscito."
                : "Il collegamento al database non è ancora stato verificato."}
        </p>
        <dl className="key-values">
          <div>
            <dt>Ultima lettura riuscita</dt>
            <dd>{lastSynced?.toLocaleString("it-IT") || "—"}</dd>
          </div>
          <div>
            <dt>Aggiornamento</dt>
            <dd>{demo ? "Demo locale" : "Ogni 45 s, a pagina visibile"}</dd>
          </div>
          <div>
            <dt>Dati nel browser</dt>
            <dd>Solo durante la sessione</dd>
          </div>
        </dl>
        <button className="button secondary" onClick={refresh} disabled={demo}>
          Verifica collegamento
        </button>
      </section>
      <section className="settings-section">
        <h3>Recupera la versione precedente</h3>
        <p>
          Il vecchio Scolioward poteva conservare una copia dei pazienti sul
          dispositivo. Puoi scaricarla da questo browser per il recupero, senza
          cancellarla.
        </p>
        <button className="button secondary" onClick={downloadOldCache}>
          Scarica la vecchia copia locale
        </button>
      </section>
      <section className="settings-section">
        <h3>Accesso web</h3>
        <a
          href="https://scolioward.vercel.app"
          target="_blank"
          rel="noreferrer"
        >
          scolioward.vercel.app
        </a>
        <p>
          Su iPhone: Condividi → Aggiungi alla schermata Home. Su Android: menu
          del browser → Aggiungi a schermata Home.
        </p>
      </section>
      <button className="button secondary" onClick={onSignOut}>
        {demo ? "Esci dalla demo" : "Esci dal tuo account"}
      </button>
    </Modal>
  );
}
