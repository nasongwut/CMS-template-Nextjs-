/**
 * GET /uploads/<key>
 *
 * Public read-only access to files stored under PUBLIC_PREFIX
 * (e.g. /uploads/public/about/<id>.jpg). Anything outside `public/` returns
 * 404 — admin/CV files must go through their dedicated admin route.
 */
import { NextRequest, NextResponse } from "next/server";
import { PUBLIC_PREFIX, readRaw } from "@/lib/storage/raw";

export const runtime = "nodejs";

const MIME_BY_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
};

interface RouteContext {
  params: Promise<{ path: string[] }>;
}

export async function GET(_req: NextRequest, ctx: RouteContext) {
  const { path: parts } = await ctx.params;
  if (!parts || parts.length === 0) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  // Strict allowlist — only files under `public/` are served.
  if (parts[0] !== PUBLIC_PREFIX) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  // Block path traversal & null bytes.
  if (parts.some((p) => p.includes("..") || p.includes("\0") || p.includes("/"))) {
    return NextResponse.json({ error: "bad_path" }, { status: 400 });
  }

  const key = parts.join("/");
  const dot = key.lastIndexOf(".");
  const ext = dot >= 0 ? key.slice(dot).toLowerCase() : "";
  const mimeType = MIME_BY_EXT[ext] ?? "application/octet-stream";

  try {
    const { stream, size } = await readRaw(key);
    return new NextResponse(stream, {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Content-Length": String(size),
        // Public assets — cache aggressively in the browser; admins re-upload
        // to a new key so URLs change.
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
}
