import { NextRequest, NextResponse } from "next/server";
import { platformPrisma as prisma } from "@/lib/prisma-platform";
import { PlatformAuthError, requirePlatformAdmin } from "@/lib/platform";
import { pingDatabaseUrl } from "@/lib/site-clone";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, ctx: RouteContext) {
  try {
    await requirePlatformAdmin();
    const { id } = await ctx.params;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const site = await (prisma as any).site.findUnique({
      where: { id },
      include: { domains: true },
    });
    if (!site) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json({ site });
  } catch (e) {
    if (e instanceof PlatformAuthError) {
      return NextResponse.json({ error: e.code }, { status: e.status });
    }
    throw e;
  }
}

export async function PATCH(req: NextRequest, ctx: RouteContext) {
  try {
    await requirePlatformAdmin();
    const { id } = await ctx.params;
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "invalid_body" }, { status: 400 });

    const patch: Record<string, unknown> = {};
    if (typeof body.name === "string") patch.name = body.name.trim();
    if (typeof body.primaryDomain === "string") {
      patch.primaryDomain = body.primaryDomain.trim().toLowerCase() || null;
    }
    if (typeof body.databaseUrl === "string") {
      const url = body.databaseUrl.trim();
      if (url && body.verify !== false) {
        const err = await pingDatabaseUrl(url);
        if (err) {
          return NextResponse.json(
            { error: "db_unreachable", detail: err },
            { status: 400 },
          );
        }
      }
      patch.databaseUrl = url;
    }
    if (typeof body.directDbUrl === "string") patch.directDbUrl = body.directDbUrl.trim();
    if (typeof body.notes === "string") patch.notes = body.notes.slice(0, 1000) || null;
    if (typeof body.isActive === "boolean") patch.isActive = body.isActive;

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: "nothing_to_update" }, { status: 400 });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const site = await (prisma as any).site.update({
      where: { id },
      data: patch,
      include: { domains: true },
    });
    return NextResponse.json({ site });
  } catch (e) {
    if (e instanceof PlatformAuthError) {
      return NextResponse.json({ error: e.code }, { status: e.status });
    }
    console.error(e);
    return NextResponse.json({ error: "update_failed" }, { status: 500 });
  }
}

/**
 * DELETE /api/super-admin/sites/[id]
 *
 * Removes the Site row + its SiteDomain rows (cascade). Does NOT drop the
 * tenant database itself — the platform admin is expected to clean that up
 * separately at the DB provider (Neon / RDS / etc).
 *
 * Optional ?wipeContent=1 — additionally connects to the tenant DB and
 * deletes the rows of Article / Category / NavItem / TimelineEvent / AboutPage /
 * SiteSettings / ThemeSettings before the Site row is removed. Useful when
 * the tenant DB is shared across attempts and you want a clean slate.
 */
export async function DELETE(req: NextRequest, ctx: RouteContext) {
  try {
    await requirePlatformAdmin();
    const { id } = await ctx.params;
    const wipeContent =
      new URL(req.url).searchParams.get("wipeContent") === "1";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const site = await (prisma as any).site.findUnique({ where: { id } });
    if (!site) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    // Optionally wipe tenant content first.
    let wiped = false;
    let wipeError: string | null = null;
    if (wipeContent && site.databaseUrl) {
      try {
        const { PrismaClient } = await import("@prisma/client");
        const tenant = new PrismaClient({
          datasources: { db: { url: site.databaseUrl } },
        });
        try {
          // Order matters — FK dependencies first.
          await tenant.article.deleteMany().catch(() => undefined);
          await tenant.category.deleteMany().catch(() => undefined);
          await tenant.navItem.deleteMany().catch(() => undefined);
          await tenant.timelineEvent.deleteMany().catch(() => undefined);
          await tenant.aboutPage.deleteMany().catch(() => undefined);
          await tenant.siteSettings.deleteMany().catch(() => undefined);
          await tenant.themeSettings.deleteMany().catch(() => undefined);
          wiped = true;
        } finally {
          await tenant.$disconnect().catch(() => undefined);
        }
      } catch (e) {
        wipeError = e instanceof Error ? e.message : String(e);
      }
    }

    // Remove cached tenant client (if any) so a future site reusing the
    // same id doesn't hit the wrong DB.
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cache = (globalThis as any).__tenantClients as
        | Map<string, unknown>
        | undefined;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const client = cache?.get(id) as { $disconnect?: () => Promise<void> } | undefined;
      await client?.$disconnect?.().catch(() => undefined);
      cache?.delete(id);
    } catch {
      /* best-effort */
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma as any).site.delete({ where: { id } });
    return NextResponse.json({ ok: true, wiped, wipeError });
  } catch (e) {
    if (e instanceof PlatformAuthError) {
      return NextResponse.json({ error: e.code }, { status: e.status });
    }
    console.error("site delete failed", e);
    return NextResponse.json(
      {
        error: "delete_failed",
        detail: e instanceof Error ? e.message : String(e),
      },
      { status: 500 },
    );
  }
}
