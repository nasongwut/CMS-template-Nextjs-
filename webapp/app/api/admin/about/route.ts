import { NextRequest, NextResponse } from "next/server";
import { AuthError, requireRole } from "@/lib/auth";
import { getAboutPage, updateAboutPage } from "@/lib/about";
import { isLayoutId } from "@/lib/about-layouts";

export const runtime = "nodejs";

/** GET /api/admin/about — read singleton */
export async function GET() {
  try {
    await requireRole("ADMIN");
    const page = await getAboutPage();
    return NextResponse.json({ page });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.code }, { status: e.status });
    }
    throw e;
  }
}

/** PATCH /api/admin/about — update heading / subheading / body */
export async function PATCH(req: NextRequest) {
  try {
    await requireRole("ADMIN");
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "invalid_body" }, { status: 400 });

    const patch: {
      heading?: string;
      subheading?: string;
      body?: string;
      heroImage?: string | null;
      layout?: string;
    } = {};

    if (typeof body.heading === "string") {
      const v = body.heading.trim();
      if (!v) return NextResponse.json({ error: "heading_required" }, { status: 400 });
      if (v.length > 200) return NextResponse.json({ error: "heading_too_long" }, { status: 400 });
      patch.heading = v;
    }
    if (typeof body.subheading === "string") {
      if (body.subheading.length > 400) {
        return NextResponse.json({ error: "subheading_too_long" }, { status: 400 });
      }
      patch.subheading = body.subheading;
    }
    if (typeof body.body === "string") {
      if (body.body.length > 20000) {
        return NextResponse.json({ error: "body_too_long" }, { status: 400 });
      }
      patch.body = body.body;
    }
    if (body.heroImage !== undefined) {
      if (body.heroImage === null || body.heroImage === "") {
        patch.heroImage = null;
      } else if (typeof body.heroImage === "string") {
        if (body.heroImage.length > 1024) {
          return NextResponse.json({ error: "hero_image_too_long" }, { status: 400 });
        }
        patch.heroImage = body.heroImage;
      }
    }
    if (typeof body.layout === "string") {
      if (!isLayoutId(body.layout)) {
        return NextResponse.json({ error: "invalid_layout" }, { status: 400 });
      }
      patch.layout = body.layout;
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: "no_fields_provided" }, { status: 400 });
    }

    const page = await updateAboutPage(patch);
    return NextResponse.json({ page });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.code }, { status: e.status });
    }
    throw e;
  }
}
