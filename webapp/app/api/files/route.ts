import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, AuthError } from "@/lib/auth";
import { getStorage, maxUploadBytes } from "@/lib/storage";

export const runtime = "nodejs";

/**
 * GET /api/files
 *   ?folderId=<id>  → only files in that folder (must be owned by caller, or admin)
 *   ?folderId=root  → only files at the root (no folder)
 *   (omitted)       → all files visible to caller
 */
export async function GET(req: NextRequest) {
  try {
    const me = await requireUser();
    const folderParam = new URL(req.url).searchParams.get("folderId");

    const where: {
      ownerId?: string;
      folderId?: string | null;
    } = me.role === "ADMIN" ? {} : { ownerId: me.id };

    if (folderParam === "root") {
      where.folderId = null;
    } else if (folderParam) {
      where.folderId = folderParam;
    }

    const files = await prisma.file.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        owner: { select: { id: true, email: true, name: true } },
        folder: { select: { id: true, name: true } },
      },
    });
    return NextResponse.json({ files });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.code }, { status: e.status });
    }
    throw e;
  }
}

/** POST /api/files — upload (multipart/form-data with field "file", optional "folderId") */
export async function POST(req: NextRequest) {
  try {
    const me = await requireUser();

    const form = await req.formData();
    const file = form.get("file");
    const folderId = form.get("folderId");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "file_field_missing" }, { status: 400 });
    }
    if (file.size > maxUploadBytes()) {
      return NextResponse.json({ error: "file_too_large" }, { status: 413 });
    }

    // Validate folder ownership if specified
    let resolvedFolderId: string | null = null;
    if (typeof folderId === "string" && folderId && folderId !== "root") {
      const folder = await prisma.folder.findUnique({ where: { id: folderId } });
      if (!folder) {
        return NextResponse.json({ error: "folder_not_found" }, { status: 404 });
      }
      if (me.role !== "ADMIN" && folder.ownerId !== me.id) {
        return NextResponse.json({ error: "folder_forbidden" }, { status: 403 });
      }
      resolvedFolderId = folder.id;
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const storage = getStorage();
    const saved = await storage.save({
      buffer,
      filename: file.name || "upload.bin",
      mimeType: file.type || "application/octet-stream",
      ownerId: me.id,
    });

    const record = await prisma.file.create({
      data: {
        key: saved.key,
        name: file.name || "upload.bin",
        mimeType: file.type || "application/octet-stream",
        size: saved.size,
        driver: saved.driver,
        url: saved.url,
        ownerId: me.id,
        folderId: resolvedFolderId,
      },
      include: { folder: { select: { id: true, name: true } } },
    });

    return NextResponse.json({ file: record });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.code }, { status: e.status });
    }
    console.error(e);
    return NextResponse.json({ error: "upload_failed" }, { status: 500 });
  }
}
