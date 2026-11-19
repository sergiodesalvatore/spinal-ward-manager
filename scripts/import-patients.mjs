import { readFile } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";
import { validateMutation } from "../server/validation.js";
const path = process.argv[2];
if (!path || !process.env.DATABASE_URL)
  throw new Error(
    "Uso: node --env-file=.env.local scripts/import-patients.mjs /percorso/backup.json",
  );
const input = JSON.parse(await readFile(path, "utf8"));
if (!Array.isArray(input))
  throw new Error("Il backup deve contenere un elenco di pazienti.");
const allowed = [
  "firstName",
  "lastName",
  "bedNumber",
  "diagnosis",
  "notes",
  "handover",
  "location",
  "status",
  "rxStatus",
  "hasDrainage",
  "hasCV",
  "writtenDischarge",
  "diariaUpdated",
  "operationDate",
  "dischargeDate",
];
const rows = input.map((p) => {
  const data = Object.fromEntries(
    allowed.filter((k) => p[k] !== undefined).map((k) => [k, p[k]]),
  );
  const clean = validateMutation({ id: p.id, data }, "POST");
  if (p.diariaUpdatedAt && Number.isFinite(Date.parse(p.diariaUpdatedAt)))
    clean.data.diariaUpdatedAt = p.diariaUpdatedAt;
  else clean.data.diariaUpdatedAt = null;
  return clean;
});
if (new Set(rows.map((p) => p.id)).size !== rows.length)
  throw new Error(
    "Identificativi duplicati nel backup. Nessuna importazione eseguita.",
  );
const sql = neon(process.env.DATABASE_URL);
// Fail on a duplicate instead of overwriting a newer clinical record. Entire batch rolls back.
await sql.transaction(
  rows.map(
    (p) =>
      sql`WITH inserted AS (INSERT INTO app.patients(id,data) VALUES(${p.id},${JSON.stringify(p.data)}::jsonb) RETURNING id) INSERT INTO app.audit(patient_id,actor_id,actor_email,action) SELECT id,'migration','migration','import' FROM inserted`,
  ),
);
console.log(
  `Importate ${rows.length} cartelle. Nessuna cartella preesistente sovrascritta.`,
);
