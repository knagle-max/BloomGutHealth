import "./env";
import config from "../neon";
import { parseEnv } from "@neon/env";
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Preserve the established WebSocket driver: Drizzle transactions are required.
// Credentials come from Neon env pull or the hosting environment, never the client.
const { postgres } = parseEnv(config, ["DATABASE_URL"]);
export const pool = new Pool({ connectionString: postgres.databaseUrl });
export const db = drizzle({ client: pool, schema });
