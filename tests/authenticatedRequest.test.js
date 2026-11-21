import test from "node:test";
import assert from "node:assert/strict";
import { createAuthClient } from "@neon/auth";
import { BetterAuthVanillaAdapter } from "@neon/auth/vanilla/adapters";
import { createAuthenticatedRequest } from "../src/lib/authenticatedRequest.js";
const jwt = `eyJhbGciOiJFZERTQSJ9.${Buffer.from(JSON.stringify({ sub: "test-user", exp: Math.floor(Date.now() / 1000) + 900 })).toString("base64url")}.test-signature`;
const session = (token = jwt) => ({
  data: { session: { token }, user: { id: "test-user" } },
  error: null,
});

test("Installed Neon SDK cached session supplies the JWT used by protected requests", async () => {
  const original = globalThis.fetch;
  let authCalls = 0;
  globalThis.fetch = async (_url, options) => {
    authCalls++;
    assert.equal(options.credentials, "include");
    return Response.json(
      {
        session: { id: "test-session", token: "opaque-cookie-token" },
        user: { id: "test-user" },
      },
      { headers: { "set-auth-jwt": jwt } },
    );
  };
  try {
    const client = createAuthClient("https://auth.example.test/auth", {
      adapter: BetterAuthVanillaAdapter({
        fetchOptions: { credentials: "include" },
      }),
    });
    assert.equal((await client.getSession()).data.session.token, jwt);
    // Reproduces the previous failure with the exact installed SDK, without credentials.
    assert.equal((await client.token()).data.token, undefined);
    const request = createAuthenticatedRequest(client, {
      fetcher: async (path, options) => {
        assert.equal(path, "/api/patients");
        assert.equal(options.headers.Authorization, `Bearer ${jwt}`);
        return Response.json({ patients: [], role: "staff" });
      },
    });
    assert.deepEqual(await request("/api/patients"), {
      patients: [],
      role: "staff",
    });
    assert.equal(
      authCalls,
      1,
      "API uses the valid cached session without another auth request",
    );
  } finally {
    globalThis.fetch = original;
  }
});

test("A rejected API token forces one session refresh and retries with the fresh JWT", async () => {
  let sessions = 0,
    requests = 0,
    expired = 0;
  const fresh = jwt + "fresh";
  const request = createAuthenticatedRequest(
    {
      getSession: async (options) => {
        sessions++;
        if (sessions === 2)
          assert.equal(options.fetchOptions.headers["X-Force-Fetch"], "true");
        return session(sessions === 1 ? jwt : fresh);
      },
    },
    {
      fetcher: async (_path, options) => {
        requests++;
        assert.equal(
          options.headers.Authorization,
          `Bearer ${requests === 1 ? jwt : fresh}`,
        );
        return requests === 1
          ? Response.json({ error: "expired" }, { status: 401 })
          : Response.json({ patients: [] });
      },
      onSessionExpired: () => expired++,
    },
  );
  assert.deepEqual(await request("/api/patients"), { patients: [] });
  assert.equal(requests, 2);
  assert.equal(expired, 0);
});

test("A missing session returns to login without requesting patient records", async () => {
  let expired = 0,
    requests = 0,
    sessions = 0;
  const request = createAuthenticatedRequest(
    {
      getSession: async () => {
        sessions++;
        return { data: null, error: null };
      },
    },
    {
      fetcher: async () => {
        requests++;
      },
      onSessionExpired: () => expired++,
    },
  );
  await assert.rejects(request("/api/patients"), { status: 401 });
  assert.equal(sessions, 2);
  assert.equal(requests, 0);
  assert.equal(expired, 1);
});

test("Repeated API rejection stops after one retry and returns to login", async () => {
  let requests = 0,
    expired = 0;
  const request = createAuthenticatedRequest(
    { getSession: async () => session() },
    {
      fetcher: async () => {
        requests++;
        return Response.json({ error: "expired" }, { status: 401 });
      },
      onSessionExpired: () => expired++,
    },
  );
  await assert.rejects(request("/api/patients"), { status: 401 });
  assert.equal(requests, 2);
  assert.equal(expired, 1);
});

test("Auth outages and membership denials do not become expired-session errors", async () => {
  let expired = 0;
  const offline = createAuthenticatedRequest(
    {
      getSession: async () => {
        throw new TypeError("Network unavailable");
      },
    },
    { onSessionExpired: () => expired++ },
  );
  await assert.rejects(offline("/api/patients"), { status: 503 });
  const forbidden = createAuthenticatedRequest(
    { getSession: async () => session() },
    {
      fetcher: async () =>
        Response.json({ error: "Accesso non abilitato" }, { status: 403 }),
      onSessionExpired: () => expired++,
    },
  );
  await assert.rejects(forbidden("/api/patients"), {
    status: 403,
    message: "Accesso non abilitato",
  });
  assert.equal(expired, 0);
});
