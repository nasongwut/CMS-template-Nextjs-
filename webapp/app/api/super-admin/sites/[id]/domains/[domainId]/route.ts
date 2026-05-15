/**
 * PATCH  /api/super-admin/sites/[id]/domains/[domainId] — mark as primary
 * DELETE /api/super-admin/sites/[id]/domains/[domainId] — remove domain
 */
import { NextRequest, NextResponse } from "next/server";
import { platformPrisma as prisma } from "@/lib/prisma-platform";
import { PlatformAuthError, requirePlatformAdmin } from "@/lib/platform";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ id: string; domainId: string }>;
}

export async function PATCH(req: NextRequest, ctx: RouteContext) {
  try {
    await requirePlatformAdmin();
    const { id, domainId } = await ctx.params;
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "invalid_body" }, { status: 400 });

    if (body.isPrimary === true) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const domain = await (prisma as any).siteDomain.findUnique({
        where: { id: domainId },
      });
      if (!domain || domain.siteId !== id) {
        return NextResponse.json({ error: "not_found" }, { status: 404 });
      }
      // Demote all others on this site
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (prisma as any).siteDomain.updateMany({
        where: { siteId: id, isPrimary: true },
        data: { isPrimary: false },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updated = await (prisma as any).siteDomain.update({
        where: { id: domainId },
        data: { isPrimary: true },
      });
      // Sync Site.primaryDomain
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (prisma as any).site.update({
        where: { id },
        data: { primaryDomain: updated.hostname },
      });
      return NextResponse.json({ domain: updated });
    }
    return NextResponse.json({ error: "nothing_to_update" }, { status: 400 });
  } catch (e) {
    if (e instanceof PlatformAuthError) {
      return NextResponse.json({ error: e.code }, { status: e.status });
    }
    console.error(e);
    return NextResponse.json({ error: "update_failed" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, ctx: RouteContext) {
  try {
    await requirePlatformAdmin();
    const { id, domainId } = await ctx.params;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const domain = await (prisma as any).siteDomain.findUnique({
      where: { id: domainId },
    });
    if (!domain || domain.siteId !== id) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma as any).siteDomain.delete({ where: { id: domainId } });
    // If this was the primary, clear Site.primaryDomain.
    if (domain.isPrimary) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (prisma as any).site.update({
        where: { id },
        data: { primaryDomain: null },
      });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof PlatformAuthError) {
      return NextResponse.json({ error: e.code }, { status: e.status });
    }
    console.error(e);
    return NextResponse.json({ error: "delete_failed" }, { status: 500 });
  }
}
