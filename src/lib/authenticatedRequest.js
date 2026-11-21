const sessionExpired = () =>
  Object.assign(new Error("Sessione scaduta. Accedi di nuovo."), {
    status: 401,
  });
const authUnavailable = () =>
  Object.assign(
    new Error("Il servizio di accesso non risponde. Riprova tra poco."),
    { status: 503 },
  );

export function createAuthenticatedRequest(
  client,
  { fetcher = (...args) => fetch(...args), onSessionExpired = () => {} } = {},
) {
  async function sessionToken(force = false) {
    let result;
    try {
      result = await client.getSession(
        force
          ? { fetchOptions: { headers: { "X-Force-Fetch": "true" } } }
          : undefined,
      );
    } catch {
      throw authUnavailable();
    }
    if (result.error) {
      if ([401, 403].includes(result.error.status)) throw sessionExpired();
      throw authUnavailable();
    }
    // Neon injects the signed JWT into the session, including cached responses.
    // .token() in SDK 0.8.2 can return that cached session rather than { token }.
    const token = result.data?.session?.token;
    if (
      result.data?.user?.id &&
      typeof token === "string" &&
      token.split(".").length === 3
    )
      return token;
    if (!force) return sessionToken(true);
    throw sessionExpired();
  }
  return async function authenticatedRequest(path, options = {}) {
    if (!client)
      throw new Error("Collegamento al servizio di accesso non configurato.");
    try {
      for (let attempt = 0; attempt < 2; attempt += 1) {
        const token = await sessionToken(attempt > 0);
        const response = await fetcher(path, {
          ...options,
          headers: {
            ...options.headers,
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          signal: options.signal || AbortSignal.timeout(20000),
          cache: "no-store",
        });
        // A 401 is returned before a protected handler reads or changes records.
        // Refresh once, without treating network/server failures as an expired login.
        if (response.status === 401) {
          if (!attempt) continue;
          throw sessionExpired();
        }
        const body = await response.json().catch(() => ({}));
        if (!response.ok)
          throw Object.assign(
            new Error(
              body.error || "Il server non risponde. Riprova tra poco.",
            ),
            { status: response.status },
          );
        return body;
      }
    } catch (error) {
      if (error.status === 401) onSessionExpired();
      throw error;
    }
  };
}
