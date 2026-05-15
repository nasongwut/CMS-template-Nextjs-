/**
 * Tenant database URL resolution.
 *
 * Sites can use one of two isolation modes:
 *
 *   A) DEDICATED DATABASE — `site.databaseUrl` is set to a full Postgres URL.
 *      Each tenant has its own database (potentially on its own cluster).
 *
 *   B) SHARED DATABASE, SEPARATE SCHEMA — `site.databaseUrl` is empty.
 *      We use the platform's main DATABASE_URL but append `?schema=site_<slug>`
 *      so all of this tenant's tables live in their own Postgres schema,
 *      isolated from every other tenant in the same database.
 *
 * `resolveTenantUrls()` is the single source of truth for picking which
 * URLs to use, and `ensureSchemaExists()` makes sure the target schema is
 * available before migrations run.
 */
import { PrismaClient } from "@prisma/client";

export interface SiteUrlInputs {
  databaseUrl: string;
  directDbUrl: string;
  /** Used to derive an auto schema name when running in shared mode. */
  slug: string;
}

export interface ResolvedTenantUrls {
  /** Pooled URL used at runtime. */
  databaseUrl: string;
  /** Direct (non-pooled) URL used by migrations. */
  directDbUrl: string;
  /** Either `"dedicated"` (own DB) or `"shared"` (env DB + schema). */
  mode: "dedicated" | "shared";
  /** Postgres schema name when in shared mode, else "public". */
  schema: string;
}

/**
 * Build the connection URLs this site should use, honouring shared vs
 * dedicated mode. Returns null when there's no usable configuration.
 */
export function resolveTenantUrls(
  site: SiteUrlInputs,
): ResolvedTenantUrls | null {
  // Mode A — dedicated tenant DB
  if (site.databaseUrl) {
    let schema = "public";
    try {
      schema =
        new URL(site.databaseUrl).searchParams.get("schema") ?? "public";
    } catch {
      /* fall through */
    }
    // Even in dedicated mode, the DIRECT URL should never contain -pooler
    // (advisory locks don't work through poolers). Strip silently.
    const directRaw = site.directDbUrl || site.databaseUrl;
    return {
      databaseUrl: site.databaseUrl,
      directDbUrl: stripPoolerFromUrl(directRaw),
      mode: "dedicated",
      schema,
    };
  }
  // Mode B — shared DB + per-site schema
  const env = process.env.DATABASE_URL;
  const envDirect = process.env.DIRECT_URL || env;
  if (!env || !envDirect) return null;

  const schemaName = sharedSchemaForSlug(site.slug);
  return {
    databaseUrl: setSchemaInUrl(env, schemaName),
    // Always strip -pooler from the direct URL — operators frequently
    // mirror DATABASE_URL into DIRECT_URL without removing the suffix.
    directDbUrl: setSchemaInUrl(stripPoolerFromUrl(envDirect), schemaName),
    mode: "shared",
    schema: schemaName,
  };
}

/** Conservative slug → schema name: `site_<slug>` (a-z0-9_). */
export function sharedSchemaForSlug(slug: string): string {
  const safe = (slug || "default")
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 50);
  return `site_${safe || "default"}`;
}

function setSchemaInUrl(rawUrl: string, schema: string): string {
  try {
    const u = new URL(rawUrl);
    u.searchParams.set("schema", schema);
    return u.toString();
  } catch {
    // URL didn't parse — fall back to naive append.
    const sep = rawUrl.includes("?") ? "&" : "?";
    return `${rawUrl}${sep}schema=${encodeURIComponent(schema)}`;
  }
}

/** Strip `?schema=` from a URL — used to issue control commands at the cluster level. */
function urlWithoutSchema(rawUrl: string): string {
  try {
    const u = new URL(rawUrl);
    u.searchParams.delete("schema");
    return u.toString();
  } catch {
    return rawUrl.replace(/[?&]schema=[^&]*/i, "");
  }
}

/**
 * Remove `-pooler` from the hostname.
 *
 * Used when building the DIRECT URL — advisory locks (`pg_advisory_lock`)
 * required by `prisma migrate` don't work through PgBouncer-style poolers,
 * so even if the operator left `-pooler` in their env's DIRECT_URL by
 * accident, we silently fix it here.
 */
export function stripPoolerFromUrl(rawUrl: string): string {
  if (!rawUrl) return rawUrl;
  try {
    const u = new URL(rawUrl);
    if (u.hostname.includes("-pooler")) {
      u.hostname = u.hostname.replace(/-pooler/g, "");
    }
    return u.toString();
  } catch {
    return rawUrl.replace(/-pooler/g, "");
  }
}

/**
 * Make sure the target Postgres schema exists before we run migrations
 * into it. Connects to the cluster (no schema set) and issues
 * `CREATE SCHEMA IF NOT EXISTS`.
 *
 * Safe to call on every migrate — no-op when the schema already exists.
 */
export async function ensureSchemaExists(
  databaseUrl: string,
  schema: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!schema || schema === "public") return { ok: true };
  const cleanUrl = urlWithoutSchema(databaseUrl);
  const client = new PrismaClient({
    datasources: { db: { url: cleanUrl } },
    log: ["error"],
  });
  try {
    // Schema names must be a-z0-9_ — validate to keep raw SQL safe.
    if (!/^[a-z0-9_]+$/i.test(schema)) {
      return { ok: false, error: `Invalid schema name: ${schema}` };
    }
    await client.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  } finally {
    await client.$disconnect().catch(() => undefined);
  }
}
