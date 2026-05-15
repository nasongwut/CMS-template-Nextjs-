import { NextResponse } from "next/server";
import { clearPlatformCookie } from "@/lib/platform";

export const runtime = "nodejs";

export async function POST() {
  await clearPlatformCookie();
  return NextResponse.json({ ok: true });
}
