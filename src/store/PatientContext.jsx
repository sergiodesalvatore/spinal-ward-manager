import { useCallback, useEffect, useRef, useState } from "react";
import { PatientContext } from "../lib/patientContext";
import { apiRequest } from "../lib/auth";
import { demoPatients } from "../lib/demo";
export function PatientProvider({ children, demo = false }) {
  const [patients, setPatients] = useState(() => (demo ? demoPatients() : []));
  const [isSyncing, setIsSyncing] = useState(!demo);
  const [error, setError] = useState("");
  const [lastSynced, setLastSynced] = useState(null);
  const [pending, setPending] = useState([]);
  const [role, setRole] = useState(demo ? "admin" : "staff");
  const current = useRef(patients);
  const sequence = useRef(0);
  const fetching = useRef(false);
  const busy = useRef(new Set());
  const replace = useCallback((next) => {
    current.current = next;
    setPatients(next);
  }, []);
  const refresh = useCallback(async () => {
    if (demo || fetching.current || busy.current.size) return;
    fetching.current = true;
    const generation = sequence.current;
    setIsSyncing(true);
    try {
      const result = await apiRequest("/api/patients");
      if (sequence.current === generation) {
        replace(result.patients);
        setRole(result.role);
        setLastSynced(new Date());
        setError("");
      }
    } catch (e) {
      setError(e.message);
      if ([401, 403].includes(e.status)) {
        replace([]);
        setLastSynced(null);
        setRole("staff");
      }
    } finally {
      fetching.current = false;
      setIsSyncing(false);
    }
  }, [demo, replace]);
  useEffect(() => {
    // Clinical records stay in memory: no new browser-storage cache.
    const startup = setTimeout(refresh, 0);
    const visibleRefresh = () => {
      if (!document.hidden && navigator.onLine) refresh();
    };
    const timer = setInterval(visibleRefresh, 45000);
    window.addEventListener("online", visibleRefresh);
    window.addEventListener("focus", visibleRefresh);
    document.addEventListener("visibilitychange", visibleRefresh);
    return () => {
      clearTimeout(startup);
      clearInterval(timer);
      window.removeEventListener("online", visibleRefresh);
      window.removeEventListener("focus", visibleRefresh);
      document.removeEventListener("visibilitychange", visibleRefresh);
    };
  }, [refresh]);
  const mutate = async (method, id, changes = {}, expectedVersion) => {
    if (busy.current.has(id)) return false;
    if (!demo && !navigator.onLine) {
      setError(
        "Sei offline. La modifica non è stata salvata: riconnettiti e riprova.",
      );
      return false;
    }
    const original = current.current.find((p) => p.id === id);
    const data = { ...changes };
    if ("diariaUpdated" in data)
      data.diariaUpdatedAt = data.diariaUpdated
        ? new Date().toISOString()
        : null;
    busy.current.add(id);
    setPending([...busy.current]);
    sequence.current += 1;
    try {
      let saved;
      if (demo)
        saved = {
          ...original,
          ...data,
          id,
          _version: (original?._version || 0) + 1,
        };
      else {
        const result = await apiRequest("/api/patients", {
          method,
          body: JSON.stringify({
            id,
            data,
            version: expectedVersion ?? original?._version,
          }),
        });
        saved = result.patient;
      }
      replace(
        method === "DELETE"
          ? current.current.filter((p) => p.id !== id)
          : method === "POST"
            ? [...current.current, saved]
            : current.current.map((p) => (p.id === id ? saved : p)),
      );
      setLastSynced(new Date());
      setError("");
      return true;
    } catch (e) {
      setError(e.message);
      if ([401, 403].includes(e.status)) {
        replace([]);
        setLastSynced(null);
        setRole("staff");
      }
      return false;
    } finally {
      busy.current.delete(id);
      setPending([...busy.current]);
    }
  };
  return (
    <PatientContext.Provider
      value={{
        patients,
        isSyncing,
        error,
        lastSynced,
        pending,
        demo,
        refresh,
        role,
        addPatient: (p) => mutate("POST", p.id, p),
        updatePatient: (id, changes, expectedVersion) =>
          mutate("PATCH", id, changes, expectedVersion),
        deletePatient: (id) => mutate("DELETE", id),
      }}
    >
      {children}
    </PatientContext.Provider>
  );
}
