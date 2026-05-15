"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginClient() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const r = await fetch("/api/super-admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setLoading(false);
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      setError(j.error ?? "Sign in failed");
      return;
    }
    router.push("/super-admin");
    router.refresh();
  }

  return (
    <div className="w-full max-w-sm">
      <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-zinc-500">
        Platform control plane
      </p>
      <h1
        className="mt-2 text-2xl sm:text-3xl font-semibold bg-gradient-to-r bg-clip-text text-transparent inline-block"
        style={{
          backgroundImage:
            "linear-gradient(90deg, var(--site-primary), var(--site-accent))",
        }}
      >
        Super-admin sign in
      </h1>
      <p className="text-sm text-zinc-500 mt-1">
        Restricted to platform operators. Different cookie than the regular
        app — your normal admin session won&apos;t grant access here.
      </p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <label className="block">
          <span className="text-sm text-zinc-600 dark:text-zinc-400">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2.5 text-sm"
          />
        </label>
        <label className="block">
          <span className="text-sm text-zinc-600 dark:text-zinc-400">Password</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2.5 text-sm"
          />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          disabled={loading}
          className="w-full py-2.5 rounded-md text-white font-medium disabled:opacity-50 shadow-sm"
          style={{
            background:
              "linear-gradient(90deg, var(--site-primary), var(--site-accent))",
          }}
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
