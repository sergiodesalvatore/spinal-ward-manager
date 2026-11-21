import {
  authorize,
  database,
  finishError,
  noCache,
} from "../server/backend.js";
import { requireAdmin } from "../server/membership.js";

export function createUsersHandler({
  authenticate = authorize,
  getDatabase = database,
} = {}) {
  return async function handler(req, res) {
    noCache(res);
    if (req.method !== "GET") {
      res.setHeader("Allow", "GET");
      return res.status(405).json({ error: "Metodo non consentito." });
    }
    try {
      const actor = await authenticate(req);
      requireAdmin(actor);
      const sql = getDatabase();
      const users =
        await sql`SELECT u.id,u.name,u.email,u."emailVerified" AS email_verified,
        u."createdAt" AS registered_at,coalesce(m.role,'staff') AS role,
        (u."emailVerified"=true AND coalesce(m.enabled,true) AND NOT coalesce(u.banned,false)) AS enabled
        FROM neon_auth."user" u LEFT JOIN app.members m ON m.email=lower(u.email)
        ORDER BY u."createdAt" DESC,u.id`;
      return res.status(200).json({ users });
    } catch (error) {
      return finishError(res, error);
    }
  };
}
export default createUsersHandler();
