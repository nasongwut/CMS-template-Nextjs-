/**
 * Multi-tenant Prisma router.
 *
 * `prisma` is a *Proxy* that resolves to the correct PrismaClient for the
 * current request based on the incoming hostname:
 *
 *   1. Read the request hostname (via `next/headers`)
 *   2. Look it up in the control-plane `SiteDomain` table
 *   3. If found → return the cached PrismaClient pointing at that
 *      tenant's `databaseUrl`
 *   4. If not found → fall back to the platform client (main DATABASE_URL)
 *
 * Existing app code (`import { prisma } from "@/lib/prisma"`) keeps
 * working unchanged — the Proxy forwards every model / `$method` call to
 * the resolved client.
 *
 * Super-admin code that ALWAYS needs the control-plane client should
 * import `platformPrisma` from `./prisma-platform` instead.
 */
import { headers } from "next/headers";
import { PrismaClient } from "@prisma/client";
import { cache } from "react";
import { platformPrisma } from "./prisma-platform";

declare global {
  // eslint-disable-next-line no-var
  var __tenantClients: Map<string, PrismaClient> | undefined;
}

/** Cached tenant clients keyed by siteId. Survives HMR in dev. */
const tenantClients =
  global.__tenantClients ?? new Map<string, PrismaClient>();
if (process.env.NODE_ENV !== "production") {
  global.__tenantClients = tenantClients;
}

/** Hostnames that always use the control-plane DB (super-admin, main site). */
function isPlatformHostname(hostname: string): boolean {
  const platform = (process.env.PLATFORM_HOSTNAME || "").toLowerCase();
  if (platform && hostname === platform) return true;
  // Common local hostnames — these belong to the platform/control plane.
  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "0.0.0.0"
  ) {
    return true;
  }
  return false;
}

/**
 * Resolve which Prisma client to use for the current request. Cached
 * per-request via React's `cache()` so multiple callers in the same
 * server-rendering tree don't re-query.
 */
export const getCurrentPrisma = cache(async (): Promise<PrismaClient> => {
  let hostname = "";
  try {
    const h = await headers();
    hostname = (h.get("x-forwarded-host") ?? h.get("host") ?? "")
      .split(":")[0]
      .toLowerCase()
      .trim();
  } catch {
    // headers() throws outside of a request scope (build time, etc.).
    return platformPrisma;
  }
  if (!hostname) return platformPrisma;
  if (isPlatformHostname(hostname)) return platformPrisma;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const domain = await (platformPrisma as any).siteDomain?.findUnique({
      where: { hostname },
      include: { site: true },
    });
    if (
      !domain ||
      !domain.site ||
      !domain.site.isActive ||
      !domain.site.databaseUrl
    ) {
      return platformPrisma;
    }
    const siteId: string = domain.site.id;
    const databaseUrl: string = domain.site.databaseUrl;

    let client = tenantClients.get(siteId);
    if (!client) {
      client = new PrismaClient({
        datasources: { db: { url: databaseUrl } },
        log:
          process.env.NODE_ENV === "development" ? ["error"] : ["error"],
      });
      tenantClients.set(siteId, client);
    }
    return client;
  } catch (e) {
    console.warn("getCurrentPrisma: routing failed, using platform DB", e);
    return platformPrisma;
  }
});

/**
 * Proxy exposed as `prisma`. Existing `import { prisma } from "@/lib/prisma"`
 * keeps working — every property / model access is delegated to the resolved
 * tenant client at call time.
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, key: string | symbol) {
    // Top-level `$method` (transaction, queryRaw, connect, …)
    if (typeof key === "string" && key.startsWith("$")) {
      return async (...args: unknown[]) => {
        const c = await getCurrentPrisma();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (c as any)[key](...args);
      };
    }
    if (typeof key === "symbol") return undefined;

    // Model accessor — return an inner Proxy whose methods forward to the
    // resolved client.
    return new Proxy(
      {},
      {
        get(_inner, methodKey: string | symbol) {
          if (typeof methodKey === "symbol") return undefined;
          return async (...args: unknown[]) => {
            const c = await getCurrentPrisma();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const model = (c as any)[key];
            if (!model || typeof model[methodKey] !== "function") {
              throw new Error(
                `prisma.${String(key)}.${String(methodKey)}() is not available on the resolved client`,
              );
            }
            return model[methodKey](...args);
          };
        },
      },
    );
  },
});
