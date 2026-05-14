/**
 * Replaces the previous AboutArticle endpoint. Now manages the new
 * standalone `Article` model used by /articles/[slug].
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AuthError, requireRole } from "@/lib/auth";
import { slugify } from "@/lib/categories";
import { isArticleLayoutId, DEFAULT_ARTICLE_LAYOUT } from "@/lib/article-layouts";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireRole("ADMIN");
    const articles = await prisma.article.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      include: { category: { select: { id: true, slug: true, name: true } } },
    });
    return NextResponse.json({ articles });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.code }, { status: e.status });
    }
    throw e;
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireRole("ADMIN");
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "invalid_body" }, { status: 400 });

    const title = typeof body.title === "string" ? body.title.trim() : "";
    if (!title) return NextResponse.json({ error: "title_required" }, { status: 400 });
    if (title.length > 200) return NextResponse.json({ error: "title_too_long" }, { status: 400 });

    const slug = (typeof body.slug === "string" && body.slug.trim()
      ? slugify(body.slug)
      : slugify(title)) || slugify(`article-${Date.now()}`);

    const exists = await prisma.article.findUnique({ where: { slug } });
    if (exists) return NextResponse.json({ error: "slug_taken" }, { status: 409 });

    const layout =
      typeof body.layout === "string" && isArticleLayoutId(body.layout)
        ? body.layout
        : DEFAULT_ARTICLE_LAYOUT;

    const isPublished = typeof body.isPublished === "boolean" ? body.isPublished : true;
    const publishedAt = isPublished ? new Date() : null;

    const article = await prisma.article.create({
      data: {
        slug,
        title,
        excerpt:
          typeof body.excerpt === "string" ? body.excerpt.slice(0, 400) || null : null,
        body: typeof body.body === "string" ? body.body.slice(0, 100000) : "",
        coverImage:
          typeof body.coverImage === "string" ? body.coverImage.slice(0, 1024) || null : null,
        layout,
        categoryId:
          typeof body.categoryId === "string" && body.categoryId ? body.categoryId : null,
        isPublished,
        publishedAt,
        order: typeof body.order === "number" ? body.order : 0,
      },
      include: { category: { select: { id: true, slug: true, name: true } } },
    });
    return NextResponse.json({ article });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.code }, { status: e.status });
    }
    console.error(e);
    return NextResponse.json({ error: "create_failed" }, { status: 500 });
  }
}
