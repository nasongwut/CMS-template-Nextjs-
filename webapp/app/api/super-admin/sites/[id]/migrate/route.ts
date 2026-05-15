/**
 * POST /api/super-admin/sites/[id]/migrate
 *
 * Runs `prisma migrate deploy` against this site's databaseUrl so the
 * schema gets applied. Useful when a freshly provisioned Neon branch has
 * no tables yet and you need to bootstrap before applying a template.
 */
import { NextRequest, NextResponse } from "next/server";
import { platformPrisma as prisma } from "@/lib/prisma-platform";
import { PlatformAuthError, requirePlatformAdmin } from "@/lib/platform";
import { migrateTenantDb } from "@/lib/migrate-tenant";
import { ensureSchemaExists, resolveTenantUrls } from "@/lib/tenant-db";

export const runtime = "nodejs";
export const maxDuration = 120;

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(_req: NextRequest, ctx: RouteContext) {
  try {
    await requirePlatformAdmin();
    const { id } = await ctx.params;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const site = await (prisma as any).site.findUnique({ where: { id } });
    if (!site) return NextResponse.json({ error: "not_found" }, { status: 404 });
    if (!site.databaseUrl) {
      return NextResponse.json({ error: "no_db_url" }, { status: 400 });
    }

    // Resolve mode + schema (databaseUrl is already fully baked, but we
    // still call resolveTenantUrls() to learn whether this is shared mode
    // and what schema name to create on the cluster first).
    const resolved = resolveTenantUrls({
      databaseUrl: site.databaseUrl,
      directDbUrl: site.directDbUrl,
      slug: site.slug,
    });

    // For shared-schema tenants, create the Postgres schema before running
    // migrations into it. No-op for "public" / dedicated DBs.
    if (resolved && resolved.schema && resolved.schema !== "public") {
      const schemaResult = await ensureSchemaExists(
        resolved.databaseUrl,
        resolved.schema,
      );
      if (!schemaResult.ok) {
        return NextResponse.json(
          {
            success: false,
            stdout: "",
            stderr: `CREATE SCHEMA failed: ${schemaResult.error}`,
            exitCode: -1,
            durationMs: 0,
            fatal: `Could not create Postgres schema "${resolved.schema}": ${schemaResult.error}`,
          },
          { status: 500 },
        );
      }
    }

    const result = await migrateTenantDb({
      // Prefer the resolved URLs — they have `-pooler` stripped from the
      // direct URL so advisory locks work even when the operator's env
      // DIRECT_URL still has the pooler suffix.
      databaseUrl: resolved?.databaseUrl ?? site.databaseUrl,
      directDbUrl: resolved?.directDbUrl ?? site.directDbUrl ?? undefined,
    });

    return NextResponse.json({ ...result, schema: resolved?.schema, mode: resolved?.mode });
  } catch (e) {
    if (e instanceof PlatformAuthError) {
      return NextResponse.json({ error: e.code }, { status: e.status });
    }
    console.error("migrate failed", e);
    return NextResponse.json(
      {
        error: "migrate_failed",
        detail: e instanceof Error ? e.message : String(e),
      },
      { status: 500 },
    );
  }
}
