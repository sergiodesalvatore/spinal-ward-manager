import { CONSULTANTS, RESIDENTS } from "../shared/careTeam.js";
export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
export const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const strings = {
  firstName: 100,
  lastName: 100,
  bedNumber: 20,
  diagnosis: 500,
  notes: 10000,
  handover: 5000,
};
const enums = {
  consultant: CONSULTANTS,
  resident: RESIDENTS,
  location: ["Reparto", "Terapia Intensiva"],
  status: ["Active", "Discharged", "Archived"],
  rxStatus: ["Non Richiesta", "Richiesta", "Eseguita"],
};
const booleans = ["hasDrainage", "hasCV", "writtenDischarge", "diariaUpdated"];
function validDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return false;
  const date = new Date(value + "T12:00:00Z");
  return (
    Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}
export function validateMutation(body, method) {
  if (
    !body ||
    typeof body !== "object" ||
    Array.isArray(body) ||
    !uuidPattern.test(body.id || "")
  )
    throw new HttpError(400, "Identificativo del paziente non valido.");
  if (
    method !== "POST" &&
    (!Number.isSafeInteger(body.version) || body.version < 1)
  )
    throw new HttpError(
      400,
      "Versione della cartella mancante. Aggiorna i dati.",
    );
  if (method === "DELETE") return { id: body.id, version: body.version };
  if (!body.data || typeof body.data !== "object" || Array.isArray(body.data))
    throw new HttpError(400, "Dati del paziente non validi.");
  const clean = {};
  for (const [key, value] of Object.entries(body.data)) {
    if (key === "id" && method === "POST" && value === body.id) continue;
    if (key in strings) {
      if (
        typeof value !== "string" ||
        value.length > strings[key] ||
        (["firstName", "lastName", "diagnosis"].includes(key) && !value.trim())
      )
        throw new HttpError(400, `Valore non valido per ${key}.`);
      clean[key] = value.trim();
    } else if (key in enums) {
      if (!enums[key].includes(value))
        throw new HttpError(400, `Valore non valido per ${key}.`);
      clean[key] = value;
    } else if (booleans.includes(key)) {
      if (typeof value !== "boolean")
        throw new HttpError(400, `Valore non valido per ${key}.`);
      clean[key] = value;
    } else if (key === "operationDate" || key === "dischargeDate") {
      if (key === "dischargeDate" && value === null) clean[key] = null;
      else {
        if (!validDate(value)) throw new HttpError(400, "Data non valida.");
        clean[key] = value;
      }
    } else if (key === "diariaUpdatedAt") {
      // The server owns the timestamp; it is regenerated from diariaUpdated below.
      if (
        value !== null &&
        (typeof value !== "string" || !Number.isFinite(Date.parse(value)))
      )
        throw new HttpError(400, "Data della diaria non valida.");
    } else throw new HttpError(400, `Campo non consentito: ${key}.`);
  }
  if (method === "POST") {
    if (!clean.consultant || !clean.resident)
      throw new HttpError(
        400,
        "Seleziona il referente e lo specializzando del paziente.",
      );
    for (const key of [
      "firstName",
      "lastName",
      "diagnosis",
      "operationDate",
      "location",
    ])
      if (!clean[key])
        throw new HttpError(
          400,
          "Completa anagrafica, intervento e ubicazione.",
        );
    Object.assign(clean, {
      status: clean.status || "Active",
      rxStatus: clean.rxStatus || "Non Richiesta",
      hasDrainage: clean.hasDrainage ?? false,
      hasCV: clean.hasCV ?? false,
      writtenDischarge: clean.writtenDischarge ?? false,
      diariaUpdated: clean.diariaUpdated ?? false,
    });
  }
  if ("diariaUpdated" in clean)
    clean.diariaUpdatedAt = clean.diariaUpdated
      ? new Date().toISOString()
      : null;
  if (!Object.keys(clean).length)
    throw new HttpError(400, "Nessuna modifica da salvare.");
  return { id: body.id, version: body.version, data: clean };
}
