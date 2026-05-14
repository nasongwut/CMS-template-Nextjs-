import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AuthError, requireRole } from "@/lib/auth";
import { isNavKind } from "@/lib/nav";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireRole("ADMIN");
    const items = await prisma.navItem.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });
    return NextResponse.json({ items });
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

    const label = typeof body.label === "string" ? body.label.trim() : "";
    const target = typeof body.target === "string" ? body.target.trim() : "";
    if (!label) return NextResponse.json({ error: "label_required" }, { status: 400 });
    if (label.length > 60)
      return NextResponse.json({ error: "label_too_long" }, { status: 400 });
    if (!target) return NextResponse.json({ error: "target_required" }, { status: 400 });

    const kind = isNavKind(body.kind) ? body.kind : "page";

    const item = await prisma.navItem.create({
      data: {
        label,
        kind,
        target: target.slice(0, 500),
        order: typeof body.order === "number" ? body.order : 0,
        requireAuth: typeof body.requireAuth === "boolean" ? body.requireAuth : false,
        adminOnly: typeof body.adminOnly === "boolean" ? body.adminOnly : false,
        openInNew: typeof body.openInNew === "boolean" ? body.openInNew : false,
        isPublished: typeof body.isPublished === "boolean" ? body.isPublished : true,
      },
    });
    return NextResponse.json({ item });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.code }, { status: e.status });
    }
    console.error(e);
    return NextResponse.json({ error: "create_failed" }, { status: 500 });
  }
}
