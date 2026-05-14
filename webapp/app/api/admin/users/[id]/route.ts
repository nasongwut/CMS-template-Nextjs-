import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AuthError, hashPassword, requireRole } from "@/lib/auth";
import type { Role } from "@prisma/client";

export const runtime = "nodejs";

interface Ctx {
  params: Promise<{ id: string }>;
}

/** PATCH /api/admin/users/[id] — update role / isActive / password */
export async function PATCH(req: NextRequest, ctx: Ctx) {
  try {
    const me = await requireRole("ADMIN");
    const { id } = await ctx.params;
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "invalid_body" }, { status: 400 });

    const data: Record<string, unknown> = {};
    if (typeof body.name === "string") data.name = body.name.trim() || null;
    if (typeof body.isActive === "boolean") data.isActive = body.isActive;
    if (typeof body.role === "string") {
      if (!["ADMIN", "USER", "GUEST"].includes(body.role)) {
        return NextResponse.json({ error: "invalid_role" }, { status: 400 });
      }
      data.role = body.role as Role;
    }
    if (typeof body.password === "string" && body.password.length > 0) {
      if (body.password.length < 8) {
        return NextResponse.json({ error: "password_too_short" }, { status: 400 });
      }
      data.passwordHash = await hashPassword(body.password);
    }

    // Safety: don't let an admin demote / disable themselves and lock out.
    if (id === me.id && (data.role === "USER" || data.role === "GUEST" || data.isActive === false)) {
      return NextResponse.json({ error: "cannot_modify_self" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, email: true, name: true, role: true, isActive: true },
    });
    return NextResponse.json({ user });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.code }, { status: e.status });
    throw e;
  }
}

/** DELETE /api/admin/users/[id] */
export async function DELETE(_req: NextRequest, ctx: Ctx) {
  try {
    const me = await requireRole("ADMIN");
    const { id } = await ctx.params;
    if (id === me.id) {
      return NextResponse.json({ error: "cannot_delete_self" }, { status: 400 });
    }
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.code }, { status: e.status });
    throw e;
  }
}
