import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AuthError, requireUser } from "@/lib/auth";

export const runtime = "nodejs";

/** GET /api/folders — list folders owned by the current user (or all if admin) */
export async function GET() {
  try {
    const me = await requireUser();
    const where = me.role === "ADMIN" ? {} : { ownerId: me.id };
    const folders = await prisma.folder.findMany({
      where,
      orderBy: { name: "asc" },
      include: {
        owner: { select: { id: true, email: true } },
        _count: { select: { files: true } },
      },
    });
    return NextResponse.json({ folders });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.code }, { status: e.status });
    }
    throw e;
  }
}

/** POST /api/folders — create a folder { name } */
export async function POST(req: NextRequest) {
  try {
    const me = await requireUser();
    const body = await req.json().catch(() => null);
    const raw = typeof body?.name === "string" ? body.name.trim() : "";
    if (!raw) {
      return NextResponse.json({ error: "name_required" }, { status: 400 });
    }
    if (raw.length > 80) {
      return NextResponse.json({ error: "name_too_long" }, { status: 400 });
    }
    // Disallow path separators / unsafe characters
    if (/[\\/]/.test(raw) || raw.startsWith(".")) {
      return NextResponse.json({ error: "invalid_name" }, { status: 400 });
    }

    const existing = await prisma.folder.findFirst({
      where: { ownerId: me.id, name: raw },
    });
    if (existing) {
      return NextResponse.json({ error: "folder_already_exists" }, { status: 409 });
    }

    const folder = await prisma.folder.create({
      data: { name: raw, ownerId: me.id },
      include: { _count: { select: { files: true } } },
    });
    return NextResponse.json({ folder });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.code }, { status: e.status });
    }
    throw e;
  }
}
