import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { classifySource, visitorHash } from "@/lib/analytics";

export const runtime = "nodejs";

/**
 * POST /api/track/pageview
 *
 * Body: { path: string; referrer?: string; utmSource?, utmMedium?, utmCampaign? }
 *
 * Called by the PageTracker client component on every route change.
 * No auth required — anonymous visitors should be tracked too — but the
 * session (if any) is attached as userId.
 */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as
    | {
        path?: string;
        referrer?: string;
        utmSource?: string;
        utmMedium?: string;
        utmCampaign?: string;
      }
    | null;

  if (!body || typeof body.path !== "string" || body.path.length > 2048) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  // Don't store our own tracking pings or absurd paths.
  if (body.path.startsWith("/api/")) return NextResponse.json({ ok: true });

  const referrer = typeof body.referrer === "string" && body.referrer.length > 0 ? body.referrer.slice(0, 2048) : null;
  const utmSource = stringOrNull(body.utmSource);
  const utmMedium = stringOrNull(body.utmMedium);
  const utmCampaign = stringOrNull(body.utmCampaign);

  const source = classifySource(referrer, { source: utmSource, medium: utmMedium });
  const referrerHost = hostnameFromReferrer(referrer);

  const ua = req.headers.get("user-agent") ?? "";
  const ip = forwardedIp(req) ?? "0.0.0.0";
  const day = new Date().toISOString().slice(0, 10);
  const hash = visitorHash(ip, ua, day);
  const country = countryFromHeaders(req);

  const session = await getSession().catch(() => null);

  try {
    await prisma.pageView.create({
      data: {
        path: body.path.slice(0, 2048),
        referrer,
        referrerHost,
        source,
        utmSource,
        utmMedium,
        utmCampaign,
        userAgent: ua.slice(0, 512) || null,
        country,
        visitorHash: hash,
        userId: session?.sub ?? null,
      },
    });
  } catch (e) {
    // Don't break the visitor's page just because we couldn't log.
    console.warn("pageview log failed", e);
  }
  return NextResponse.json({ ok: true });
}

function hostnameFromReferrer(ref: string | null): string | null {
  if (!ref) return null;
  try {
    return new URL(ref).hostname.replace(/^www\./, "").toLowerCase().slice(0, 120);
  } catch {
    return null;
  }
}

/**
 * Best-effort country lookup from edge headers.
 *   - Cloudflare        → `cf-ipcountry`
 *   - Vercel            → `x-vercel-ip-country`
 *   - AWS CloudFront    → `cloudfront-viewer-country`
 *   - Generic           → `x-country` (custom proxies)
 *
 * Returns ISO-3166 alpha-2 code uppercased, or null if no header.
 */
function countryFromHeaders(req: NextRequest): string | null {
  const candidates = [
    "cf-ipcountry",
    "x-vercel-ip-country",
    "cloudfront-viewer-country",
    "x-country",
  ];
  for (const h of candidates) {
    const v = req.headers.get(h);
    if (v && /^[A-Za-z]{2}$/.test(v)) return v.toUpperCase();
  }
  // Dev fallback — localhost loop has no header.
  return null;
}

function stringOrNull(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, 120);
}

function forwardedIp(req: NextRequest): string | null {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip");
}
