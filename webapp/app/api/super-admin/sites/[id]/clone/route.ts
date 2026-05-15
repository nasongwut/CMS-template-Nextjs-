/**
 * POST /api/super-admin/sites/[id]/clone
 *
 * Copies content from a source site's database into this site's database.
 * Body: { sourceSiteId: string, scopes?: string[], wipeTarget?: boolean }
 *
 * Only PlatformAdmins may invoke this. Both site rows must have a
 * databaseUrl set or the request fails with 400.
 */
import { NextRequest, NextResponse } from "next/server";
import { platformPrisma as prisma } from "@/lib/prisma-platform";
import { PlatformAuthError, requirePlatformAdmin } from "@/lib/platform";
import { ALL_SCOPES, cloneSite, type CloneScope } from "@/lib/site-clone";

export const runtime = "nodejs";
// Long-running — clones can take 10-30 seconds depending on size.
export const maxDuration = 60;

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, ctx: RouteContext) {
  try {
    await requirePlatformAdmin();
    const { id: targetId } = await ctx.params;
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "invalid_body" }, { status: 400 });

    const sourceId = typeof body.sourceSiteId === "string" ? body.sourceSiteId : "";
    const sourceDbUrlOverride =
      typeof body.sourceDbUrl === "string" ? body.sourceDbUrl.trim() : "";

    if (!sourceId && !sourceDbUrlOverride) {
      return NextResponse.json({ error: "source_required" }, { status: 400 });
    }
    if (sourceId && sourceId === targetId) {
      return NextResponse.json({ error: "source_equals_target" }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const target = await (prisma as any).site.findUnique({ where: { id: targetId } });
    if (!target) return NextResponse.json({ error: "target_not_found" }, { status: 404 });
    if (!target.databaseUrl) {
      return NextResponse.json({ error: "target_no_db" }, { status: 400 });
    }

    // Resolve source URL — either from a registered Site or a pasted URL.
    let sourceDbUrl = sourceDbUrlOverride;
    if (!sourceDbUrl) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const source = await (prisma as any).site.findUnique({ where: { id: sourceId } });
      if (!source) return NextResponse.json({ error: "source_not_found" }, { status: 404 });
      if (!source.databaseUrl) {
        return NextResponse.json({ error: "source_no_db" }, { status: 400 });
      }
      sourceDbUrl = source.databaseUrl;
    }
    if (sourceDbUrl === target.databaseUrl) {
      return NextResponse.json({ error: "source_equals_target_url" }, { status: 400 });
    }

    const allowedScopes = new Set<CloneScope>(ALL_SCOPES);
    const scopes = Array.isArray(body.scopes)
      ? (body.scopes.filter((s: unknown) =>
          typeof s === "string" && allowedScopes.has(s as CloneScope),
        ) as CloneScope[])
      : ALL_SCOPES;

    const wipeTarget = typeof body.wipeTarget === "boolean" ? body.wipeTarget : true;

    const result = await cloneSite({
      sourceDbUrl,
      targetDbUrl: target.databaseUrl,
      scopes,
      wipeTarget,
    });

    // Stamp templateSiteId for audit purposes — only when source was a
    // registered Site (we don't track ad-hoc pasted URLs).
    if (sourceId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (prisma as any).site.update({
        where: { id: targetId },
        data: { templateSiteId: sourceId },
      });
    }

    return NextResponse.json(result);
  } catch (e) {
    if (e instanceof PlatformAuthError) {
      return NextResponse.json({ error: e.code }, { status: e.status });
    }
    console.error("clone failed", e);
    return NextResponse.json(
      {
        error: "clone_failed",
        detail: e instanceof Error ? e.message : String(e),
      },
      { status: 500 },
    );
  }
}
