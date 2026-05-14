import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AuthError, requireRole } from "@/lib/auth";
import { slugify } from "@/lib/categories";
import { isArticleLayoutId } from "@/lib/article-layouts";

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

    if (typeof body.title === "string") {
      const v = body.title.trim();
      if (!v) return NextResponse.json({ error: "title_required" }, { status: 400 });
      if (v.length > 200) return NextResponse.json({ error: "title_too_long" }, { status: 400 });
      patch.title = v;
    }
    if (typeof body.slug === "string") {
      const v = slugify(body.slug);
      if (!v) return NextResponse.json({ error: "slug_invalid" }, { status: 400 });
      const dup = await prisma.article.findUnique({ where: { slug: v } });
      if (dup && dup.id !== id) {
        return NextResponse.json({ error: "slug_taken" }, { status: 409 });
      }
      patch.slug = v;
    }
    if (body.excerpt !== undefined) {
      patch.excerpt =
        typeof body.excerpt === "string" ? body.excerpt.slice(0, 400) || null : null;
    }
    if (typeof body.body === "string") {
      patch.body = body.body.slice(0, 100000);
    }
    if (body.coverImage !== undefined) {
      patch.coverImage =
        typeof body.coverImage === "string" ? body.coverImage.slice(0, 1024) || null : null;
    }
    if (typeof body.layout === "string") {
      if (!isArticleLayoutId(body.layout)) {
        return NextResponse.json({ error: "invalid_layout" }, { status: 400 });
      }
      patch.layout = body.layout;
    }
    if (body.categoryId !== undefined) {
      patch.categoryId =
        typeof body.categoryId === "string" && body.categoryId ? body.categoryId : null;
    }
    if (typeof body.isPublished === "boolean") {
      patch.isPublished = body.isPublished;
      if (body.isPublished) {
        const current = await prisma.article.findUnique({ where: { id } });
        if (current && !current.publishedAt) patch.publishedAt = new Date();
      }
    }
    if (typeof body.order === "number") patch.order = body.order;

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: "nothing_to_update" }, { status: 400 });
    }

    const article = await prisma.article.update({
      where: { id },
      data: patch,
      include: { category: { select: { id: true, slug: true, name: true } } },
    });
    return NextResponse.json({ article });
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
    await prisma.article.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.code }, { status: e.status });
    }
    console.error(e);
    return NextResponse.json({ error: "delete_failed" }, { status: 500 });
  }
}
