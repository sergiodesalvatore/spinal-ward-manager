import { useState } from "react";
import { ArrowRight, LockKeyhole } from "lucide-react";
import Brand from "../components/Brand";
import { authClient } from "../lib/auth";
export default function LoginPage({
  onSession,
  onDemo,
  error: connectionError,
}) {
  const [mode, setMode] = useState(() =>
    new URLSearchParams(window.location.search).has("token")
      ? "newpassword"
      : "signin",
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const run = async (e) => {
    e.preventDefault();
    setPending(true);
    setError("");
    setNotice("");
    try {
      if (!authClient)
        throw new Error(
          "Il collegamento a Neon deve ancora essere completato.",
        );
      let result;
      if (mode === "newpassword") {
        result = await authClient.resetPassword({
          newPassword: password,
          token: new URLSearchParams(window.location.search).get("token"),
        });
        if (!result.error) {
          window.history.replaceState(null, "", "/");
          setMode("signin");
          setNotice("Password aggiornata. Accedi con la nuova password.");
          return;
        }
      } else if (mode === "signup") {
        result = await authClient.signUp.email({
          email,
          password,
          name: email.split("@")[0],
        });
        if (!result.error) {
          setMode("verify");
          setNotice("Controlla la posta: inserisci il codice di verifica.");
          return;
        }
      } else if (mode === "verify") {
        result = await authClient.emailOtp.verifyEmail({ email, otp });
        if (!result.error) {
          setMode("signin");
          setNotice("Email verificata. Ora puoi accedere.");
          return;
        }
      } else if (mode === "reset") {
        result = await authClient.requestPasswordReset({
          email,
          redirectTo: window.location.origin + "/",
        });
        if (!result.error) {
          setNotice(
            "Se l’indirizzo è registrato riceverai le istruzioni via email.",
          );
          return;
        }
      } else result = await authClient.signIn.email({ email, password });
      if (result?.error)
        throw new Error(
          mode === "signin"
            ? "Accesso non riuscito. Verifica email, password e conferma dell’indirizzo email."
            : result.error.message,
        );
      const session = await authClient.getSession();
      if (session.error) throw new Error(session.error.message);
      onSession(session.data);
    } catch (e) {
      setError(e.message || "Accesso non riuscito. Riprova.");
    } finally {
      setPending(false);
    }
  };
  const resend = async () => {
    if (!email || !authClient) return;
    setPending(true);
    setError("");
    try {
      const r = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "email-verification",
      });
      if (r.error) throw new Error(r.error.message);
      setNotice("Codice inviato. Controlla anche la cartella spam.");
    } catch (e) {
      setError(e.message);
    } finally {
      setPending(false);
    }
  };
  return (
    <div className="login-shell">
      <div className="login-top">
        <Brand />
        <a href="https://scolioward.vercel.app">Accesso web</a>
      </div>
      <main className="login-main">
        <section className="login-intro">
          <div className="login-spine" aria-hidden="true">
            <img src="/brand-vertebra.svg" width="88" height="88" alt="" />
          </div>
          <p className="login-title">
            Chirurgia
            <br />
            vertebrale
          </p>
          <p>
            Pazienti, giro visita e consegne per il team di chirurgia
            vertebrale.
          </p>
          <div className="login-caption">
            Scolioward · Ortopedia e traumatologia
          </div>
        </section>
        <section className="login-form-panel">
          <LockKeyhole size={22} />
          <h1>
            {mode === "signup"
              ? "Crea il tuo accesso"
              : mode === "verify"
                ? "Verifica la tua email"
                : mode === "reset"
                  ? "Recupera la password"
                  : mode === "newpassword"
                    ? "Scegli una nuova password"
                    : "Accedi a Scolioward"}
          </h1>
          <p>
            Dopo la verifica dell’email, il tuo account sarà abilitato come
            collaboratore.
          </p>
          {!authClient && (
            <div className="setup-notice">
              Collegamento a Neon in preparazione. Puoi già esplorare la nuova
              interfaccia con dati dimostrativi.
            </div>
          )}
          <form onSubmit={run}>
            <label>
              Email
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            {(mode === "signin" ||
              mode === "signup" ||
              mode === "newpassword") && (
              <label>
                Password
                <input
                  type="password"
                  required
                  minLength={mode === "signin" ? 1 : 12}
                  autoComplete={
                    mode === "signin" ? "current-password" : "new-password"
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {mode !== "signin" && <small>Almeno 12 caratteri.</small>}
              </label>
            )}
            {mode === "verify" && (
              <label>
                Codice ricevuto per email
                <input
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </label>
            )}
            {(error || connectionError) && (
              <p className="field-error" role="alert">
                {error || connectionError}
              </p>
            )}
            {notice && <p role="status">{notice}</p>}
            <button
              className="button primary"
              disabled={pending || !authClient}
            >
              {pending
                ? "Attendi…"
                : mode === "signin"
                  ? "Accedi"
                  : mode === "signup"
                    ? "Crea accesso"
                    : mode === "verify"
                      ? "Verifica email"
                      : mode === "newpassword"
                        ? "Salva password"
                        : "Invia istruzioni"}
              <ArrowRight size={16} />
            </button>
          </form>
          <div className="login-options">
            {mode === "verify" && (
              <button disabled={pending || !email} onClick={resend}>
                Invia di nuovo il codice
              </button>
            )}
            {mode === "signin" && (
              <button
                onClick={() => {
                  setMode("verify");
                  setError("");
                  setNotice(
                    "Inserisci il codice ricevuto oppure richiedine uno nuovo.",
                  );
                }}
              >
                Hai un codice di verifica?
              </button>
            )}
            <button
              onClick={() => {
                setMode(mode === "signup" ? "signin" : "signup");
                setError("");
                setNotice("");
              }}
            >
              {mode === "signup"
                ? "Hai già un accesso? Accedi"
                : "Primo accesso? Registrati"}
            </button>
            <button
              onClick={() => {
                setMode(mode === "reset" ? "signin" : "reset");
                setError("");
                setNotice("");
              }}
            >
              {mode === "reset" ? "Torna all’accesso" : "Password dimenticata?"}
            </button>
          </div>
          <div className="demo-entry">
            <span>Modalità demo</span>
            <button className="button secondary" onClick={onDemo}>
              Apri demo <ArrowRight size={16} />
            </button>
            <small>Solo dati di esempio, nessuna cartella reale.</small>
          </div>
        </section>
      </main>
    </div>
  );
}
