import { readFile } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";
if (!process.env.DATABASE_URL)
  throw new Error(
    "DATABASE_URL mancante. Usa node --env-file=.env.local scripts/migrate.mjs",
  );
const direct = new URL(
  process.env.DATABASE_DIRECT_URL || process.env.DATABASE_URL,
);
direct.hostname = direct.hostname.replace("-pooler.", ".");
const sql = neon(direct.toString());
const source = await readFile(
  new URL("../db/001_initial.sql", import.meta.url),
  "utf8",
);
// One HTTP transaction: omit explicit BEGIN/COMMIT because the driver owns the transaction.
const statements = source
  .replace(/^--.*$/gm, "")
  .split(";")
  .map((s) => s.trim())
  .filter((s) => s && !["BEGIN", "COMMIT"].includes(s));
await sql.transaction(statements.map((statement) => sql.query(statement)));
console.log("Schema applicato.");
