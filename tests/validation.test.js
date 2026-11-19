import test from "node:test";
import assert from "node:assert/strict";
import { validateMutation } from "../server/validation.js";
import { postOpDays, localDate } from "../src/lib/ward.js";
import patientsHandler from "../api/patients.js";
const id = "10000000-0000-4000-8000-000000000001";
const data = {
  firstName: "Elena",
  lastName: "Marini",
  diagnosis: "Test",
  operationDate: "2026-11-19",
  location: "Reparto",
};
test("Patient creation applies defaults and server-owned timestamps", () => {
  const result = validateMutation(
    {
      id,
      data: {
        ...data,
        diariaUpdated: true,
        diariaUpdatedAt: "2000-01-01T00:00:00Z",
      },
    },
    "POST",
  );
  assert.equal(result.data.status, "Active");
  assert.equal(result.data.hasCV, false);
  assert.ok(Date.parse(result.data.diariaUpdatedAt) > Date.now() - 5000);
});
test("Malformed dates, privilege fields and stale write versions are rejected", () => {
  for (const body of [
    { id, data: { ...data, operationDate: "2026-02-30" } },
    { id, data: { ...data, role: "admin" } },
    { id: "bad", data },
  ])
    assert.throws(() => validateMutation(body, "POST"), { status: 400 });
  assert.throws(
    () => validateMutation({ id, data: { notes: "changed" } }, "PATCH"),
    { status: 400 },
  );
  assert.equal(
    validateMutation({ id, version: 2, data: { hasCV: false } }, "PATCH")
      .version,
    2,
  );
});
test("Clearing diary clears its timestamp and empty patches cannot bypass validation", () => {
  assert.equal(
    validateMutation(
      { id, version: 2, data: { diariaUpdated: false } },
      "PATCH",
    ).data.diariaUpdatedAt,
    null,
  );
  assert.throws(
    () =>
      validateMutation(
        { id, version: 2, data: { diariaUpdatedAt: null } },
        "PATCH",
      ),
    { status: 400 },
  );
});
test("Calendar-day count never labels a future operation as elapsed", () => {
  assert.equal(postOpDays("2099-01-01"), 0);
  assert.equal(postOpDays(localDate()), 0);
});
test("Direct unauthenticated API requests fail before accessing the database", async () => {
  const response = {
    statusCode: 0,
    headers: {},
    setHeader(k, v) {
      this.headers[k] = v;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
    },
  };
  await patientsHandler({ method: "GET", headers: {} }, response);
  assert.equal(response.statusCode, 401);
  assert.match(response.headers["Cache-Control"], /no-store/);
  await patientsHandler({ method: "PUT", headers: {} }, response);
  assert.equal(response.statusCode, 405);
});
