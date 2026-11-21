import { useEffect, useState } from "react";
import Modal from "./Modal";
import { apiRequest } from "../lib/auth";
import { usePatientStore } from "../store/usePatientStore";

export default function UsersModal({ onClose }) {
  const { demo } = usePatientStore();
  const [users, setUsers] = useState(null);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  useEffect(() => {
    if (demo) return;
    const controller = new AbortController();
    apiRequest("/api/users", { signal: controller.signal })
      .then((result) => {
        if (!controller.signal.aborted) setUsers(result.users);
      })
      .catch((failure) => {
        if (!controller.signal.aborted) setError(failure.message);
      });
    return () => controller.abort();
  }, [demo, reload]);
  return (
    <Modal title="Utenti registrati" className="users-modal" onClose={onClose}>
      <p className="users-access-note">
        I nuovi registrati sono abilitati automaticamente come collaboratori
        dopo la verifica dell’email.
      </p>
      {demo ? (
        <p>Gli utenti reali sono visibili solo dall’account amministratore.</p>
      ) : error ? (
        <div role="alert">
          <p className="field-error">{error}</p>
          <button
            className="button secondary"
            onClick={() => {
              setError("");
              setUsers(null);
              setReload(reload + 1);
            }}
          >
            Riprova
          </button>
        </div>
      ) : !users ? (
        <p role="status">Caricamento degli utenti…</p>
      ) : (
        <>
          <p className="users-total">
            {users.length}{" "}
            {users.length === 1 ? "utente registrato" : "utenti registrati"}
          </p>
          <ul className="registered-users">
            {users.map((user) => (
              <li key={user.id}>
                <div className="registered-user-heading">
                  <strong>{user.name || user.email}</strong>
                  <span className="user-role">
                    {user.role === "admin" ? "Amministratore" : "Collaboratore"}
                  </span>
                </div>
                <p className="registered-user-email">{user.email}</p>
                <div className="registered-user-meta">
                  <span>
                    {!user.email_verified
                      ? "Email da verificare"
                      : user.enabled
                        ? "Accesso abilitato"
                        : "Accesso sospeso"}
                  </span>
                  <span>
                    Registrato il{" "}
                    {new Intl.DateTimeFormat("it-IT", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      timeZone: "Europe/Rome",
                    }).format(new Date(user.registered_at))}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </Modal>
  );
}
