/**
 * Run `prisma migrate deploy` against an arbitrary tenant database URL by
 * spawning a child process with overridden DATABASE_URL / DIRECT_URL env
 * vars. Used by /super-admin to bootstrap the schema on a freshly
 * provisioned Neon / Supabase database without leaving the browser.
 *
 * Requires the `prisma` CLI to be available in the runtime — true in dev
 * and on a self-hosted server. On read-only serverless runtimes (Vercel
 * production functions) the spawn will fail with ENOENT and the caller
 * should fall back to manual `prisma migrate deploy` from the operator's
 * laptop.
 */
import { spawn } from "node:child_process";
import path from "node:path";
import { stripPoolerFromUrl } from "./tenant-db";

export interface MigrateResult {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number;
  durationMs: number;
  /** Friendly message — set when spawn itself failed (e.g. CLI not found). */
  fatal?: string;
}

export interface MigrateOptions {
  databaseUrl: string;
  /** Direct (non-pooled) URL used for migrations. Falls back to databaseUrl. */
  directDbUrl?: string;
  /** Path to the prisma schema. Defaults to <cwd>/prisma/schema.prisma. */
  schemaPath?: string;
  /** Timeout for the whole migration run. Defaults to 90 s. */
  timeoutMs?: number;
}

/**
 * Run `prisma migrate deploy` against the supplied database URL.
 *
 * Returns a structured result instead of throwing — the caller (an API
 * route handler) is expected to surface stdout/stderr to the operator.
 */
export async function migrateTenantDb(
  opts: MigrateOptions,
): Promise<MigrateResult> {
  const start = Date.now();
  const cwd = process.cwd();
  const schemaPath =
    opts.schemaPath ?? path.join(cwd, "prisma", "schema.prisma");
  // Final-line-of-defence: strip -pooler from the direct URL so advisory
  // locks (required by `prisma migrate`) work. Pooler-mode breaks them.
  const directUrl = stripPoolerFromUrl(
    opts.directDbUrl?.trim() || opts.databaseUrl,
  );

  return new Promise<MigrateResult>((resolve) => {
    let child;
    try {
      child = spawn(
        "npx",
        ["--no-install", "prisma", "migrate", "deploy", `--schema=${schemaPath}`],
        {
          env: {
            ...process.env,
            DATABASE_URL: opts.databaseUrl,
            DIRECT_URL: directUrl,
            // Disable any analytics that could slow the spawn.
            CHECKPOINT_DISABLE: "1",
            // Skip the advisory lock — Prisma uses pg_advisory_lock() to
            // prevent concurrent migrations, but it can stall for 10 s on
            // a cold Neon compute or a held lock from a previous crash.
            // The super-admin portal serialises migrations per site already,
            // so the lock isn't needed for our workflow.
            PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK: "1",
          },
          cwd,
        },
      );
    } catch (e) {
      resolve({
        success: false,
        stdout: "",
        stderr: e instanceof Error ? e.message : String(e),
        exitCode: -1,
        durationMs: Date.now() - start,
        fatal:
          "Could not spawn the prisma CLI. Run migrations manually from your local machine: " +
          `\`DATABASE_URL=\"<url>\" DIRECT_URL=\"<direct>\" npx prisma migrate deploy\``,
      });
      return;
    }

    let stdout = "";
    let stderr = "";
    child.stdout?.on("data", (d) => (stdout += d.toString()));
    child.stderr?.on("data", (d) => (stderr += d.toString()));

    // Neon free-tier compute can take 15-25 s to wake from cold start.
    // Default timeout is 90 s — give 120 s of headroom if not overridden.
    const timeoutMs = opts.timeoutMs ?? 120_000;
    const timer = setTimeout(() => {
      child.kill("SIGTERM");
      resolve({
        success: false,
        stdout,
        stderr: stderr + "\n[timeout reached]",
        exitCode: -1,
        durationMs: Date.now() - start,
        fatal: `Migration timed out after ${timeoutMs / 1000}s — the database may be slow or unreachable.`,
      });
    }, timeoutMs);

    child.on("error", (err) => {
      clearTimeout(timer);
      resolve({
        success: false,
        stdout,
        stderr: stderr + "\n" + err.message,
        exitCode: -1,
        durationMs: Date.now() - start,
        fatal:
          err.message.includes("ENOENT")
            ? "The `prisma` CLI isn't available in this runtime. Run migrations from your laptop instead."
            : err.message,
      });
    });

    child.on("exit", (code) => {
      clearTimeout(timer);
      resolve({
        success: code === 0,
        stdout,
        stderr,
        exitCode: code ?? -1,
        durationMs: Date.now() - start,
      });
    });
  });
}
