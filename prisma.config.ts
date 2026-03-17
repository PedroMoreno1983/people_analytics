import { defineConfig } from "prisma/config";
import { config as loadEnv } from "dotenv";
import { existsSync } from "node:fs";
import path from "node:path";

const localEnvPath = path.resolve(process.cwd(), ".env.local");
const envPath = path.resolve(process.cwd(), ".env");

if (existsSync(localEnvPath)) {
  loadEnv({ path: localEnvPath });
}

if (existsSync(envPath)) {
  loadEnv({ path: envPath });
}

const runtimeDatabaseUrl =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/datawise_people_analytics?schema=public";

// Use a direct/session connection for Prisma CLI workflows when available.
const prismaCliDatabaseUrl = process.env.DIRECT_URL ?? runtimeDatabaseUrl;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
  engine: "classic",
  datasource: {
    url: prismaCliDatabaseUrl,
  },
});
