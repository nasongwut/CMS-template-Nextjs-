import { NextRequest, NextResponse } from "next/server";
import { AuthError, requireRole } from "@/lib/auth";
import { getTheme, isHexColor, themeDefaults, updateTheme } from "@/lib/theme";

export const runtime = "nodejs";

const fields = [
  "lightPrimary",
  "lightAccent",
  "lightBackground",
  "lightForeground",
  "darkPrimary",
  "darkAccent",
  "darkBackground",
  "darkForeground",
] as const;
type Field = (typeof fields)[number];

export async function GET() {
  try {
    await requireRole("ADMIN");
    const theme = await getTheme();
    return NextResponse.json({ theme, defaults: themeDefaults });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.code }, { status: e.status });
    }
    throw e;
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireRole("ADMIN");
    const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body) {
      return NextResponse.json({ error: "invalid_body" }, { status: 400 });
    }

    const patch: Partial<Record<Field, string>> = {};
    for (const f of fields) {
      const v = body[f];
      if (typeof v !== "string") continue;
      if (!isHexColor(v)) {
        return NextResponse.json({ error: `invalid_color:${f}` }, { status: 400 });
      }
      patch[f] = v.toLowerCase();
    }
    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: "no_fields_provided" }, { status: 400 });
    }

    const theme = await updateTheme(patch);
    return NextResponse.json({ theme });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.code }, { status: e.status });
    }
    throw e;
  }
}

/** POST /api/admin/theme/reset — restore the default palette. */
export async function POST() {
  try {
    await requireRole("ADMIN");
    const theme = await updateTheme(themeDefaults);
    return NextResponse.json({ theme });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.code }, { status: e.status });
    }
    throw e;
  }
}
