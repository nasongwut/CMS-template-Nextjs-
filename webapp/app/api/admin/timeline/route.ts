import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AuthError, requireRole } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireRole("ADMIN");
    const events = await prisma.timelineEvent.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });
    return NextResponse.json({ events });
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

    const date = typeof body.date === "string" ? body.date.trim() : "";
    const title = typeof body.title === "string" ? body.title.trim() : "";
    if (!date) return NextResponse.json({ error: "date_required" }, { status: 400 });
    if (!title) return NextResponse.json({ error: "title_required" }, { status: 400 });
    if (date.length > 40) return NextResponse.json({ error: "date_too_long" }, { status: 400 });
    if (title.length > 200) return NextResponse.json({ error: "title_too_long" }, { status: 400 });

    const event = await prisma.timelineEvent.create({
      data: {
        date,
        title,
        description:
          typeof body.description === "string" ? body.description.slice(0, 1000) || null : null,
        imageUrl:
          typeof body.imageUrl === "string" ? body.imageUrl.trim().slice(0, 1024) || null : null,
        order: typeof body.order === "number" ? body.order : 0,
        isPublished: typeof body.isPublished === "boolean" ? body.isPublished : true,
      },
    });
    return NextResponse.json({ event });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.code }, { status: e.status });
    }
    throw e;
  }
}
