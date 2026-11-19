import {
  authorize,
  database,
  finishError,
  noCache,
  serializePatient,
} from "../server/backend.js";
import { HttpError, validateMutation } from "../server/validation.js";
export default async function handler(req, res) {
  noCache(res);
  if (!["GET", "POST", "PATCH", "DELETE"].includes(req.method)) {
    res.setHeader("Allow", "GET, POST, PATCH, DELETE");
    return res.status(405).json({ error: "Metodo non consentito." });
  }
  try {
    const actor = await authorize(req);
    const sql = database();
    if (req.method === "GET") {
      const rows =
        await sql`SELECT id,data,version,updated_at FROM app.patients ORDER BY data->>'operationDate' DESC,id`;
      return res
        .status(200)
        .json({ patients: rows.map(serializePatient), role: actor.role });
    }
    if (Number(req.headers["content-length"] || 0) > 40000)
      throw new HttpError(413, "La cartella supera la dimensione consentita.");
    let body = req.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch {
        throw new HttpError(400, "Richiesta non valida.");
      }
    }
    const { id, version, data } = validateMutation(body, req.method);
    let rows;
    const fields = JSON.stringify(Object.keys(data || {}));
    if (req.method === "POST")
      rows = await sql`
      WITH changed AS (INSERT INTO app.patients(id,data) VALUES(${id},${JSON.stringify(data)}::jsonb) RETURNING *),
      logged AS (INSERT INTO app.audit(patient_id,actor_id,actor_email,action,fields) SELECT id,${actor.id},${actor.email},'create',${fields}::jsonb FROM changed)
      SELECT * FROM changed`;
    else if (req.method === "PATCH")
      rows = await sql`
      WITH changed AS (UPDATE app.patients SET data=data||${JSON.stringify(data)}::jsonb,version=version+1,updated_at=now() WHERE id=${id} AND version=${version} RETURNING *),
      logged AS (INSERT INTO app.audit(patient_id,actor_id,actor_email,action,fields) SELECT id,${actor.id},${actor.email},'update',${fields}::jsonb FROM changed)
      SELECT * FROM changed`;
    else {
      if (actor.role !== "admin")
        throw new HttpError(
          403,
          "Solo un amministratore può eliminare definitivamente una cartella.",
        );
      rows = await sql`
        WITH changed AS (DELETE FROM app.patients WHERE id=${id} AND version=${version} RETURNING *),
        logged AS (INSERT INTO app.audit(patient_id,actor_id,actor_email,action,fields) SELECT id,${actor.id},${actor.email},'delete','[]'::jsonb FROM changed)
        SELECT * FROM changed`;
    }
    if (!rows.length)
      throw new HttpError(
        409,
        "La cartella è stata modificata su un altro dispositivo. Aggiorna i dati prima di salvare.",
      );
    return res
      .status(req.method === "POST" ? 201 : 200)
      .json({
        patient: req.method === "DELETE" ? null : serializePatient(rows[0]),
      });
  } catch (error) {
    return finishError(res, error);
  }
}
