import { useState, useEffect, useRef } from 'react';

const STORAGE_KEY = 'spine-ward-patients';
const SYNC_URL_KEY = 'spine-ward-sync-url';
const SYNC_KEY_KEY = 'spine-ward-sync-apikey';

export const usePatientStore = () => {
  const [patients, setPatients] = useState([]);
  const [syncUrl, setSyncUrl] = useState('');
  const [syncApiKey, setSyncApiKey] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const initialized = useRef(false);

  // Initial load
  useEffect(() => {
    // Clear out any old Google Apps Script URL if it exists, to avoid confusion
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
      try {
        localPatients = JSON.parse(raw);
      } catch (e) {
        console.error("Failed to parse local patients", e);
      }
    }

    if (localUrl) {
      setIsSyncing(true);
      fetch(localUrl, {
        headers: localKey ? { 'X-Master-Key': localKey } : {}
      })
        .then(res => res.json())
        .then(data => {
          // JSONBin wraps data in "record" attribute
          const fetchedData = data.record || data;
          if (Array.isArray(fetchedData)) {
            setPatients(fetchedData);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(fetchedData));
          } else {
            setPatients(localPatients);
          }
        })
        .catch(err => {
          console.error("Fetch failed, falling back to local", err);
          setPatients(localPatients);
        })
        .finally(() => {
          setIsSyncing(false);
          initialized.current = true;
        });
    } else {
      setPatients(localPatients);
      initialized.current = true;
    }
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

  const addPatient = (patient) => {
    saveToStorage([...patients, patient]);
  };

  const updatePatient = (id, newFlags) => {
    const updated = patients.map(p => 
      p.id === id ? { ...p, ...newFlags } : p
    );
    saveToStorage(updated);
  };

  const deletePatient = (id) => {
    saveToStorage(patients.filter(p => p.id !== id));
  };

  return {
    patients,
    syncUrl,
    syncApiKey,
    isSyncing,
    saveSyncConfig,
    addPatient,
    updatePatient,
    deletePatient
  };
};
