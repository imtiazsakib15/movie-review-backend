import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z.coerce.number().int().positive().default(5000),

  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  SALT_ROUNDS: z.coerce
    .number()
    .int()
    .min(4)
    .max(15)
    .default(10),

  ACCESS_TOKEN_SECRET: z
    .string()
    .min(16, "ACCESS_TOKEN_SECRET must be at least 16 characters"),

  REFRESH_TOKEN_SECRET: z
    .string()
    .min(16, "REFRESH_TOKEN_SECRET must be at least 16 characters"),

  ACCESS_TOKEN_EXPIRY: z.string().default("15m"),

  REFRESH_TOKEN_EXPIRY: z.string().default("7d"),

  CLOUDINARY_CLOUD_NAME: z.string().min(1, "CLOUDINARY_CLOUD_NAME is required"),

  CLOUDINARY_API_KEY: z.string().min(1, "CLOUDINARY_API_KEY is required"),

  CLOUDINARY_API_SECRET: z
    .string()
    .min(1, "CLOUDINARY_API_SECRET is required"),

  EMAIL_HOST: z.string().min(1, "EMAIL_HOST is required"),

  EMAIL_PORT: z.coerce.number().int().positive(),

  EMAIL_USER: z.string().email("EMAIL_USER must be a valid email"),

  EMAIL_PASS: z.string().min(1, "EMAIL_PASS is required"),

  CLIENT_URL: z
    .string()
    .url()
    .default("http://localhost:3000"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

export const isDevelopment = env.NODE_ENV === "development";
export const isTest = env.NODE_ENV === "test";
export const isProduction = env.NODE_ENV === "production";