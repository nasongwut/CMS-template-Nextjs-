import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AuthError, requireRole } from "@/lib/auth";
import { ALLOWED_STATUSES, isStatus } from "@/lib/careers";

export const runtime = "nodejs";

/** GET /api/admin/careers — list applications (optional ?status=NEW). */
export async function GET(req: NextRequest) {
  try {
    await requireRole("ADMIN");
    const status = new URL(req.url).searchParams.get("status");
    const where = status && isStatus(status) ? { status } : {};

    const applications = await prisma.jobApplication.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { files: true } },
      },
    });

    // Counts per status — useful for the filter tabs.
    const grouped = await prisma.jobApplication.groupBy({
      by: ["status"],
      _count: true,
    });
    const counts: Record<string, number> = Object.fromEntries(
      ALLOWED_STATUSES.map((s) => [s, 0]),
    );
    for (const g of grouped) counts[g.status] = g._count;

    return NextResponse.json({ applications, counts });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.code }, { status: e.status });
    }
    console.error(e);
    return NextResponse.json({ error: "list_failed" }, { status: 500 });
  }
}
