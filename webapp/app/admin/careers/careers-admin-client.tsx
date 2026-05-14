"use client";
import { useMemo, useState } from "react";
import {
  ALLOWED_STATUSES,
  STATUS_LABELS,
  type ApplicationStatus,
} from "@/lib/careers";

interface ApplicationRow {
  id: string;
  position: string;
  fullName: string;
  email: string;
  phone: string | null;
  experience: string | null;
  expectedSalary: string | null;
  availableFrom: string | null;
  portfolioUrl: string | null;
  message: string | null;
  photoUrl: string | null;
  cvUrl: string | null;
  cvName: string | null;
  status: string;
  createdAt: string;
  fileCount: number;
}

interface FileRow {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  kind: string;
  url: string | null;
  createdAt: string;
}

type Filter = "ALL" | ApplicationStatus;

export default function CareersAdminClient({
  initialApplications,
  initialCounts,
}: {
  initialApplications: ApplicationRow[];
  initialCounts: Record<string, number>;
}) {
  const [items, setItems] = useState(initialApplications);
  const [counts, setCounts] = useState(initialCounts);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [openId, setOpenId] = useState<string | null>(null);
  const [detailFiles, setDetailFiles] = useState<FileRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (filter === "ALL") return items;
    return items.filter((a) => a.status === filter);
  }, [items, filter]);

  const open = items.find((a) => a.id === openId) ?? null;

  async function reload() {
    const r = await fetch("/api/admin/careers");
    if (!r.ok) return;
    const j = await r.json();
    setItems(j.applications);
    setCounts(j.counts);
  }

  async function loadDetail(id: string) {
    setOpenId(id);
    setDetailFiles([]);
    const r = await fetch(`/api/admin/careers/${id}`);
    if (!r.ok) return;
    const j = await r.json();
    setDetailFiles(j.application.files ?? []);
  }

  async function setStatus(id: string, status: ApplicationStatus) {
    setError(null);
    const r = await fetch(`/api/admin/careers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      setError(j.error ?? "update failed");
      return;
    }
    await reload();
  }

  async function deleteApp(id: string) {
    if (!confirm("ลบใบสมัครและไฟล์ทั้งหมด?")) return;
    const r = await fetch(`/api/admin/careers/${id}`, { method: "DELETE" });
    if (!r.ok) {
      setError("delete failed");
      return;
    }
    if (openId === id) setOpenId(null);
    await reload();
  }

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        <FilterTab
          active={filter === "ALL"}
          onClick={() => setFilter("ALL")}
          label="All"
          count={items.length}
        />
        {ALLOWED_STATUSES.map((s) => (
          <FilterTab
            key={s}
            active={filter === s}
            onClick={() => setFilter(s)}
            label={STATUS_LABELS[s].label}
            count={counts[s] ?? 0}
          />
        ))}
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 p-8 text-center text-zinc-500 text-sm">
          ยังไม่มีใบสมัครในกลุ่มนี้
        </div>
      ) : (
        <ul className="space-y-2">
          {filtered.map((a) => {
            const isOpen = openId === a.id;
            const tone = STATUS_LABELS[a.status as ApplicationStatus]?.tone ?? "";
            return (
              <li key={a.id}>
                <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/40 overflow-hidden">
                  <div className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                    {a.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={a.photoUrl}
                        alt={a.fullName}
                        className="w-12 h-12 rounded-full object-cover shrink-0 border border-zinc-200 dark:border-zinc-800"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full shrink-0 grid place-items-center text-sm font-semibold text-white"
                        style={{
                          background:
                            "linear-gradient(135deg, var(--site-primary), var(--site-accent))",
                        }}
                      >
                        {a.fullName
                          .split(/\s+/)
                          .slice(0, 2)
                          .map((w) => w[0]?.toUpperCase())
                          .join("")}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium truncate">{a.fullName}</h3>
                        <span
                          className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded ${tone}`}
                        >
                          {STATUS_LABELS[a.status as ApplicationStatus]?.label ??
                            a.status}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-500 truncate">
                        {a.position} · {a.email}
                      </p>
                    </div>
                    <div className="text-xs text-zinc-500 sm:text-right shrink-0">
                      <div>{new Date(a.createdAt).toLocaleString()}</div>
                      <div>
                        {a.fileCount} ไฟล์
                        {a.cvUrl && " · CV ✓"}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => (isOpen ? setOpenId(null) : loadDetail(a.id))}
                        className="px-2 py-1 text-xs rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      >
                        {isOpen ? "ปิด" : "ดูรายละเอียด"}
                      </button>
                      <button
                        onClick={() => deleteApp(a.id)}
                        className="px-2 py-1 text-xs text-red-600 rounded hover:bg-red-50 dark:hover:bg-red-950/30"
                      >
                        ลบ
                      </button>
                    </div>
                  </div>

                  {isOpen && open && open.id === a.id && (
                    <Detail
                      application={open}
                      files={detailFiles}
                      onStatusChange={(s) => setStatus(open.id, s)}
                    />
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function FilterTab({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs sm:text-sm border transition ${
        active
          ? "border-transparent text-white shadow-sm"
          : "border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700"
      }`}
      style={
        active
          ? {
              background:
                "linear-gradient(90deg, var(--site-primary), var(--site-accent))",
            }
          : undefined
      }
    >
      {label}{" "}
      <span className={active ? "opacity-80" : "text-zinc-400"}>({count})</span>
    </button>
  );
}

function Detail({
  application,
  files,
  onStatusChange,
}: {
  application: ApplicationRow;
  files: FileRow[];
  onStatusChange: (s: ApplicationStatus) => void;
}) {
  return (
    <div className="border-t border-zinc-200 dark:border-zinc-800 p-4 sm:p-5 grid sm:grid-cols-2 gap-5 bg-zinc-50/50 dark:bg-zinc-950/20">
      <div>
        <dl className="text-sm space-y-2">
          <Row k="Phone" v={application.phone} />
          <Row k="Experience" v={application.experience} />
          <Row k="Expected salary" v={application.expectedSalary} />
          <Row k="Available from" v={application.availableFrom} />
          <Row
            k="Portfolio"
            v={
              application.portfolioUrl ? (
                <a
                  href={application.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-600 dark:text-violet-400 hover:underline break-all"
                >
                  {application.portfolioUrl}
                </a>
              ) : null
            }
          />
        </dl>

        {application.message && (
          <div className="mt-4">
            <div className="text-xs font-mono uppercase tracking-wider text-zinc-500">
              Message
            </div>
            <p className="mt-1 text-sm whitespace-pre-wrap leading-relaxed">
              {application.message}
            </p>
          </div>
        )}

        <div className="mt-5">
          <label className="text-xs font-mono uppercase tracking-wider text-zinc-500">
            Status
          </label>
          <select
            value={application.status}
            onChange={(e) => onStatusChange(e.target.value as ApplicationStatus)}
            className="mt-1 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-sm"
          >
            {ALLOWED_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s].label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <div className="text-xs font-mono uppercase tracking-wider text-zinc-500">
          Files ({files.length})
        </div>
        {files.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500">ไม่มีไฟล์แนบ</p>
        ) : (
          <ul className="mt-2 space-y-1.5">
            {files.map((f) => (
              <li
                key={f.id}
                className="flex items-center gap-2 text-sm rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2"
              >
                <span
                  className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 shrink-0"
                >
                  {f.kind}
                </span>
                <span className="truncate flex-1 min-w-0">{f.name}</span>
                <span className="text-xs text-zinc-500 ml-2 whitespace-nowrap">
                  {fmtSize(f.size)}
                </span>
                <a
                  href={`/api/admin/careers/files/${f.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-600 dark:text-violet-400 text-xs ml-2 hover:underline shrink-0"
                >
                  ดู
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode | null }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-3 items-baseline">
      <dt className="text-zinc-500 text-xs uppercase tracking-wider font-mono">
        {k}
      </dt>
      <dd className="break-words">{v || <span className="text-zinc-400">—</span>}</dd>
    </div>
  );
}

function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
