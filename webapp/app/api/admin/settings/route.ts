import { NextRequest, NextResponse } from "next/server";
import { AuthError, requireRole } from "@/lib/auth";
import { getSettings, updateSettings } from "@/lib/settings";

export const runtime = "nodejs";

/** GET /api/admin/settings — read the singleton */
export async function GET() {
  try {
    await requireRole("ADMIN");
    const settings = await getSettings();
    return NextResponse.json({ settings });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.code }, { status: e.status });
    }
    throw e;
  }
}

/** PATCH /api/admin/settings — update one or more fields */
export async function PATCH(req: NextRequest) {
  try {
    await requireRole("ADMIN");
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "invalid_body" }, { status: 400 });
    }

    const patch: {
      siteName?: string;
      description?: string;
      keywords?: string;
      author?: string;
    } = {};

    if (typeof body.siteName === "string") {
      const v = body.siteName.trim();
      if (!v) return NextResponse.json({ error: "siteName_required" }, { status: 400 });
      if (v.length > 120) return NextResponse.json({ error: "siteName_too_long" }, { status: 400 });
      patch.siteName = v;
    }
    if (typeof body.description === "string") {
      const v = body.description.trim();
      if (v.length > 500) {
        return NextResponse.json({ error: "description_too_long" }, { status: 400 });
      }
      patch.description = v;
    }
    if (typeof body.keywords === "string") {
      const v = body.keywords.trim();
      if (v.length > 500) {
        return NextResponse.json({ error: "keywords_too_long" }, { status: 400 });
      }
      patch.keywords = v;
    }
    if (typeof body.author === "string") {
      const v = body.author.trim();
      if (v.length > 120) {
        return NextResponse.json({ error: "author_too_long" }, { status: 400 });
      }
      patch.author = v;
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: "no_fields_provided" }, { status: 400 });
    }

    const settings = await updateSettings(patch);
    return NextResponse.json({ settings });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.code }, { status: e.status });
    }
    throw e;
  }
}
