/**
 * Centralised env access — fail loudly if required vars are missing.
 * Add new vars here so we never sprinkle `process.env.X!` across the codebase.
 */

function req(name: string): string {
  const v = process.env[name];
  if (!v || v.length === 0) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return v;
}

function opt(name: string, fallback = ""): string {
  return process.env[name] ?? fallback;
}

function int(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

export const env = {
  nodeEnv: opt("NODE_ENV", "development"),
  appName: opt("APP_NAME", "Next.js + Storage"),
  appUrl: opt("APP_URL", "http://localhost:3000"),

  auth: {
    secret: opt("AUTH_SECRET", "dev-secret-change-me-dev-secret-change-me"),
    cookieName: opt("SESSION_COOKIE_NAME", "app_session"),
    maxAgeSeconds: int("SESSION_MAX_AGE_SECONDS", 60 * 60 * 24 * 7),
  },

  storage: {
    driver: (opt("STORAGE_DRIVER", "local") as "local" | "s3"),
    maxFileMb: int("STORAGE_MAX_FILE_MB", 25),
    local: {
      path: opt("STORAGE_LOCAL_PATH", "./storage"),
      publicUrl: opt("STORAGE_LOCAL_PUBLIC_URL", "/files"),
    },
    s3: {
      bucket: opt("STORAGE_S3_BUCKET"),
      region: opt("STORAGE_S3_REGION"),
      accessKeyId: opt("STORAGE_S3_ACCESS_KEY_ID"),
      secretAccessKey: opt("STORAGE_S3_SECRET_ACCESS_KEY"),
      endpoint: opt("STORAGE_S3_ENDPOINT"),
      publicUrl: opt("STORAGE_S3_PUBLIC_URL"),
    },
  },

  admin: {
    email: opt("ADMIN_EMAIL", "admin@example.com"),
    password: opt("ADMIN_PASSWORD", "Admin@1234"),
    name: opt("ADMIN_NAME", "Site Administrator"),
  },
};

export const isProd = env.nodeEnv === "production";

// Surface only when used — avoids throwing on module load in serverless.
export function requireAuthSecret(): string {
  return req("AUTH_SECRET");
}
