/**
 * POST   /api/super-admin/sites/[id]/domains   — add hostname to site
 * Body: { hostname: string, isPrimary?: boolean }
 */
import { NextRequest, NextResponse } from "next/server";
import { platformPrisma as prisma } from "@/lib/prisma-platform";
import { PlatformAuthError, requirePlatformAdmin } from "@/lib/platform";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, ctx: RouteContext) {
  try {
    await requirePlatformAdmin();
    const { id } = await ctx.params;
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "invalid_body" }, { status: 400 });

    const hostname =
      typeof body.hostname === "string" ? body.hostname.trim().toLowerCase() : "";
    if (!hostname) {
      return NextResponse.json({ error: "hostname_required" }, { status: 400 });
    }
    // Basic hostname validation — letters / digits / dot / hyphen.
    if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/.test(hostname)) {
      return NextResponse.json(
        { error: "hostname_invalid", detail: "letters/digits/dots/hyphens only" },
        { status: 400 },
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const site = await (prisma as any).site.findUnique({ where: { id } });
    if (!site) return NextResponse.json({ error: "site_not_found" }, { status: 404 });

    // Hostname must be globally unique across all sites.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dup = await (prisma as any).siteDomain.findUnique({
      where: { hostname },
    });
    if (dup) {
      return NextResponse.json(
        { error: "hostname_taken", siteId: dup.siteId },
        { status: 409 },
      );
    }

    const isPrimary = body.isPrimary === true;
    if (isPrimary) {
      // Demote any existing primary domain for this site.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (prisma as any).siteDomain.updateMany({
        where: { siteId: id, isPrimary: true },
        data: { isPrimary: false },
      });
      // Also update Site.primaryDomain for quick reference.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (prisma as any).site.update({
        where: { id },
        data: { primaryDomain: hostname },
      });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const created = await (prisma as any).siteDomain.create({
      data: { hostname, siteId: id, isPrimary },
    });
    return NextResponse.json({ domain: created });
  } catch (e) {
    if (e instanceof PlatformAuthError) {
      return NextResponse.json({ error: e.code }, { status: e.status });
    }
    console.error("add domain failed", e);
    return NextResponse.json(
      { error: "create_failed", detail: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}
