import test from "node:test";
import assert from "node:assert/strict";
import { createUsersHandler } from "../api/users.js";

function response() {
  return {
    headers: {},
    statusCode: 0,
    setHeader(key, value) {
      this.headers[key] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
    },
  };
}

test("The user directory rejects unauthenticated requests before reading users", async () => {
  const res = response();
  await createUsersHandler({
    getDatabase: () => {
      throw new Error("Must not query");
    },
  })({ method: "GET", headers: {} }, res);
  assert.equal(res.statusCode, 401);
  assert.match(res.headers["Cache-Control"], /no-store/);
});

test("A collaborator cannot list accounts or claim admin using request data", async () => {
  const res = response();
  const handler = createUsersHandler({
    authenticate: async () => ({ role: "staff" }),
    getDatabase: () => {
      throw new Error("Must not query");
    },
  });
  await handler(
    { method: "GET", headers: { role: "admin" }, body: { role: "admin" } },
    res,
  );
  assert.equal(res.statusCode, 403);
});

test("The directory is read-only, even for administrators", async () => {
  for (const method of ["POST", "PATCH", "DELETE"]) {
    const res = response();
    await createUsersHandler({
      authenticate: async () => {
        throw new Error("Must not authenticate");
      },
    })({ method, headers: {} }, res);
    assert.equal(res.statusCode, 405);
    assert.equal(res.headers.Allow, "GET");
  }
});

test("An authenticated administrator receives the user directory without caching", async () => {
  const users = [
    {
      id: "registered-user",
      email: "colleague@example.test",
      role: "staff",
      enabled: true,
    },
  ];
  const res = response();
  await createUsersHandler({
    authenticate: async () => ({ role: "admin" }),
    getDatabase: () => async () => users,
  })({ method: "GET", headers: {} }, res);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { users });
  assert.equal(res.headers["Vercel-CDN-Cache-Control"], "no-store");
});
