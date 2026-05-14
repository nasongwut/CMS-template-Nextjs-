import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, AuthError } from "@/lib/auth";
import { getStorage } from "@/lib/storage";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ id: string }>;
}

async function findOwnedFile(id: string, userId: string, isAdmin: boolean) {
  const f = await prisma.file.findUnique({ where: { id } });
  if (!f) return null;
  if (!isAdmin && f.ownerId !== userId) return null;
  return f;
}

/** GET /api/files/[id] — stream file back */
export async function GET(_req: NextRequest, ctx: RouteContext) {
  try {
    const me = await requireUser();
    const { id } = await ctx.params;
    const file = await findOwnedFile(id, me.id, me.role === "ADMIN");
    if (!file) return NextResponse.json({ error: "not_found" }, { status: 404 });

    const storage = getStorage();
    const { stream, size } = await storage.read(file.key);

    return new NextResponse(stream, {
      status: 200,
      headers: {
        "Content-Type": file.mimeType || "application/octet-stream",
        "Content-Length": String(size),
        "Content-Disposition": `inline; filename="${encodeURIComponent(file.name)}"`,
      },
    });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.code }, { status: e.status });
    }
    console.error(e);
    return NextResponse.json({ error: "read_failed" }, { status: 500 });
  }
}

/** DELETE /api/files/[id] */
export async function DELETE(_req: NextRequest, ctx: RouteContext) {
  try {
    const me = await requireUser();
    const { id } = await ctx.params;
    const file = await findOwnedFile(id, me.id, me.role === "ADMIN");
    if (!file) return NextResponse.json({ error: "not_found" }, { status: 404 });

    const storage = getStorage();
    await storage.delete(file.key).catch(() => undefined);
    await prisma.file.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.code }, { status: e.status });
    }
    console.error(e);
    return NextResponse.json({ error: "delete_failed" }, { status: 500 });
  }
}
