import { neon } from "@neondatabase/serverless";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { HttpError } from "./validation.js";
let sqlClient;
let jwks;
export function database() {
  if (!process.env.DATABASE_URL)
    throw new HttpError(503, "Collegamento al database in preparazione.");
  sqlClient ||= neon(process.env.DATABASE_URL);
  return sqlClient;
}
export async function authorize(req) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer "))
    throw new HttpError(401, "Accedi per continuare.");
  if (!process.env.NEON_AUTH_BASE_URL || !process.env.NEON_AUTH_JWKS_URL)
    throw new HttpError(503, "Servizio di accesso in preparazione.");
  jwks ||= createRemoteJWKSet(new URL(process.env.NEON_AUTH_JWKS_URL));
  let payload;
  try {
    ({ payload } = await jwtVerify(header.slice(7), jwks, {
      issuer: new URL(process.env.NEON_AUTH_BASE_URL).origin,
      audience: new URL(process.env.NEON_AUTH_BASE_URL).origin,
      algorithms: ["EdDSA"],
    }));
  } catch {
    throw new HttpError(401, "Sessione scaduta o non valida. Accedi di nuovo.");
  }
  if (!payload.sub || !payload.exp)
    throw new HttpError(401, "Sessione non valida.");
  // Membership is checked against the verified identity in the database, never browser-provided email or metadata.
  const sql = database();
  const users =
    await sql`SELECT m.email, m.role FROM app.members m JOIN neon_auth."user" u ON lower(u.email)=m.email WHERE u.id=${payload.sub} AND u."emailVerified"=true AND m.enabled=true AND coalesce(u.banned,false)=false`;
  if (!users.length)
    throw new HttpError(
      403,
      "Accesso non ancora abilitato oppure email non verificata. Contatta l’amministratore del reparto.",
    );
  return { ...users[0], id: payload.sub };
}
export function finishError(res, error) {
  if (error.status)
    return res.status(error.status).json({ error: error.message });
  if (error.code === "23505")
    return res
      .status(409)
      .json({ error: "Questa cartella esiste già. Aggiorna l’elenco." });
  // Never log clinical data, bearer tokens or connection strings.
  console.error("Ward backend error", { code: error.code || "UNAVAILABLE" });
  return res
    .status(503)
    .json({
      error: "Salvataggio o lettura non riusciti. Riprova il collegamento.",
    });
}
export function noCache(res) {
  res.setHeader("Cache-Control", "private, no-store, max-age=0");
  res.setHeader("Vercel-CDN-Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
}
export const serializePatient = (row) => ({
  ...row.data,
  id: row.id,
  _version: row.version,
  _updatedAt: row.updated_at,
});
