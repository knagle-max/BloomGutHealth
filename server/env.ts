import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { loadEnvFile } from "node:process";

// Neon writes .env.local unless .env already exists. Host-injected values win;
// the local override file is loaded before the fallback file. Never print values.
export function loadLocalEnv(directory = process.cwd()) {
  for (const name of [".env.local", ".env"]) {
    const path = resolve(directory, name);
    if (existsSync(path)) loadEnvFile(path);
  }
}
loadLocalEnv();
