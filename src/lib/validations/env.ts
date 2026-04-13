import { z } from "zod";

const optionalString = z.preprocess(
  (value) =>
    typeof value === "string" && value.trim().length === 0 ? undefined : value,
  z.string().min(1).optional(),
);

const envSchema = z.object({
  DATABASE_URL: z.string().startsWith("postgresql://"),
  NEXT_PUBLIC_APP_NAME: z.string().min(1).default("DataWise People Analytics"),
  BASIC_AUTH_USERNAME: optionalString,
  BASIC_AUTH_PASSWORD: optionalString,
  ENABLE_DEMO_MODE: z.enum(["true", "false"]).optional(),
  OPENAI_API_KEY: optionalString,
  OPENAI_MODEL: optionalString,
});

export function getEnvStatus() {
  return envSchema.safeParse({
    DATABASE_URL: process.env.DATABASE_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    BASIC_AUTH_USERNAME: process.env.BASIC_AUTH_USERNAME,
    BASIC_AUTH_PASSWORD: process.env.BASIC_AUTH_PASSWORD,
    ENABLE_DEMO_MODE: process.env.ENABLE_DEMO_MODE,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_MODEL: process.env.OPENAI_MODEL,
  });
}

export function getValidatedEnv() {
  return envSchema.parse({
    DATABASE_URL: process.env.DATABASE_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    BASIC_AUTH_USERNAME: process.env.BASIC_AUTH_USERNAME,
    BASIC_AUTH_PASSWORD: process.env.BASIC_AUTH_PASSWORD,
    ENABLE_DEMO_MODE: process.env.ENABLE_DEMO_MODE,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_MODEL: process.env.OPENAI_MODEL,
  });
}

export function isDemoModeEnabled() {
  return (
    process.env.ENABLE_DEMO_MODE === "true" &&
    process.env.NODE_ENV !== "production"
  );
}
