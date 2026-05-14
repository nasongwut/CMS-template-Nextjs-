import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AuthError, requireRole } from "@/lib/auth";
import { slugify } from "@/lib/categories";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireRole("ADMIN");
    const categories = await prisma.category.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      include: { _count: { select: { articles: true } } },
    });
    return NextResponse.json({ categories });
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

    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) return NextResponse.json({ error: "name_required" }, { status: 400 });
    if (name.length > 120) return NextResponse.json({ error: "name_too_long" }, { status: 400 });

    const slug = (typeof body.slug === "string" && body.slug.trim()
      ? slugify(body.slug)
      : slugify(name)) || slugify(`cat-${Date.now()}`);

    const exists = await prisma.category.findUnique({ where: { slug } });
    if (exists) return NextResponse.json({ error: "slug_taken" }, { status: 409 });

    const category = await prisma.category.create({
      data: {
        slug,
        name,
        description:
          typeof body.description === "string" ? body.description.slice(0, 1000) || null : null,
        coverImage:
          typeof body.coverImage === "string" ? body.coverImage.slice(0, 1024) || null : null,
        order: typeof body.order === "number" ? body.order : 0,
        isPublished: typeof body.isPublished === "boolean" ? body.isPublished : true,
      },
    });
    return NextResponse.json({ category });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.code }, { status: e.status });
    }
    console.error(e);
    return NextResponse.json({ error: "create_failed" }, { status: 500 });
  }
}
