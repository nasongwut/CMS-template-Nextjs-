/**
 * POST /api/admin/upload — admin-only image upload helper.
 *
 * Used by the /admin/about editors to attach images to articles, timeline
 * events and the page hero. Returns a public URL that can be stored directly
 * in the model's `imageUrl` field.
 *
 * Body: multipart/form-data with field "file"
 *       Optional "prefix" (defaults to "public/about") — sub-folder under
 *       PUBLIC_PREFIX, sanitised to a-z0-9-/.
 *
 * Response: { url, key, mimeType, size, filename }
 */
import { NextRequest, NextResponse } from "next/server";
import { AuthError, requireRole } from "@/lib/auth";
import { maxUploadBytes } from "@/lib/storage";
import { IMAGE_MIME_TYPES, PUBLIC_PREFIX, saveRaw } from "@/lib/storage/raw";

export const runtime = "nodejs";

function sanitisePrefix(raw: string | null): string {
  const base = (raw ?? "about").toString().toLowerCase();
  const cleaned = base.replace(/[^a-z0-9/_-]/g, "").replace(/^\/+|\/+$/g, "");
  const safe = cleaned.split("/").filter(Boolean).slice(0, 3).join("/");
  return safe ? `${PUBLIC_PREFIX}/${safe}` : `${PUBLIC_PREFIX}/about`;
}

export async function POST(req: NextRequest) {
  try {
    await requireRole("ADMIN");

    const form = await req.formData();
    const file = form.get("file");
    const prefixParam = form.get("prefix");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "file_field_missing" }, { status: 400 });
    }
    if (file.size > maxUploadBytes()) {
      return NextResponse.json({ error: "file_too_large" }, { status: 413 });
    }
    if (!IMAGE_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "unsupported_image_type", got: file.type },
        { status: 415 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const saved = await saveRaw({
      buffer,
      filename: file.name || "upload.bin",
      mimeType: file.type || "application/octet-stream",
      prefix: sanitisePrefix(typeof prefixParam === "string" ? prefixParam : null),
    });

    return NextResponse.json({
      url: saved.url,
      key: saved.key,
      mimeType: saved.mimeType,
      size: saved.size,
      filename: saved.filename,
    });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.code }, { status: e.status });
    }
    console.error("admin upload failed", e);
    return NextResponse.json({ error: "upload_failed" }, { status: 500 });
  }
}
