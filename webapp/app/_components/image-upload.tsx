"use client";
import { useRef, useState } from "react";

/**
 * Drop-in image upload field used by /admin/about editors.
 * Posts to /api/admin/upload (multipart) and writes the returned URL back
 * through `onChange`. Also shows a live preview and accepts a manual URL
 * for cases where the admin wants to paste a hosted image.
 */
export default function ImageUpload({
  value,
  onChange,
  prefix = "about",
  label = "Image",
  hint,
  aspect = "square",
}: {
  value: string;
  onChange: (url: string) => void;
  /** Sub-folder under `public/` for the uploaded image. */
  prefix?: string;
  label?: string;
  hint?: string;
  /** "square" 1:1 thumb, "wide" 16:9 thumb. */
  aspect?: "square" | "wide";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file");
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("prefix", prefix);
      const r = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        setError(j.error ?? "Upload failed");
        return;
      }
      onChange(j.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const previewClass =
    aspect === "wide"
      ? "aspect-[16/9] w-full max-w-[280px]"
      : "w-24 h-24 sm:w-28 sm:h-28";

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium">{label}</span>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-xs text-red-600 hover:underline"
          >
            Remove
          </button>
        )}
      </div>
      {hint && <p className="text-xs text-zinc-500 mt-0.5">{hint}</p>}

      <div className="mt-1.5 flex flex-col sm:flex-row items-start gap-3">
        <label
          className={`${previewClass} shrink-0 rounded-md border border-dashed border-zinc-300 dark:border-zinc-700 overflow-hidden bg-zinc-50 dark:bg-zinc-900 grid place-items-center cursor-pointer hover:border-violet-400 transition`}
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt="preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.opacity = "0.3";
              }}
            />
          ) : uploading ? (
            <span className="text-xs text-zinc-500">Uploading…</span>
          ) : (
            <span className="text-xs text-zinc-400 text-center px-2 leading-tight">
              click to
              <br />
              upload
            </span>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>

        <div className="flex-1 min-w-0 w-full">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="…or paste an image URL"
            maxLength={1024}
            className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm"
          />
          {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
          {uploading && !error && (
            <p className="mt-1 text-xs text-zinc-500">Uploading image…</p>
          )}
        </div>
      </div>
    </div>
  );
}
