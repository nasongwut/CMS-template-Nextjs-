import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AuthError, requireRole } from "@/lib/auth";
import { slugify } from "@/lib/categories";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, ctx: RouteContext) {
  try {
    await requireRole("ADMIN");
    const { id } = await ctx.params;
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "invalid_body" }, { status: 400 });

    const patch: Record<string, unknown> = {};
    if (typeof body.name === "string") {
      const v = body.name.trim();
      if (!v) return NextResponse.json({ error: "name_required" }, { status: 400 });
      if (v.length > 120) return NextResponse.json({ error: "name_too_long" }, { status: 400 });
      patch.name = v;
    }
    if (typeof body.slug === "string") {
      const v = slugify(body.slug);
      if (!v) return NextResponse.json({ error: "slug_invalid" }, { status: 400 });
      // Ensure uniqueness (except self)
      const existing = await prisma.category.findUnique({ where: { slug: v } });
      if (existing && existing.id !== id) {
        return NextResponse.json({ error: "slug_taken" }, { status: 409 });
      }
      patch.slug = v;
    }
    if (body.description !== undefined) {
      patch.description =
        typeof body.description === "string" ? body.description.slice(0, 1000) || null : null;
    }
    if (body.coverImage !== undefined) {
      patch.coverImage =
        typeof body.coverImage === "string" ? body.coverImage.slice(0, 1024) || null : null;
    }
    if (typeof body.order === "number") patch.order = body.order;
    if (typeof body.isPublished === "boolean") patch.isPublished = body.isPublished;

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: "nothing_to_update" }, { status: 400 });
    }

    const category = await prisma.category.update({ where: { id }, data: patch });
    return NextResponse.json({ category });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.code }, { status: e.status });
    }
    console.error(e);
    return NextResponse.json({ error: "update_failed" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, ctx: RouteContext) {
  try {
    await requireRole("ADMIN");
    const { id } = await ctx.params;
    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.code }, { status: e.status });
    }
    console.error(e);
    return NextResponse.json({ error: "delete_failed" }, { status: 500 });
  }
}
