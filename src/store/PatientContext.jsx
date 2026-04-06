import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

// Polling interval (ms). Can be overridden via REACT_APP_POLL_INTERVAL_MS env variable.
const POLL_INTERVAL_MS = Number(process.env.REACT_APP_POLL_INTERVAL_MS) || 2000;

const STORAGE_KEY = 'spine-ward-patients';
const SYNC_URL_KEY = 'spine-ward-sync-url';
const SYNC_KEY_KEY = 'spine-ward-sync-apikey';

const PatientContext = createContext();

export const PatientProvider = ({ children }) => {
  const [patients, setPatients] = useState([]);
  const [syncUrl, setSyncUrl] = useState('');
  const [syncApiKey, setSyncApiKey] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const initialized = useRef(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    let localUrl = localStorage.getItem(SYNC_URL_KEY) || 'https://api.jsonbin.io/v3/b/69ce73b8856a682189f28c19';
    if (localUrl.includes('script.google.com')) {
      localUrl = '';
      localStorage.removeItem(SYNC_URL_KEY);
    }
    const localKey = localStorage.getItem(SYNC_KEY_KEY) || '$2a$10$RV5cxNNHqP7SYsZfbyEJtOB5/FEj/mnrnC0vS/Ql8b3mWa5WA2f.6';
    
    setSyncUrl(localUrl);
    setSyncApiKey(localKey);

    const raw = localStorage.getItem(STORAGE_KEY);
    let localPatients = [];
    if (raw) {
      try { localPatients = JSON.parse(raw); } catch (e) { console.error(e); }
    }

    const fetchRemote = () => {
      if (!localUrl) return;
      fetch(localUrl, { headers: localKey ? { 'X-Master-Key': localKey } : {} })
        .then(res => res.json())
        .then(data => {
          const fetchedData = data.record || data;
          if (Array.isArray(fetchedData)) {
            // Need to check if there's actually a change to prevent re-renders when nothing changed
            setPatients(prev => {
              if (JSON.stringify(prev) !== JSON.stringify(fetchedData)) {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(fetchedData));
                return fetchedData;
              }
              return prev;
            });
          }
        })
        .catch(err => console.error("Poll failed", err))
        .finally(() => {
          setIsSyncing(false);
          initialized.current = true;
        });
    };

    const startPolling = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(fetchRemote, POLL_INTERVAL_MS);
    };

    const stopPolling = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        // When tab becomes visible, fetch immediately then resume interval
        fetchRemote();
        startPolling();
      }
    };

    if (localUrl) {
      setIsSyncing(true);
      fetchRemote();
      startPolling();
      document.addEventListener('visibilitychange', handleVisibilityChange);
    } else {
      setPatients(localPatients);
      initialized.current = true;
    }

    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const saveToStorage = async (updatedPatients) => {
    setPatients(updatedPatients);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPatients));

    if (syncUrl && initialized.current) {
      setIsSyncing(true);
      try {
        await fetch(syncUrl, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'X-Bin-Versioning': 'false',
            ...(syncApiKey ? { 'X-Master-Key': syncApiKey } : {})
          },
          body: JSON.stringify(updatedPatients)
        });
      } catch (e) {
        console.error("Remote save failed", e);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const saveSyncConfig = (url, apiKey) => {
    setSyncUrl(url);
    setSyncApiKey(apiKey);
    localStorage.setItem(SYNC_URL_KEY, url);
    localStorage.setItem(SYNC_KEY_KEY, apiKey);
  };

  const addPatient = (patient) => saveToStorage([...patients, patient]);

  const updatePatient = (id, newFlags) => {
    const updated = patients.map(p => {
      if (p.id === id) {
        const updatedObj = { ...p, ...newFlags };
        // If diariaUpdated is being set to true, add/update the timestamp
        if (newFlags.diariaUpdated === true) {
          updatedObj.diariaUpdatedAt = new Date().toISOString();
        }
        return updatedObj;
      }
      return p;
    });
    saveToStorage(updated);
  };

  const deletePatient = (id) => saveToStorage(patients.filter(p => p.id !== id));

  return (
    <PatientContext.Provider value={{
      patients, syncUrl, syncApiKey, isSyncing, saveSyncConfig, addPatient, updatePatient, deletePatient
    }}>
      {children}
    </PatientContext.Provider>
  );
};

export const usePatientContext = () => useContext(PatientContext);
