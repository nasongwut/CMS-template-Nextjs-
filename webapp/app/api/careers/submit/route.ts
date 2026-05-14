/**
 * POST /api/careers/submit — anonymous job application.
 *
 * Body: multipart/form-data
 *   position           string  (required)
 *   fullName           string  (required)
 *   email              string  (required)
 *   phone              string  (optional)
 *   experience         string  (optional)
 *   expectedSalary     string  (optional)
 *   availableFrom      string  (optional)
 *   portfolioUrl       string  (optional)
 *   message            string  (optional)
 *   photo              File    (optional, single image)
 *   cv                 File    (optional, single PDF/Doc)
 *   attachments        File[]  (optional, up to 5 extra files — portfolio PDFs etc)
 *
 * Files are saved through the storage driver under
 * `careers/<applicationId>/<random>.<ext>`. The URLs are stored on the
 * JobApplication row for the admin list/detail views.
 *
 * For the public endpoint we keep the response tiny (id + ok) — no PII or
 * file URLs are echoed back.
 */
import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { maxUploadBytes } from "@/lib/storage";
import {
  CAREERS_PREFIX,
  DOC_MIME_TYPES,
  IMAGE_MIME_TYPES,
  saveRaw,
} from "@/lib/storage/raw";

export const runtime = "nodejs";

const MAX_ATTACHMENTS = 5;
const MAX_TEXT = 2000;

function getStr(form: FormData, key: string, max = 200): string | null {
  const v = form.get(key);
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t ? t.slice(0, max) : null;
}

function hashIp(ip: string, ua: string): string {
  return crypto.createHash("sha256").update(`${ip}|${ua}`).digest("hex").slice(0, 24);
}

function forwardedIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "0.0.0.0";
}

export async function POST(req: NextRequest) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "invalid_form" }, { status: 400 });
  }

  const position = getStr(form, "position", 120);
  const fullName = getStr(form, "fullName", 120);
  const email = getStr(form, "email", 200);
  if (!position) return NextResponse.json({ error: "position_required" }, { status: 400 });
  if (!fullName) return NextResponse.json({ error: "name_required" }, { status: 400 });
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "email_invalid" }, { status: 400 });
  }

  const photo = form.get("photo");
  const cv = form.get("cv");
  const extras = form.getAll("attachments");

  // Validate sizes/types upfront so we don't half-write to storage.
  const maxBytes = maxUploadBytes();
  if (photo instanceof File) {
    if (photo.size > maxBytes) return NextResponse.json({ error: "photo_too_large" }, { status: 413 });
    if (photo.size > 0 && !IMAGE_MIME_TYPES.has(photo.type)) {
      return NextResponse.json({ error: "photo_type" }, { status: 415 });
    }
  }
  if (cv instanceof File) {
    if (cv.size > maxBytes) return NextResponse.json({ error: "cv_too_large" }, { status: 413 });
    if (
      cv.size > 0 &&
      !DOC_MIME_TYPES.has(cv.type) &&
      !IMAGE_MIME_TYPES.has(cv.type)
    ) {
      return NextResponse.json({ error: "cv_type" }, { status: 415 });
    }
  }
  if (extras.length > MAX_ATTACHMENTS) {
    return NextResponse.json({ error: "too_many_attachments" }, { status: 400 });
  }
  for (const e of extras) {
    if (e instanceof File && e.size > maxBytes) {
      return NextResponse.json({ error: "attachment_too_large" }, { status: 413 });
    }
  }

  const ua = req.headers.get("user-agent") ?? "";
  const ip = forwardedIp(req);

  // Pre-allocate the application id so we can namespace the file keys with it.
  const appId = `app_${crypto.randomBytes(10).toString("hex")}`;
  const prefix = `${CAREERS_PREFIX}/${appId}`;

  type SavedRef = { key: string; url: string; name: string; mimeType: string; size: number; kind: string };
  const savedFiles: SavedRef[] = [];

  async function saveOne(file: File, kind: string) {
    if (!(file instanceof File) || file.size === 0) return;
    const buffer = Buffer.from(await file.arrayBuffer());
    const saved = await saveRaw({
      buffer,
      filename: file.name || `${kind}.bin`,
      mimeType: file.type || "application/octet-stream",
      prefix,
    });
    savedFiles.push({
      key: saved.key,
      url: saved.url,
      name: file.name || `${kind}.bin`,
      mimeType: saved.mimeType,
      size: saved.size,
      kind,
    });
  }

  try {
    if (photo instanceof File) await saveOne(photo, "photo");
    if (cv instanceof File) await saveOne(cv, "cv");
    for (const e of extras) {
      if (e instanceof File) await saveOne(e, "portfolio");
    }
  } catch (e) {
    console.error("careers: file save failed", e);
    return NextResponse.json({ error: "file_save_failed" }, { status: 500 });
  }

  const photoFile = savedFiles.find((f) => f.kind === "photo");
  const cvFile = savedFiles.find((f) => f.kind === "cv");

  try {
    await prisma.jobApplication.create({
      data: {
        id: appId,
        position,
        fullName,
        email,
        phone: getStr(form, "phone", 80),
        experience: getStr(form, "experience", 200),
        expectedSalary: getStr(form, "expectedSalary", 100),
        availableFrom: getStr(form, "availableFrom", 100),
        portfolioUrl: getStr(form, "portfolioUrl", 500),
        message: getStr(form, "message", MAX_TEXT),
        photoUrl: photoFile?.url ?? null,
        cvUrl: cvFile?.url ?? null,
        cvName: cvFile?.name ?? null,
        ipHash: hashIp(ip, ua),
        userAgent: ua.slice(0, 512) || null,
        files: {
          create: savedFiles.map((f) => ({
            key: f.key,
            name: f.name,
            mimeType: f.mimeType,
            size: f.size,
            kind: f.kind,
            url: f.url,
          })),
        },
      },
    });
  } catch (e) {
    console.error("careers: db create failed", e);
    return NextResponse.json({ error: "save_failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: appId });
}
