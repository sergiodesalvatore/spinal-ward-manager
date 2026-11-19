import { useContext } from "react";
import { PatientContext } from "../lib/patientContext";
export const usePatientStore = () => useContext(PatientContext);
