import { NextRequest, NextResponse } from "next/server";
import { platformPrisma as prisma } from "@/lib/prisma-platform";
import { PlatformAuthError, requirePlatformAdmin } from "@/lib/platform";
import { pingDatabaseUrl } from "@/lib/site-clone";
import { resolveTenantUrls, sharedSchemaForSlug } from "@/lib/tenant-db";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requirePlatformAdmin();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sites = await (prisma as any).site.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        domains: true,
        _count: { select: { domains: true } },
      },
    });
    return NextResponse.json({ sites });
  } catch (e) {
    if (e instanceof PlatformAuthError) {
      return NextResponse.json({ error: e.code }, { status: e.status });
    }
    throw e;
  }
}

export async function POST(req: NextRequest) {
  try {
    await requirePlatformAdmin();
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "invalid_body" }, { status: 400 });

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const slug = typeof body.slug === "string"
      ? body.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-")
      : "";
    const databaseUrl = typeof body.databaseUrl === "string" ? body.databaseUrl.trim() : "";
    const directDbUrl = typeof body.directDbUrl === "string" ? body.directDbUrl.trim() : "";
    const primaryDomain =
      typeof body.primaryDomain === "string" ? body.primaryDomain.trim().toLowerCase() : "";
    const notes = typeof body.notes === "string" ? body.notes.slice(0, 1000) : "";

    if (!name) return NextResponse.json({ error: "name_required" }, { status: 400 });
    if (!slug) return NextResponse.json({ error: "slug_required" }, { status: 400 });

    // Resolve to either Mode A (own DB URL) or Mode B (shared DB + schema).
    // If the operator left DATABASE_URL blank, we auto-route to the
    // platform's DATABASE_URL with a per-site `?schema=site_<slug>` so the
    // tenant's tables live in their own isolated Postgres schema.
    const resolved = resolveTenantUrls({
      databaseUrl,
      directDbUrl,
      slug,
    });
    if (!resolved) {
      return NextResponse.json(
        {
          error: "no_db_configuration",
          detail:
            "Either supply a DATABASE_URL for a dedicated tenant DB, or set the platform env DATABASE_URL so this site can share it with a separate schema.",
        },
        { status: 400 },
      );
    }

    // Verify the connection — pings the cluster, not the schema (schema is
    // created later via ensureSchemaExists during migrate).
    if (body.verify !== false) {
      const err = await pingDatabaseUrl(resolved.databaseUrl);
      if (err) {
        return NextResponse.json(
          { error: "db_unreachable", detail: err },
          { status: 400 },
        );
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dup = await (prisma as any).site.findUnique({ where: { slug } });
    if (dup) return NextResponse.json({ error: "slug_taken" }, { status: 409 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const site = await (prisma as any).site.create({
      data: {
        name,
        slug,
        // Persist the FULLY-RESOLVED URL so downstream operations (migrate,
        // apply-template, clone, lib/prisma router) don't need to re-derive
        // the schema.
        databaseUrl: resolved.databaseUrl,
        directDbUrl: resolved.directDbUrl,
        primaryDomain: primaryDomain || null,
        notes: notes || null,
        templateSiteId:
          typeof body.templateSiteId === "string" && body.templateSiteId
            ? body.templateSiteId
            : null,
        // Auto-create a Domain row for the primary domain.
        domains: primaryDomain
          ? { create: [{ hostname: primaryDomain, isPrimary: true }] }
          : undefined,
      },
      include: { domains: true },
    });
    return NextResponse.json({
      site,
      mode: resolved.mode,
      schema: resolved.schema,
    });
  } catch (e) {
    if (e instanceof PlatformAuthError) {
      return NextResponse.json({ error: e.code }, { status: e.status });
    }
    console.error(e);
    return NextResponse.json({ error: "create_failed" }, { status: 500 });
  }
}
