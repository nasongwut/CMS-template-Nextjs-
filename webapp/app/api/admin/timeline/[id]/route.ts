import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AuthError, requireRole } from "@/lib/auth";

export const runtime = "nodejs";

interface Ctx {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  try {
    await requireRole("ADMIN");
    const { id } = await ctx.params;
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "invalid_body" }, { status: 400 });

    const data: Record<string, unknown> = {};
    if (typeof body.date === "string") {
      const v = body.date.trim();
      if (!v) return NextResponse.json({ error: "date_required" }, { status: 400 });
      if (v.length > 40) return NextResponse.json({ error: "date_too_long" }, { status: 400 });
      data.date = v;
    }
    if (typeof body.title === "string") {
      const v = body.title.trim();
      if (!v) return NextResponse.json({ error: "title_required" }, { status: 400 });
      if (v.length > 200) return NextResponse.json({ error: "title_too_long" }, { status: 400 });
      data.title = v;
    }
    if (typeof body.description === "string") {
      data.description = body.description.slice(0, 1000) || null;
    }
    if (typeof body.imageUrl === "string") {
      data.imageUrl = body.imageUrl.trim().slice(0, 1024) || null;
    }
    if (typeof body.order === "number") data.order = body.order;
    if (typeof body.isPublished === "boolean") data.isPublished = body.isPublished;

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "no_fields_provided" }, { status: 400 });
    }
    const event = await prisma.timelineEvent.update({ where: { id }, data });
    return NextResponse.json({ event });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.code }, { status: e.status });
    }
    throw e;
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  try {
    await requireRole("ADMIN");
    const { id } = await ctx.params;
    await prisma.timelineEvent.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.code }, { status: e.status });
    }
    throw e;
  }
}
