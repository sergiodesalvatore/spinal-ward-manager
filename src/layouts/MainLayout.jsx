import { useState } from "react";
import { NavLink, Outlet, Link } from "react-router-dom";
import {
  Users,
  Archive,
  ClipboardList,
  Settings,
  BookOpen,
  RefreshCw,
} from "lucide-react";
import Brand from "../components/Brand";
import SettingsModal from "../components/SettingsModal";
import UsersModal from "../components/UsersModal";
import ProtocolModal from "../components/ProtocolModal";
import { usePatientStore } from "../store/usePatientStore";
const links = [
  { to: "/", label: "Pazienti", Icon: Users },
  { to: "/handover", label: "Consegne", Icon: ClipboardList },
  { to: "/archive", label: "Archivio", Icon: Archive },
];
export default function MainLayout({ user, onSignOut }) {
  const [settings, setSettings] = useState(false);
  const [protocol, setProtocol] = useState(false);
  const [usersOpen, setUsersOpen] = useState(false);
  const { demo, isSyncing, lastSynced, error, refresh, pending } =
    usePatientStore();
  const status = demo
    ? "Ambiente dimostrativo"
    : pending.length
      ? "Salvataggio…"
      : isSyncing
        ? "Sincronizzazione…"
        : error
          ? "Da riconnettere"
          : lastSynced
            ? `Aggiornato alle ${lastSynced.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}`
            : "In attesa di collegamento";
  const initials = demo
    ? "D"
    : (user?.name || user?.email || "S").slice(0, 2).toUpperCase();
  return (
    <div className="app-shell">
      <header className="app-topbar">
        <div className="topbar-inner">
          <Link to="/" className="brand-link" aria-label="Scolioward, pazienti">
            <Brand />
          </Link>
          <nav className="desktop-nav" aria-label="Navigazione principale">
            {links.map(({ to, label }) => (
              <NavLink end={to === "/"} key={to} to={to}>
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="topbar-tools">
            <button
              className="protocol-link"
              onClick={() => setProtocol(true)}
              aria-label="Protocollo ERAS"
            >
              <BookOpen size={17} />
              <span>Protocollo ERAS</span>
            </button>
            <button
              className="account-button"
              onClick={() => setSettings(true)}
              aria-label="Impostazioni e account"
            >
              <Settings size={18} />
              <span className="initials" aria-hidden="true">
                {initials}
              </span>
            </button>
          </div>
        </div>
      </header>
      <div className="app-body">
        <div className="connection-bar">
          <span className="scope-label">
            Spine team <span>/</span> Chirurgia vertebrale
          </span>
          <button
            className={`sync-status ${error ? "sync-offline" : ""}`}
            onClick={refresh}
            disabled={isSyncing || demo}
            title="Aggiorna i dati"
          >
            <RefreshCw size={13} className={isSyncing ? "spinning" : ""} />
            {status}
          </button>
        </div>
        {demo && (
          <div className="demo-notice">
            Demo con pazienti fittizi. Le modifiche si azzerano ricaricando la
            pagina.
          </div>
        )}
        <main className="canvas">
          <Outlet />
        </main>
        <footer className="app-footer">
          <span>Scolioward · Spine team</span>
          <span>
            {new Intl.DateTimeFormat("it-IT", {
              timeZone: "Europe/Rome",
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            }).format(new Date())}
          </span>
        </footer>
      </div>
      <nav className="bottom-nav" aria-label="Navigazione mobile">
        {links.map(({ to, label, Icon }) => (
          <NavLink end={to === "/"} key={to} to={to}>
            <Icon size={21} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      {settings && (
        <SettingsModal
          onClose={() => setSettings(false)}
          onSignOut={onSignOut}
          onOpenUsers={() => {
            setSettings(false);
            setUsersOpen(true);
          }}
          onOpenProtocol={() => {
            setSettings(false);
            setProtocol(true);
          }}
        />
      )}
      {usersOpen && <UsersModal onClose={() => setUsersOpen(false)} />}
      {protocol && <ProtocolModal onClose={() => setProtocol(false)} />}
    </div>
  );
}
