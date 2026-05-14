import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AuthError, requireUser } from "@/lib/auth";
import { getStorage } from "@/lib/storage";

export const runtime = "nodejs";

interface Ctx {
  params: Promise<{ id: string }>;
}

/**
 * DELETE /api/folders/:id
 *   ?cascade=1  → also delete every file inside (default behaviour).
 *   ?cascade=0  → 409 if the folder has files; otherwise drop the empty folder.
 */
export async function DELETE(req: NextRequest, ctx: Ctx) {
  try {
    const me = await requireUser();
    const { id } = await ctx.params;
    const cascade = new URL(req.url).searchParams.get("cascade") !== "0";

    const folder = await prisma.folder.findUnique({
      where: { id },
      include: { files: true },
    });
    if (!folder) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    if (me.role !== "ADMIN" && folder.ownerId !== me.id) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    if (!cascade && folder.files.length > 0) {
      return NextResponse.json(
        { error: "folder_not_empty", count: folder.files.length },
        { status: 409 },
      );
    }

    const storage = getStorage();

    // Best-effort: drop each blob from the backend, then the DB rows go via cascade.
    for (const f of folder.files) {
      try {
        await storage.delete(f.key);
      } catch {
        /* swallow — DB row deletion is the source of truth */
      }
    }

    await prisma.$transaction([
      prisma.file.deleteMany({ where: { folderId: id } }),
      prisma.folder.delete({ where: { id } }),
    ]);

    return NextResponse.json({ ok: true, removedFiles: folder.files.length });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.code }, { status: e.status });
    }
    console.error(e);
    return NextResponse.json({ error: "delete_failed" }, { status: 500 });
  }
}

/** PATCH /api/folders/:id — rename folder { name } */
export async function PATCH(req: NextRequest, ctx: Ctx) {
  try {
    const me = await requireUser();
    const { id } = await ctx.params;
    const body = await req.json().catch(() => null);
    const raw = typeof body?.name === "string" ? body.name.trim() : "";
    if (!raw) return NextResponse.json({ error: "name_required" }, { status: 400 });

    const folder = await prisma.folder.findUnique({ where: { id } });
    if (!folder) return NextResponse.json({ error: "not_found" }, { status: 404 });
    if (me.role !== "ADMIN" && folder.ownerId !== me.id) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    const dup = await prisma.folder.findFirst({
      where: { ownerId: folder.ownerId, name: raw, NOT: { id } },
    });
    if (dup) return NextResponse.json({ error: "folder_already_exists" }, { status: 409 });

    const updated = await prisma.folder.update({
      where: { id },
      data: { name: raw },
      include: { _count: { select: { files: true } } },
    });
    return NextResponse.json({ folder: updated });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.code }, { status: e.status });
    }
    throw e;
  }
}
