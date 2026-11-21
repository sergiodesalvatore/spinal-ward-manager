import { createAuthClient } from "@neon/auth";
import { BetterAuthVanillaAdapter } from "@neon/auth/vanilla/adapters";
import { createAuthenticatedRequest } from "./authenticatedRequest";
export const authClient = import.meta.env.VITE_NEON_AUTH_URL
  ? createAuthClient(import.meta.env.VITE_NEON_AUTH_URL, {
      adapter: BetterAuthVanillaAdapter({
        fetchOptions: { credentials: "include" },
      }),
    })
  : null;
export const apiRequest = createAuthenticatedRequest(authClient, {
  onSessionExpired: () =>
    window.dispatchEvent(new Event("scolioward:session-expired")),
});
