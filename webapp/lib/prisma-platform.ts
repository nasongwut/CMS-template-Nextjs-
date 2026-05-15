/**
 * Platform / control-plane PrismaClient — fixed to the main DATABASE_URL
 * from .env.  This is the client used by:
 *   - /super-admin/* pages and APIs (Site, SiteDomain, PlatformAdmin)
 *   - lib/prisma.ts to resolve `hostname → tenant DB` on every request
 *
 * Tenant queries go through the lazy router in lib/prisma.ts which picks
 * the right tenant client per request.
 */
import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __platformPrisma: PrismaClient | undefined;
}

export const platformPrisma =
  global.__platformPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.__platformPrisma = platformPrisma;
}
