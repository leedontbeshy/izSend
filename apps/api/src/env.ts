import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load repo root .env (apps/api/src -> repo root is 3 levels up)
const repoRoot = path.resolve(__dirname, "..", "..", "..");
dotenv.config({ path: path.join(repoRoot, ".env") });

type Env = {
  apiPort: number;
  webOrigin: string;
  presignTtlSeconds: number;
  fileTtlDays: number;
  maxFileBytes: number;
  cleanupIntervalMinutes: number;
  s3Bucket: string;
  awsRegion: string;
  s3Endpoint?: string;
  s3ForcePathStyle: boolean;
  neonConnectionString: string;
  dbPoolMax: number;
};

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
}

function numberWithDefault(name: string, fallback: number): number {
  const value = process.env[name];
  if (!value) return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) throw new Error(`Invalid number env var: ${name}`);
  return parsed;
}

function booleanWithDefault(name: string, fallback: boolean): boolean {
  const value = process.env[name];
  if (!value) return fallback;
  return value.toLowerCase() === "true";
}

export const env: Env = {
  apiPort: numberWithDefault("API_PORT", 3000),
  webOrigin: process.env.WEB_ORIGIN ?? "http://localhost:5173",
  presignTtlSeconds: numberWithDefault("PRESIGN_TTL_SECONDS", 300),
  fileTtlDays: numberWithDefault("FILE_TTL_DAYS", 7),
  maxFileBytes: numberWithDefault("MAX_FILE_BYTES", 50 * 1024 * 1024),
  cleanupIntervalMinutes: numberWithDefault("CLEANUP_INTERVAL_MINUTES", 60),
  s3Bucket: required("S3_BUCKET"),
  awsRegion: required("AWS_REGION"),
  s3Endpoint: process.env.S3_ENDPOINT || undefined,
  s3ForcePathStyle: booleanWithDefault("S3_FORCE_PATH_STYLE", false),
  neonConnectionString: required("NEON_CONNECTION_STRING"),
  dbPoolMax: numberWithDefault("DB_POOL_MAX", 10)
};

/** @deprecated Import env.maxFileBytes instead */
export const MAX_FILE_BYTES = env.maxFileBytes;
