import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { authClient } from "./lib/auth";
import { PatientProvider } from "./store/PatientContext";
import MainLayout from "./layouts/MainLayout";
import WardDashboard from "./pages/WardDashboard";
import PatientFormPage from "./pages/PatientFormPage";
import PatientDetailPage from "./pages/PatientDetailPage";
import ArchivePage from "./pages/ArchivePage";
import HandoverPage from "./pages/HandoverPage";
import LoginPage from "./pages/LoginPage";
import "./index.css";
export default function App() {
  const [demo, setDemo] = useState(
    () => new URLSearchParams(window.location.search).get("demo") === "1",
  );
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(Boolean(authClient));
  const [authError, setAuthError] = useState("");
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const result = await authClient?.getSession();
        if (active) {
          if (!result?.error) setSession(result?.data || null);
          setAuthError(
            result?.error
              ? "Il servizio di accesso non risponde. Riprova."
              : "",
          );
        }
      } catch {
        if (active)
          setAuthError("Connessione al servizio di accesso non disponibile.");
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    window.addEventListener("focus", load);
    return () => {
      active = false;
      window.removeEventListener("focus", load);
    };
  }, []);
  if (!demo && loading)
    return (
      <div className="auth-loading" role="status">
        Apertura di Scolioward…
      </div>
    );
  if (!demo && !session?.user)
    return (
      <LoginPage
        error={authError}
        onSession={setSession}
        onDemo={() => setDemo(true)}
      />
    );
  const signOut = async () => {
    if (demo) {
      setDemo(false);
      window.history.replaceState(null, "", "/");
      return;
    }
    try {
      const result = await authClient.signOut();
      if (result.error) throw new Error();
      setSession(null);
    } catch {
      setAuthError("Uscita non riuscita. Riprova.");
    }
  };
  return (
    <PatientProvider key={demo ? "demo" : session.user.id} demo={demo}>
      <BrowserRouter>
        <Routes>
          <Route
            element={<MainLayout user={session?.user} onSignOut={signOut} />}
          >
            <Route path="/" element={<WardDashboard />} />
            <Route path="/add" element={<PatientFormPage />} />
            <Route path="/archive" element={<ArchivePage />} />
            <Route path="/patient/:id" element={<PatientDetailPage />} />
            <Route path="/handover" element={<HandoverPage />} />
            <Route path="*" element={<WardDashboard />} />
          </Route>
        </Routes>
        {authError && (
          <div className="toast" role="alert">
            {authError}
          </div>
        )}
      </BrowserRouter>
    </PatientProvider>
  );
}
