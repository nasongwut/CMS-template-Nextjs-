"use client";

import { useEffect, useRef, useState } from "react";

interface Position {
  id: string;
  title: string;
  team: string;
  type: string;
  location: string;
  summary: string;
}

interface FormState {
  position: string;
  fullName: string;
  email: string;
  phone: string;
  experience: string;
  expectedSalary: string;
  availableFrom: string;
  portfolioUrl: string;
  message: string;
}

const EMPTY: FormState = {
  position: "",
  fullName: "",
  email: "",
  phone: "",
  experience: "",
  expectedSalary: "",
  availableFrom: "",
  portfolioUrl: "",
  message: "",
};

const MAX_ATTACHMENTS = 5;

export default function CareersClient({ positions }: { positions: Position[] }) {
  const [v, setV] = useState<FormState>(EMPTY);
  const [photo, setPhoto] = useState<File | null>(null);
  const [cv, setCv] = useState<File | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ id: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Read ?position=... from the hash fragment (#apply?position=Art%20Director)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    const q = hash.includes("?") ? hash.slice(hash.indexOf("?") + 1) : "";
    if (!q) return;
    const params = new URLSearchParams(q);
    const pos = params.get("position");
    if (pos) {
      setV((prev) => ({ ...prev, position: pos }));
      // Scroll into view (in case the anchor scroll missed)
      setTimeout(() => {
        document.getElementById("apply")?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    }
  }, []);

  function set<K extends keyof FormState>(k: K, val: FormState[K]) {
    setV((p) => ({ ...p, [k]: val }));
  }

  function onAttachmentsPicked(files: FileList | null) {
    if (!files) return;
    const next = [...attachments];
    for (const f of Array.from(files)) {
      if (next.length >= MAX_ATTACHMENTS) break;
      next.push(f);
    }
    setAttachments(next);
  }

  function removeAttachment(i: number) {
    setAttachments((arr) => arr.filter((_, j) => j !== i));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!v.position) return setError("กรุณาเลือกตำแหน่งที่สนใจ");
    if (!v.fullName.trim()) return setError("กรุณากรอกชื่อ-นามสกุล");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) {
      return setError("กรุณากรอกอีเมลให้ถูกต้อง");
    }

    const fd = new FormData();
    Object.entries(v).forEach(([k, val]) => {
      if (val) fd.append(k, val);
    });
    if (photo) fd.append("photo", photo);
    if (cv) fd.append("cv", cv);
    attachments.forEach((f) => fd.append("attachments", f));

    setSubmitting(true);
    try {
      const r = await fetch("/api/careers/submit", { method: "POST", body: fd });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        const map: Record<string, string> = {
          position_required: "กรุณาเลือกตำแหน่ง",
          name_required: "กรุณากรอกชื่อ",
          email_invalid: "อีเมลไม่ถูกต้อง",
          photo_too_large: "รูปภาพมีขนาดใหญ่เกินไป",
          cv_too_large: "ไฟล์ CV ใหญ่เกินไป",
          attachment_too_large: "ไฟล์แนบใหญ่เกินไป",
          too_many_attachments: `ไฟล์แนบได้สูงสุด ${MAX_ATTACHMENTS} ไฟล์`,
          photo_type: "รูปต้องเป็น JPG / PNG / WebP",
          cv_type: "CV ต้องเป็น PDF / Word / รูป",
          file_save_failed: "บันทึกไฟล์ล้มเหลว ลองใหม่อีกครั้ง",
          save_failed: "บันทึกใบสมัครไม่สำเร็จ",
        };
        setError(map[j.error] ?? j.error ?? "ส่งใบสมัครไม่สำเร็จ");
        return;
      }
      setSuccess({ id: j.id });
      setV(EMPTY);
      setPhoto(null);
      setCv(null);
      setAttachments([]);
      formRef.current?.reset();
      // smooth scroll back up to the success banner
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ ลองใหม่อีกครั้ง");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 p-6 sm:p-8 text-center">
        <div className="text-3xl">✓</div>
        <h3 className="mt-2 text-lg sm:text-xl font-semibold text-emerald-900 dark:text-emerald-100">
          ส่งใบสมัครเรียบร้อย
        </h3>
        <p className="mt-2 text-sm text-emerald-800 dark:text-emerald-300">
          เลขที่ใบสมัคร <code className="font-mono">{success.id}</code> —
          ทีมงานจะติดต่อกลับภายใน 7 วันทำการ
        </p>
        <button
          onClick={() => setSuccess(null)}
          className="mt-5 text-sm underline text-emerald-700 dark:text-emerald-300"
        >
          ส่งใบสมัครอีกครั้ง
        </button>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-7 space-y-5"
    >
      {/* Position */}
      <Field label="ตำแหน่งที่สนใจ" required>
        <select
          value={v.position}
          onChange={(e) => set("position", e.target.value)}
          required
          className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm"
        >
          <option value="">— เลือกตำแหน่ง —</option>
          {positions.map((p) => (
            <option key={p.id} value={p.title}>
              {p.title} ({p.team})
            </option>
          ))}
          <option value="Other">อื่น ๆ / Walk-in</option>
        </select>
      </Field>

      {/* Name + email */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="ชื่อ-นามสกุล" required>
          <Input value={v.fullName} onChange={(s) => set("fullName", s)} required />
        </Field>
        <Field label="อีเมล" required>
          <Input
            type="email"
            value={v.email}
            onChange={(s) => set("email", s)}
            required
          />
        </Field>
      </div>

      {/* Phone + experience */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="เบอร์โทรศัพท์">
          <Input value={v.phone} onChange={(s) => set("phone", s)} type="tel" />
        </Field>
        <Field label="ประสบการณ์">
          <Input
            value={v.experience}
            onChange={(s) => set("experience", s)}
            placeholder="เช่น 3 ปี / Fresh graduate"
          />
        </Field>
      </div>

      {/* Salary + available */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="เงินเดือนที่คาดหวัง">
          <Input
            value={v.expectedSalary}
            onChange={(s) => set("expectedSalary", s)}
            placeholder="เช่น 25,000 บาท / Negotiable"
          />
        </Field>
        <Field label="พร้อมเริ่มงาน">
          <Input
            value={v.availableFrom}
            onChange={(s) => set("availableFrom", s)}
            placeholder="เช่น ทันที / 1 ส.ค. 2026"
          />
        </Field>
      </div>

      {/* Portfolio URL */}
      <Field
        label="ลิงก์ Portfolio / LinkedIn / Behance"
        hint="วาง URL หลายลิงก์คั่นด้วย ,"
      >
        <Input
          value={v.portfolioUrl}
          onChange={(s) => set("portfolioUrl", s)}
          placeholder="https://…"
        />
      </Field>

      {/* Photo + CV */}
      <div className="grid sm:grid-cols-2 gap-4">
        <FileField
          label="รูปถ่าย (ไม่บังคับ)"
          accept="image/*"
          file={photo}
          onChange={setPhoto}
          previewKind="image"
        />
        <FileField
          label="CV / Resume (PDF / Word)"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          file={cv}
          onChange={setCv}
          previewKind="doc"
        />
      </div>

      {/* Multiple attachments */}
      <div>
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-medium">
            ไฟล์แนบเพิ่มเติม (Portfolio PDF, ผลงาน ฯลฯ)
          </span>
          <span className="text-xs text-zinc-500">
            {attachments.length}/{MAX_ATTACHMENTS}
          </span>
        </div>
        <p className="text-xs text-zinc-500 mt-0.5">
          เลือกได้สูงสุด {MAX_ATTACHMENTS} ไฟล์
        </p>
        <label className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-dashed border-zinc-300 dark:border-zinc-700 text-sm cursor-pointer hover:border-zinc-400">
          <span>+ เพิ่มไฟล์</span>
          <input
            type="file"
            multiple
            className="hidden"
            onChange={(e) => onAttachmentsPicked(e.target.files)}
          />
        </label>
        {attachments.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {attachments.map((f, i) => (
              <li
                key={i}
                className="flex items-center justify-between text-sm rounded-md border border-zinc-200 dark:border-zinc-800 px-3 py-2"
              >
                <span className="truncate flex-1 min-w-0">{f.name}</span>
                <span className="text-xs text-zinc-500 ml-3 whitespace-nowrap">
                  {fmtSize(f.size)}
                </span>
                <button
                  type="button"
                  onClick={() => removeAttachment(i)}
                  className="ml-3 text-red-600 text-xs hover:underline"
                >
                  remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Message */}
      <Field label="ข้อความเพิ่มเติม (ไม่บังคับ)">
        <textarea
          value={v.message}
          onChange={(e) => set("message", e.target.value)}
          rows={5}
          maxLength={2000}
          placeholder="แนะนำตัว / เหตุผลที่อยากร่วมงาน"
          className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm leading-6"
        />
        <p className="text-xs text-zinc-500 mt-0.5">
          {v.message.length}/2000
        </p>
      </Field>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between flex-wrap gap-3 pt-1">
        <p className="text-xs text-zinc-500">
          ข้อมูลของคุณจะถูกเก็บไว้สำหรับใช้ในกระบวนการสรรหาเท่านั้น
        </p>
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2.5 rounded-md text-white text-sm font-medium shadow-sm disabled:opacity-60"
          style={{
            background:
              "linear-gradient(90deg, var(--site-primary), var(--site-accent))",
          }}
        >
          {submitting ? "กำลังส่ง…" : "ส่งใบสมัคร"}
        </button>
      </div>
    </form>
  );
}

/* ───── small reusable bits ───── */

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      {hint && <p className="text-xs text-zinc-500 mt-0.5">{hint}</p>}
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function Input({
  value,
  onChange,
  type = "text",
  required,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      required={required}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm"
    />
  );
}

function FileField({
  label,
  accept,
  file,
  onChange,
  previewKind,
}: {
  label: string;
  accept: string;
  file: File | null;
  onChange: (f: File | null) => void;
  previewKind: "image" | "doc";
}) {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!file || previewKind !== "image") {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file, previewKind]);

  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <div className="mt-1.5 flex items-center gap-3">
        <div className="w-20 h-20 rounded-md border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 grid place-items-center overflow-hidden shrink-0">
          {previewKind === "image" && preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="preview" className="w-full h-full object-cover" />
          ) : file ? (
            <span className="text-[11px] font-mono uppercase text-zinc-500 text-center px-2 leading-tight break-all">
              {file.name.split(".").pop()}
            </span>
          ) : (
            <span className="text-xs text-zinc-400">none</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          {file ? (
            <div className="text-xs">
              <div className="truncate">{file.name}</div>
              <div className="text-zinc-500">{fmtSize(file.size)}</div>
              <button
                type="button"
                onClick={() => onChange(null)}
                className="mt-1 text-red-600 hover:underline"
              >
                remove
              </button>
            </div>
          ) : (
            <label className="inline-flex items-center gap-1 text-sm cursor-pointer rounded-md border border-dashed border-zinc-300 dark:border-zinc-700 px-3 py-1.5 hover:border-zinc-400">
              <span>เลือกไฟล์</span>
              <input
                type="file"
                accept={accept}
                className="hidden"
                onChange={(e) => onChange(e.target.files?.[0] ?? null)}
              />
            </label>
          )}
        </div>
      </div>
    </label>
  );
}

function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
