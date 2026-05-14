import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AuthError, hashPassword, requireRole } from "@/lib/auth";
import type { Role } from "@prisma/client";

export const runtime = "nodejs";

/** GET /api/admin/users — list all users */
export async function GET() {
  try {
    await requireRole("ADMIN");
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        _count: { select: { files: true } },
      },
    });
    return NextResponse.json({ users });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.code }, { status: e.status });
    throw e;
  }
}

/** POST /api/admin/users — create a user (admin can pre-create accounts) */
export async function POST(req: NextRequest) {
  try {
    await requireRole("ADMIN");
    const body = await req.json().catch(() => null);
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body?.password === "string" ? body.password : "";
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const role = (body?.role as Role) ?? "USER";

    if (!email || !password) {
      return NextResponse.json({ error: "email_and_password_required" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "password_too_short" }, { status: 400 });
    }
    if (!["ADMIN", "USER", "GUEST"].includes(role)) {
      return NextResponse.json({ error: "invalid_role" }, { status: 400 });
    }
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return NextResponse.json({ error: "email_already_used" }, { status: 409 });

    const user = await prisma.user.create({
      data: {
        email,
        name: name || null,
        role,
        passwordHash: await hashPassword(password),
      },
      select: { id: true, email: true, name: true, role: true, isActive: true },
    });
    return NextResponse.json({ user });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.code }, { status: e.status });
    throw e;
  }
}
