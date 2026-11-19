export function localDate(value = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Rome",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(value);
}
export function postOpDays(date) {
  if (!date) return 0;
  const today = Date.parse(`${localDate()}T00:00:00Z`);
  const operation = Date.parse(`${date.slice(0, 10)}T00:00:00Z`);
  return Number.isFinite(operation)
    ? Math.max(0, Math.floor((today - operation) / 86400000))
    : 0;
}
export const activePatient = (p) =>
  !["Archived", "Discharged"].includes(p.status);
export const diaryDone = (p) =>
  Boolean(
    p.diariaUpdatedAt && localDate(new Date(p.diariaUpdatedAt)) === localDate(),
  );
export function tasksFor(p) {
  const tasks = [];
  if (!diaryDone(p)) tasks.push("Diaria da aggiornare");
  if (postOpDays(p.operationDate) >= 2 && (p.hasCV || p.hasDrainage))
    tasks.push("Presidi da rivalutare");
  if (p.rxStatus === "Richiesta") tasks.push("RX in attesa");
  if (p.handover) tasks.push("Consegna presente");
  return tasks;
}
export const patientName = (p) =>
  `${p.lastName || ""} ${p.firstName || ""}`.trim();
export const dateLabel = (value) =>
  value
    ? new Intl.DateTimeFormat("it-IT", {
        timeZone: "Europe/Rome",
        day: "2-digit",
        month: "short",
      }).format(new Date(`${value.slice(0, 10)}T12:00:00Z`))
    : "—";

export const patientCount = (count) =>
  `${count} ${count === 1 ? "paziente" : "pazienti"}`;
