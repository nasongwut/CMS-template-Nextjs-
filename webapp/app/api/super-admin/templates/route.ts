/**
 * GET /api/super-admin/templates — list available built-in templates.
 * (Mostly used by the admin UI; templates themselves are static.)
 */
import { NextResponse } from "next/server";
import { PlatformAuthError, requirePlatformAdmin } from "@/lib/platform";
import { TEMPLATES } from "@/lib/templates";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requirePlatformAdmin();
    return NextResponse.json({
      templates: TEMPLATES.map((t) => ({
        id: t.id,
        name: t.name,
        blurb: t.blurb,
        glyph: t.glyph,
        themeId: t.themeId,
        siteName: t.siteName,
        siteDescription: t.siteDescription,
        counts: {
          categories: t.categories.length,
          articles: t.articles.length,
          timeline: t.timeline.length,
          navItems:
            t.navItems.length +
            t.navItems.reduce((n, i) => n + (i.children?.length ?? 0), 0),
        },
      })),
    });
  } catch (e) {
    if (e instanceof PlatformAuthError) {
      return NextResponse.json({ error: e.code }, { status: e.status });
    }
    throw e;
  }
}
