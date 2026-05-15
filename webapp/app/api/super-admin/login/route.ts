import { NextRequest, NextResponse } from "next/server";
import { platformPrisma as prisma } from "@/lib/prisma-platform";
import { setPlatformCookie, verifyPassword } from "@/lib/platform";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (!email || !password) {
    return NextResponse.json({ error: "missing" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = await (prisma as any).platformAdmin
    ?.findUnique({ where: { email } })
    .catch(() => null);
  if (!admin || !admin.isActive) {
    return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
  }
  const ok = await verifyPassword(password, admin.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
  }

  await setPlatformCookie({ sub: admin.id, email: admin.email, name: admin.name });
  return NextResponse.json({ id: admin.id, email: admin.email, name: admin.name });
}
