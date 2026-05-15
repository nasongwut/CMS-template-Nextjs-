/**
 * POST /api/super-admin/sites/[id]/apply-template
 *
 * Bootstraps a tenant database with content from one of the built-in
 * SiteTemplates (vehicles, pets, furniture, party, engineering).
 *
 * Body: { templateId: string, wipeTarget?: boolean }
 */
import { NextRequest, NextResponse } from "next/server";
import { platformPrisma as prisma } from "@/lib/prisma-platform";
import { PlatformAuthError, requirePlatformAdmin } from "@/lib/platform";
import { getTemplate, TEMPLATES } from "@/lib/templates";
import { applyTemplate } from "@/lib/apply-template";

export const runtime = "nodejs";
export const maxDuration = 60;

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, ctx: RouteContext) {
  try {
    await requirePlatformAdmin();
    const { id } = await ctx.params;
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "invalid_body" }, { status: 400 });

    const templateId = typeof body.templateId === "string" ? body.templateId : "";
    if (!templateId) {
      return NextResponse.json(
        { error: "template_required", available: TEMPLATES.map((t) => t.id) },
        { status: 400 },
      );
    }
    const template = getTemplate(templateId);
    if (!template) {
      return NextResponse.json(
        { error: "template_not_found", available: TEMPLATES.map((t) => t.id) },
        { status: 404 },
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const site = await (prisma as any).site.findUnique({ where: { id } });
    if (!site) return NextResponse.json({ error: "site_not_found" }, { status: 404 });
    if (!site.databaseUrl) {
      return NextResponse.json({ error: "site_no_db" }, { status: 400 });
    }

    const wipeTarget = typeof body.wipeTarget === "boolean" ? body.wipeTarget : true;

    const result = await applyTemplate({
      targetDbUrl: site.databaseUrl,
      template,
      wipeTarget,
    });

    return NextResponse.json({ template: templateId, ...result });
  } catch (e) {
    if (e instanceof PlatformAuthError) {
      return NextResponse.json({ error: e.code }, { status: e.status });
    }
    console.error("apply-template failed", e);
    return NextResponse.json(
      {
        error: "apply_template_failed",
        detail: e instanceof Error ? e.message : String(e),
      },
      { status: 500 },
    );
  }
}
