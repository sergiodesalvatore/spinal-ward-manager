import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

function localApi() {
  return {
    name: "scolioward-local-api",
    configureServer(server) {
      server.middlewares.use("/api", async (req, res, next) => {
        const path = new URL(req.url, "http://localhost");
        if (!["/patients", "/audit"].includes(path.pathname)) return next();
        try {
          const chunks = [];
          let size = 0;
          for await (const chunk of req) {
            size += chunk.length;
            if (size > 40000) {
              res.statusCode = 413;
              res.end('{"error":"Richiesta troppo grande."}');
              return;
            }
            chunks.push(chunk);
          }
          req.body = chunks.length
            ? JSON.parse(Buffer.concat(chunks).toString())
            : {};
          req.query = Object.fromEntries(path.searchParams);
          res.status = (code) => {
            res.statusCode = code;
            return res;
          };
          res.json = (data) => {
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(data));
          };
          const { default: handler } = await import(
            path.pathname === "/patients"
              ? "./api/patients.js"
              : "./api/audit.js"
          );
          await handler(req, res);
        } catch {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end('{"error":"Richiesta non valida."}');
        }
      });
    },
  };
}
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  for (const key of [
    "DATABASE_URL",
    "NEON_AUTH_BASE_URL",
    "NEON_AUTH_JWKS_URL",
  ])
    if (env[key]) process.env[key] = env[key];
  return { plugins: [react(), tailwindcss(), localApi()] };
});
