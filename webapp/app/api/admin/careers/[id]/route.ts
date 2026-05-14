import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AuthError, requireRole } from "@/lib/auth";
import { deleteRaw } from "@/lib/storage/raw";
import { isStatus } from "@/lib/careers";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/** GET /api/admin/careers/[id] — full detail including files. */
export async function GET(_req: NextRequest, ctx: RouteContext) {
  try {
    await requireRole("ADMIN");
    const { id } = await ctx.params;
    const application = await prisma.jobApplication.findUnique({
      where: { id },
      include: { files: { orderBy: { createdAt: "asc" } } },
    });
    if (!application) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json({ application });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.code }, { status: e.status });
    }
    throw e;
  }
}

/** PATCH /api/admin/careers/[id] — update status / notes. */
export async function PATCH(req: NextRequest, ctx: RouteContext) {
  try {
    await requireRole("ADMIN");
    const { id } = await ctx.params;
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "invalid_body" }, { status: 400 });

    const patch: { status?: string } = {};
    if (body.status !== undefined) {
      if (!isStatus(body.status)) {
        return NextResponse.json({ error: "invalid_status" }, { status: 400 });
      }
      patch.status = body.status;
    }
    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: "nothing_to_update" }, { status: 400 });
    }

    const application = await prisma.jobApplication.update({
      where: { id },
      // Cast because Prisma's enum type isn't exposed via runtime import without
      // pulling the full @prisma/client namespace into this file.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: patch as any,
    });
    return NextResponse.json({ application });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.code }, { status: e.status });
    }
    console.error(e);
    return NextResponse.json({ error: "update_failed" }, { status: 500 });
  }
}

/** DELETE /api/admin/careers/[id] — removes the application + all attached files. */
export async function DELETE(_req: NextRequest, ctx: RouteContext) {
  try {
    await requireRole("ADMIN");
    const { id } = await ctx.params;
    const application = await prisma.jobApplication.findUnique({
      where: { id },
      include: { files: true },
    });
    if (!application) return NextResponse.json({ error: "not_found" }, { status: 404 });

    await Promise.all(
      application.files.map((f) => deleteRaw(f.key).catch(() => undefined)),
    );
    await prisma.jobApplication.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.code }, { status: e.status });
    }
    console.error(e);
    return NextResponse.json({ error: "delete_failed" }, { status: 500 });
  }
}
