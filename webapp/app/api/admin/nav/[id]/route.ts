import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AuthError, requireRole } from "@/lib/auth";
import { isNavKind } from "@/lib/nav";

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
    if (typeof body.label === "string") {
      const v = body.label.trim();
      if (!v) return NextResponse.json({ error: "label_required" }, { status: 400 });
      if (v.length > 60) return NextResponse.json({ error: "label_too_long" }, { status: 400 });
      patch.label = v;
    }
    if (typeof body.kind === "string") {
      if (!isNavKind(body.kind))
        return NextResponse.json({ error: "kind_invalid" }, { status: 400 });
      patch.kind = body.kind;
    }
    if (typeof body.target === "string") patch.target = body.target.slice(0, 500);
    if (body.parentId !== undefined) {
      const next =
        typeof body.parentId === "string" && body.parentId ? body.parentId : null;
      if (next === id) {
        return NextResponse.json({ error: "parent_self_reference" }, { status: 400 });
      }
      if (next) {
        const parent = await prisma.navItem.findUnique({ where: { id: next } });
        if (!parent) {
          return NextResponse.json({ error: "parent_not_found" }, { status: 400 });
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((parent as any).parentId) {
          return NextResponse.json({ error: "parent_not_top_level" }, { status: 400 });
        }
      }
      patch.parentId = next;
    }
    if (typeof body.order === "number") patch.order = body.order;
    if (typeof body.requireAuth === "boolean") patch.requireAuth = body.requireAuth;
    if (typeof body.adminOnly === "boolean") patch.adminOnly = body.adminOnly;
    if (typeof body.openInNew === "boolean") patch.openInNew = body.openInNew;
    if (typeof body.isPublished === "boolean") patch.isPublished = body.isPublished;

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: "nothing_to_update" }, { status: 400 });
    }

    const item = await prisma.navItem.update({ where: { id }, data: patch });
    return NextResponse.json({ item });
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
    await prisma.navItem.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.code }, { status: e.status });
    }
    console.error(e);
    return NextResponse.json({ error: "delete_failed" }, { status: 500 });
  }
}
