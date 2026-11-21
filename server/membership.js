import { HttpError } from "./validation.js";

export async function verifiedMember(sql, userId) {
  // Only a verified identity can join. Existing roles and disabled accounts stay unchanged.
  await sql`INSERT INTO app.members(email,role,enabled)
    SELECT lower(email),'staff',true FROM neon_auth."user"
    WHERE id=${userId} AND "emailVerified"=true AND coalesce(banned,false)=false
    ON CONFLICT(email) DO NOTHING`;
  const members = await sql`SELECT m.email,m.role FROM app.members m
    JOIN neon_auth."user" u ON lower(u.email)=m.email
    WHERE u.id=${userId} AND u."emailVerified"=true AND m.enabled=true AND coalesce(u.banned,false)=false`;
  if (!members.length)
    throw new HttpError(
      403,
      "Verifica la tua email per accedere. Se l’accesso è stato sospeso, contatta l’amministratore del reparto.",
    );
  return members[0];
}

export function requireAdmin(actor) {
  if (actor.role !== "admin")
    throw new HttpError(
      403,
      "Solo l’amministratore può visualizzare gli utenti registrati.",
    );
}
