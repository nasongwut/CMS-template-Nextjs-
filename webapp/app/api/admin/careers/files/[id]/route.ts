/**
 * GET /api/admin/careers/files/[id] — stream an attached file back to the
 * admin (CV, portfolio PDF, photo). Auth required.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AuthError, requireRole } from "@/lib/auth";
import { readRaw } from "@/lib/storage/raw";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, ctx: RouteContext) {
  try {
    await requireRole("ADMIN");
    const { id } = await ctx.params;
    const file = await prisma.jobApplicationFile.findUnique({ where: { id } });
    if (!file) return NextResponse.json({ error: "not_found" }, { status: 404 });

    const { stream, size } = await readRaw(file.key);
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
