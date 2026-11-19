import { useState } from "react";
import { NavLink, Outlet, Link } from "react-router-dom";
import {
  LayoutList,
  Plus,
  Archive,
  ClipboardList,
  Settings,
  LogOut,
  BookOpen,
  RefreshCw,
} from "lucide-react";
import Brand from "../components/Brand";
import SettingsModal from "../components/SettingsModal";
import { usePatientStore } from "../store/usePatientStore";
const protocol =
  "https://1drv.ms/i/c/1463450412a5421e/IQCOVSR2aP7_Q580gCIQAPpsAd2rv9-xl1lC03oZIf_cf78?e=2DreF8";
const links = [
  { to: "/", label: "Pazienti", Icon: LayoutList },
  { to: "/handover", label: "Consegne", Icon: ClipboardList },
  { to: "/archive", label: "Archivio", Icon: Archive },
];
export default function MainLayout({ user, onSignOut }) {
  const [settings, setSettings] = useState(false);
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
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link to="/" className="brand-link" aria-label="Scolioward, pazienti">
          <Brand />
        </Link>
        <div className="workspace-label">
          Ortopedia e traumatologia<span>Gestione del postoperatorio</span>
        </div>
        <nav aria-label="Navigazione principale">
          {links.map(({ to, label, Icon }) => (
            <NavLink end={to === "/"} key={to} to={to}>
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
          <Link to="/add">
            <Plus size={18} />
            Nuovo paziente
          </Link>
        </nav>
        <div className="sidebar-bottom">
          <a href={protocol} target="_blank" rel="noreferrer">
            <BookOpen size={18} />
            Protocollo ERAS
          </a>
          <button onClick={() => setSettings(true)}>
            <Settings size={18} />
            Impostazioni
          </button>
          <div className="account-row">
            <span className="initials">
              {demo
                ? "D"
                : (user?.name || user?.email || "S").slice(0, 2).toUpperCase()}
            </span>
            <span>
              {demo ? "Modalità demo" : user?.name || "Spine team"}
              <small>{demo ? "Solo dati di esempio" : user?.email}</small>
            </span>
            <button
              className="icon-button"
              onClick={onSignOut}
              aria-label={demo ? "Esci dalla demo" : "Esci dal tuo account"}
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>
      <div className="app-body">
        <header className="mobile-header">
          <Link to="/" className="brand-link">
            <Brand />
          </Link>
          <button
            className="icon-button"
            onClick={() => setSettings(true)}
            aria-label="Impostazioni"
          >
            <Settings size={20} />
          </button>
        </header>
        <div className="connection-bar">
          <span className="scope-label">
            Spine team <span>/</span> Giro visita
          </span>
          <button
            className="sync-status"
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
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
        <NavLink to="/add">
          <Plus size={20} />
          <span>Nuovo</span>
        </NavLink>
      </nav>
      {settings && (
        <SettingsModal
          onClose={() => setSettings(false)}
          onSignOut={onSignOut}
        />
      )}
    </div>
  );
}
