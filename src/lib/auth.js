import { createAuthClient } from "@neon/auth";
export const authClient = import.meta.env.VITE_NEON_AUTH_URL
  ? createAuthClient(import.meta.env.VITE_NEON_AUTH_URL)
  : null;
export async function apiRequest(path, options = {}) {
  if (!authClient)
    throw new Error("Collegamento al servizio di accesso non configurato.");
  const { data, error } = await authClient.token();
  if (error || !data?.token)
    throw new Error("Sessione scaduta. Accedi di nuovo.");
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${data.token}`,
      ...options.headers,
    },
    signal: options.signal || AbortSignal.timeout(20000),
    cache: "no-store",
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok)
    throw Object.assign(
      new Error(body.error || "Il server non risponde. Riprova tra poco."),
      { status: response.status },
    );
  return body;
}
