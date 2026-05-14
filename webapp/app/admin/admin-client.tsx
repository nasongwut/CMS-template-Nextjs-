"use client";
import { useCallback, useEffect, useState } from "react";

type Role = "ADMIN" | "USER" | "GUEST";

interface UserRow {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  isActive: boolean;
  createdAt: string;
  _count?: { files: number };
}

export default function AdminClient({ currentAdminId }: { currentAdminId: string }) {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [form, setForm] = useState({ email: "", password: "", name: "", role: "USER" as Role });
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const r = await fetch("/api/admin/users");
    if (!r.ok) {
      setError("Failed to load users");
      return;
    }
    const j = await r.json();
    setUsers(j.users ?? []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const r = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      setError(j.error ?? "Create failed");
      return;
    }
    setForm({ email: "", password: "", name: "", role: "USER" });
    await load();
  }

  async function patch(id: string, body: Partial<UserRow>) {
    const r = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (r.ok) await load();
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this user and all of their files?")) return;
    const r = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    if (r.ok) await load();
  }

  return (
    <div className="space-y-10">
      <section className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-5 bg-white dark:bg-zinc-900">
        <h2 className="font-medium">Create user</h2>
        <form
          onSubmit={onCreate}
          className="mt-4 grid sm:grid-cols-5 gap-3 items-end text-sm"
        >
          <Input label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} type="email" />
          <Input label="Password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} type="password" />
          <Input label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} type="text" required={false} />
          <label className="block">
            <span className="text-zinc-600 dark:text-zinc-400">Role</span>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
              className="mt-1 w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-2"
            >
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
              <option value="GUEST">GUEST</option>
            </select>
          </label>
          <button className="py-2 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900">
            Create
          </button>
          {error && <p className="sm:col-span-5 text-red-600">{error}</p>}
        </form>
      </section>

      <section className="rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-100 dark:bg-zinc-900 text-left">
            <tr>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2">Active</th>
              <th className="px-4 py-2">Files</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const isSelf = u.id === currentAdminId;
              return (
                <tr key={u.id} className="border-t border-zinc-200 dark:border-zinc-800">
                  <td className="px-4 py-2">{u.email} {isSelf && <span className="text-xs text-zinc-500">(you)</span>}</td>
                  <td className="px-4 py-2">{u.name ?? "—"}</td>
                  <td className="px-4 py-2">
                    <select
                      value={u.role}
                      disabled={isSelf}
                      onChange={(e) => patch(u.id, { role: e.target.value as Role })}
                      className="rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1"
                    >
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                      <option value="GUEST">GUEST</option>
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <button
                      disabled={isSelf}
                      onClick={() => patch(u.id, { isActive: !u.isActive })}
                      className={`px-2 py-1 rounded text-xs ${
                        u.isActive
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-zinc-200 dark:bg-zinc-800 text-zinc-600"
                      } disabled:opacity-50`}
                    >
                      {u.isActive ? "active" : "disabled"}
                    </button>
                  </td>
                  <td className="px-4 py-2 text-zinc-500">{u._count?.files ?? 0}</td>
                  <td className="px-4 py-2 text-right">
                    <button
                      disabled={isSelf}
                      onClick={() => onDelete(u.id)}
                      className="text-red-600 hover:underline disabled:opacity-30 disabled:no-underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type,
  required = true,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-zinc-600 dark:text-zinc-400">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-2"
      />
    </label>
  );
}
