import "./server/env";
import { APPLICATION_TABLE_FILTER } from "./shared/schema-management";
import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/application-schema.ts",
  tablesFilter: APPLICATION_TABLE_FILTER,
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL,
  },
});
