import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

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

    let intervalId;

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

    if (localUrl) {
      setIsSyncing(true);
      fetchRemote();
      intervalId = setInterval(fetchRemote, 10000);
    } else {
      setPatients(localPatients);
      initialized.current = true;
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
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
    const updated = patients.map(p => p.id === id ? { ...p, ...newFlags } : p);
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
