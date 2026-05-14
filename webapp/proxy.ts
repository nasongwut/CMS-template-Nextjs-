import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Edge-friendly request proxy (renamed from middleware.ts in Next.js 16).
// Verifies the JWT cookie only — detailed role checks happen server-side in
// pages and route handlers.

const COOKIE = process.env.SESSION_COOKIE_NAME || "app_session";
const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "dev-secret-change-me-dev-secret-change-me",
);

const PROTECTED = ["/files", "/admin"];
const ADMIN_ONLY = ["/admin"];

async function getRole(token: string | undefined): Promise<string | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET, { issuer: "webapp" });
    return typeof payload.role === "string" ? payload.role : null;
  } catch {
    return null;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!PROTECTED.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  const role = await getRole(req.cookies.get(COOKIE)?.value);
  if (!role) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }
  if (ADMIN_ONLY.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    if (role !== "ADMIN") {
      const url = req.nextUrl.clone();
      url.pathname = "/files";
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/files/:path*", "/admin/:path*"],
};
