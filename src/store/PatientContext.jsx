import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

const STORAGE_KEY = 'spine-ward-patients';
const PatientContext = createContext();

export const PatientProvider = ({ children }) => {
  const [patients, setPatients] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const initialized = useRef(false);
  useEffect(() => {
    // Initial fetch from Supabase
    const fetchPatients = async () => {
      setIsSyncing(true);
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('operationDate', { ascending: false });

      if (error) {
        console.error("Supabase fetch failed", error);
        // Fallback to local storage if offline or error
        const local = localStorage.getItem(STORAGE_KEY);
        if (local) setPatients(JSON.parse(local));
      } else {
        setPatients(data || []);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      }
      setIsSyncing(false);
      initialized.current = true;
    };

    fetchPatients();

    // Setup Real-time Subscription
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'patients'
        },
        (payload) => {
          // Whenever something changes on the server, we fetch the fresh list
          // This handles cases where multiple users update different patients
          fetchPatients();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addPatient = async (patient) => {
    // Optimistic UI
    const tempPatients = [...patients, patient];
    setPatients(tempPatients);
    
    const { error } = await supabase.from('patients').insert([patient]);
    if (error) {
      console.error("Supabase insert failed", error);
      // Revert if failed
      setPatients(patients);
    }
  };

  const updatePatient = async (id, newFlags) => {
    // Optimistic UI updates are handled implicitly by keeping local state
    // But we need to update the server
    const updated = patients.map(p => {
      if (p.id === id) {
        const updatedObj = { ...p, ...newFlags };
        if (newFlags.diariaUpdated === true) {
          updatedObj.diariaUpdatedAt = new Date().toISOString();
        }
        return updatedObj;
      }
      return p;
    });

    setPatients(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    const { error } = await supabase
      .from('patients')
      .update({ ...newFlags, diariaUpdatedAt: newFlags.diariaUpdated === true ? new Date().toISOString() : undefined })
      .eq('id', id);

    if (error) {
      console.error("Supabase update failed", error);
    }
  };

  const deletePatient = async (id) => {
    const updated = patients.filter(p => p.id !== id);
    setPatients(updated);
    
    const { error } = await supabase.from('patients').delete().eq('id', id);
    if (error) console.error("Supabase delete failed", error);
  };

  return (
    <PatientContext.Provider value={{
      patients, isSyncing, addPatient, updatePatient, deletePatient
    }}>
      {children}
    </PatientContext.Provider>
  );
};

export const usePatientContext = () => useContext(PatientContext);
