"use client";
import { useCallback, useEffect, useMemo, useState } from "react";

type Role = "ADMIN" | "USER" | "GUEST";

interface FileRow {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  driver: string;
  url: string | null;
  createdAt: string;
  owner?: { id: string; email: string; name: string | null };
  folder?: { id: string; name: string } | null;
}

interface FolderRow {
  id: string;
  name: string;
  createdAt: string;
  _count?: { files: number };
}

type SortKey = "name" | "size" | "driver" | "createdAt";
type SortDir = "asc" | "desc";

/** ROOT_KEY is the sentinel for "no folder" in the UI. */
const ROOT_KEY = "root";

export default function FilesClient({ role }: { role: Role }) {
  const [files, setFiles] = useState<FileRow[]>([]);
  const [folders, setFolders] = useState<FolderRow[]>([]);
  const [activeFolder, setActiveFolder] = useState<string>(ROOT_KEY);
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const loadAll = useCallback(async () => {
    const [fr, dr] = await Promise.all([
      fetch("/api/files").then((r) => r.json()),
      fetch("/api/folders").then((r) => r.json()),
    ]);
    setFiles(fr.files ?? []);
    setFolders(dr.folders ?? []);
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Files visible in the current folder view
  const visibleFiles = useMemo(() => {
    let rows = files;
    if (activeFolder === ROOT_KEY) {
      rows = rows.filter((f) => !f.folder);
    } else {
      rows = rows.filter((f) => f.folder?.id === activeFolder);
    }
    const sorted = [...rows].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") cmp = a.name.localeCompare(b.name);
      else if (sortKey === "size") cmp = a.size - b.size;
      else if (sortKey === "driver") cmp = a.driver.localeCompare(b.driver);
      else if (sortKey === "createdAt")
        cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return sortDir === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [files, activeFolder, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "createdAt" || key === "size" ? "desc" : "asc");
    }
  }

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError(null);
    const fd = new FormData();
    fd.append("file", file);
    if (activeFolder !== ROOT_KEY) fd.append("folderId", activeFolder);
    const r = await fetch("/api/files", { method: "POST", body: fd });
    setBusy(false);
    e.target.value = "";
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      setError(j.error ?? "Upload failed");
      return;
    }
    await loadAll();
  }

  async function onDeleteFile(id: string) {
    if (!confirm("Delete this file?")) return;
    const r = await fetch(`/api/files/${id}`, { method: "DELETE" });
    if (r.ok) await loadAll();
  }

  async function onCreateFolder(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const name = newFolderName.trim();
    if (!name) return;
    const r = await fetch("/api/folders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      setError(j.error ?? "Could not create folder");
      return;
    }
    const j = await r.json();
    setNewFolderName("");
    setCreatingFolder(false);
    await loadAll();
    setActiveFolder(j.folder.id);
  }

  async function onDeleteActiveFolder() {
    if (activeFolder === ROOT_KEY) return;
    const folder = folders.find((f) => f.id === activeFolder);
    if (!folder) return;
    const filesInside = folder._count?.files ?? 0;
    const msg =
      filesInside > 0
        ? `Delete folder "${folder.name}" and all ${filesInside} file(s) inside?`
        : `Delete folder "${folder.name}"?`;
    if (!confirm(msg)) return;
    const r = await fetch(`/api/folders/${folder.id}`, { method: "DELETE" });
    if (r.ok) {
      setActiveFolder(ROOT_KEY);
      await loadAll();
    } else {
      const j = await r.json().catch(() => ({}));
      setError(j.error ?? "Delete failed");
    }
  }

  const activeFolderObj =
    activeFolder !== ROOT_KEY ? folders.find((f) => f.id === activeFolder) : null;

  const rootCount = files.filter((f) => !f.folder).length;

  return (
    <div className="grid lg:grid-cols-[240px_1fr] gap-4 sm:gap-6">
      {/* Sidebar (desktop) — collapses to chip-bar on mobile */}
      <aside className="hidden lg:block space-y-3">
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70">
          <SidebarItem
            label="All files"
            count={rootCount}
            active={activeFolder === ROOT_KEY}
            onClick={() => setActiveFolder(ROOT_KEY)}
            icon={<IconHome />}
          />
          <div className="border-t border-zinc-200 dark:border-zinc-800 px-3 py-2 text-[11px] uppercase tracking-wider text-zinc-500 flex items-center justify-between">
            <span>Folders</span>
            <button
              onClick={() => setCreatingFolder((v) => !v)}
              className="text-xs text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
              title="New folder"
            >
              + new
            </button>
          </div>
          {creatingFolder && (
            <form onSubmit={onCreateFolder} className="px-3 pb-2 flex gap-1">
              <input
                autoFocus
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder name"
                className="flex-1 text-sm rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1"
              />
              <button
                type="submit"
                className="text-sm px-2 py-1 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
              >
                ✓
              </button>
            </form>
          )}
          <nav className="pb-1">
            {folders.length === 0 && !creatingFolder && (
              <p className="px-3 py-3 text-xs text-zinc-500">No folders yet.</p>
            )}
            {folders.map((f) => (
              <SidebarItem
                key={f.id}
                label={f.name}
                count={f._count?.files ?? 0}
                active={activeFolder === f.id}
                onClick={() => setActiveFolder(f.id)}
                icon={<IconFolder />}
              />
            ))}
          </nav>
        </div>
      </aside>

      {/* Mobile folder chip bar */}
      <div className="lg:hidden -mx-4 sm:mx-0 overflow-x-auto">
        <div className="px-4 sm:px-0 flex items-center gap-2 min-w-max pb-2">
          <Chip
            active={activeFolder === ROOT_KEY}
            onClick={() => setActiveFolder(ROOT_KEY)}
            count={rootCount}
            label="All files"
          />
          {folders.map((f) => (
            <Chip
              key={f.id}
              active={activeFolder === f.id}
              onClick={() => setActiveFolder(f.id)}
              count={f._count?.files ?? 0}
              label={f.name}
            />
          ))}
          <button
            onClick={() => setCreatingFolder((v) => !v)}
            className="px-3 py-1.5 rounded-full border border-dashed border-zinc-300 dark:border-zinc-700 text-xs text-zinc-600 dark:text-zinc-400"
          >
            + new
          </button>
        </div>
        {creatingFolder && (
          <form onSubmit={onCreateFolder} className="px-4 sm:px-0 pb-2 flex gap-1">
            <input
              autoFocus
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              className="flex-1 text-sm rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1.5"
            />
            <button
              type="submit"
              className="text-sm px-3 py-1.5 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
            >
              Create
            </button>
          </form>
        )}
      </div>

      {/* Main */}
      <div>
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <h2 className="text-lg font-medium">
            {activeFolderObj ? activeFolderObj.name : "All files"}
            <span className="ml-2 text-sm text-zinc-500">
              {visibleFiles.length} item{visibleFiles.length === 1 ? "" : "s"}
            </span>
          </h2>
          <div className="ml-auto flex items-center gap-2">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <span
                className={`px-3 py-2 rounded-md text-sm ${
                  busy
                    ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-500"
                    : "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                }`}
              >
                {busy ? "Uploading…" : "Upload file"}
              </span>
              <input type="file" className="hidden" onChange={onUpload} disabled={busy} />
            </label>
            {activeFolderObj && (
              <button
                onClick={onDeleteActiveFolder}
                className="px-3 py-2 rounded-md text-sm border border-red-300 dark:border-red-900 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
              >
                Delete folder
              </button>
            )}
          </div>
        </div>

        {error && (
          <p className="mb-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-md px-3 py-2">
            {error}
          </p>
        )}

        {/* Table */}
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white/70 dark:bg-zinc-900/70">
          <table className="w-full text-sm">
            <thead className="bg-zinc-100 dark:bg-zinc-900">
              <tr className="text-left">
                <Th label="Name" k="name" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} />
                <Th label="Size" k="size" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} align="right" />
                <Th label="Driver" k="driver" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} />
                <Th label="Uploaded" k="createdAt" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} />
                {role === "ADMIN" && <th className="px-4 py-2 font-medium text-zinc-500">Owner</th>}
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {visibleFiles.length === 0 && (
                <tr>
                  <td
                    colSpan={role === "ADMIN" ? 6 : 5}
                    className="px-4 py-10 text-center text-zinc-500"
                  >
                    {activeFolderObj
                      ? `No files in "${activeFolderObj.name}" yet.`
                      : "No files yet — upload one to get started."}
                  </td>
                </tr>
              )}
              {visibleFiles.map((f) => (
                <tr
                  key={f.id}
                  className="border-t border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40"
                >
                  <td className="px-4 py-2">
                    <a
                      className="underline decoration-zinc-300 hover:decoration-zinc-900 dark:decoration-zinc-600 dark:hover:decoration-zinc-100"
                      href={`/api/files/${f.id}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {f.name}
                    </a>
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums text-zinc-600 dark:text-zinc-400">
                    {formatSize(f.size)}
                  </td>
                  <td className="px-4 py-2">
                    <span className="text-xs px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 font-mono">
                      {f.driver}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">
                    {new Date(f.createdAt).toLocaleString()}
                  </td>
                  {role === "ADMIN" && (
                    <td className="px-4 py-2 text-zinc-500 truncate max-w-[180px]">
                      {f.owner?.email ?? "—"}
                    </td>
                  )}
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() => onDeleteFile(f.id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─────────── helpers ─────────── */

function Th({
  label,
  k,
  sortKey,
  sortDir,
  onClick,
  align = "left",
}: {
  label: string;
  k: SortKey;
  sortKey: SortKey;
  sortDir: SortDir;
  onClick: (k: SortKey) => void;
  align?: "left" | "right";
}) {
  const active = sortKey === k;
  return (
    <th
      className={`px-4 py-2 font-medium text-zinc-500 cursor-pointer select-none ${
        align === "right" ? "text-right" : "text-left"
      }`}
      onClick={() => onClick(k)}
    >
      <span
        className={`inline-flex items-center gap-1 ${
          active ? "text-zinc-900 dark:text-zinc-100" : ""
        }`}
      >
        {label}
        <span className="text-[10px] w-3 inline-block">
          {active ? (sortDir === "asc" ? "▲" : "▼") : ""}
        </span>
      </span>
    </th>
  );
}

function SidebarItem({
  label,
  count,
  active,
  onClick,
  icon,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left ${
        active
          ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
          : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
      }`}
    >
      <span className="text-zinc-500">{icon}</span>
      <span className="flex-1 truncate">{label}</span>
      <span className="text-xs text-zinc-500 tabular-nums">{count}</span>
    </button>
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  return `${(mb / 1024).toFixed(2)} GB`;
}

function Chip({
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
      className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap flex items-center gap-1.5 ${
        active
          ? "text-white shadow-sm"
          : "border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
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
      <span>{label}</span>
      <span className={`text-[10px] tabular-nums ${active ? "opacity-80" : "text-zinc-500"}`}>
        {count}
      </span>
    </button>
  );
}

function IconHome() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 11l9-7 9 7v9a2 2 0 01-2 2h-4v-6h-6v6H5a2 2 0 01-2-2v-9z" strokeLinejoin="round" />
    </svg>
  );
}
function IconFolder() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" strokeLinejoin="round" />
    </svg>
  );
}
