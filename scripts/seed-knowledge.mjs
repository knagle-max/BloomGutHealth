import { readFileSync, existsSync } from "node:fs";
import { loadEnvFile } from "node:process";
import { Pool } from "pg";
for (const file of [".env.local", ".env"])
  if (existsSync(file)) loadEnvFile(file);
const connectionString =
  process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!connectionString)
  throw Error(
    "Inject a direct database URL before installing the public registry.",
  );
try {
  if (new URL(connectionString).hostname.includes("-pooler")) throw Error();
} catch {
  throw Error(
    "A valid direct, non-pooled database URL is required for registry installation.",
  );
}
const pool = new Pool({
  connectionString,
  max: 1,
});
try {
  await pool.query("BEGIN");
  await pool.query(
    readFileSync(
      new URL("../migrations/0005_biological_registry.sql", import.meta.url),
      "utf8",
    ),
  );
  await pool.query("COMMIT");
  console.log(
    "Public biological registry installed; personal records were not changed.",
  );
} catch (error) {
  await pool.query("ROLLBACK").catch(() => {});
  throw Error(
    "The public registry could not be installed. Check the direct connection, schema permissions and migration version.",
  );
} finally {
  await pool.end();
}
