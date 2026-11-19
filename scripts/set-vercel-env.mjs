import { spawn } from "node:child_process";
const target = process.argv[2];
if (!["production", "preview"].includes(target))
  throw new Error("Specify production or preview");
const keys = [
  "VITE_NEON_AUTH_URL",
  "NEON_AUTH_BASE_URL",
  "NEON_AUTH_JWKS_URL",
  "DATABASE_URL",
];
for (const key of keys) {
  const value = process.env[key];
  if (!value) throw new Error(`${key} missing`);
  const args = [
    "--yes",
    "vercel@66.2.0",
    "--scope",
    "team_dpC6AVsCBsZuoZqHJEkq4Z5t",
    "env",
    "add",
    key,
    "--environment",
    target,
    "--project",
    "prj_21S7DGjyviluFds9v5PCmA2Nn18M",
    "--type",
    key === "DATABASE_URL" ? "secret" : "config",
    "--force",
    "--yes",
  ];
  const child = spawn("npx", args, { stdio: ["pipe", "pipe", "pipe"] });
  let output = "";
  child.stdout.on("data", (d) => (output += d));
  child.stderr.on("data", (d) => (output += d));
  child.stdin.end(value);
  const code = await new Promise((resolve, reject) => {
    child.on("error", reject);
    child.on("close", resolve);
  });
  if (code) {
    for (const k of keys)
      if (process.env[k])
        output = output.split(process.env[k]).join("[redacted]");
    console.error(output);
    process.exit(code);
  }
  console.log(`${target}: ${key} configured`);
}
