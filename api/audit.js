import {
  authorize,
  database,
  finishError,
  noCache,
} from "../server/backend.js";
import { HttpError, uuidPattern } from "../server/validation.js";
export default async function handler(req, res) {
  noCache(res);
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Metodo non consentito." });
  }
  try {
    await authorize(req);
    const id = req.query.id;
    if (!uuidPattern.test(id || ""))
      throw new HttpError(400, "Identificativo non valido.");
    const sql = database();
    const events =
      await sql`SELECT actor_email,action,fields,created_at FROM app.audit WHERE patient_id=${id} ORDER BY created_at DESC,id DESC LIMIT 20`;
    return res.status(200).json({ events });
  } catch (error) {
    return finishError(res, error);
  }
}
