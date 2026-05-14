"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setLoading(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Login failed");
      return;
    }
    router.push("/files");
    router.refresh();
  }

  return (
    <div className="min-h-[calc(100vh-180px)] flex items-center justify-center px-4 sm:px-6 py-10">
      <div className="w-full max-w-sm">
        <h1
          className="text-2xl sm:text-3xl font-semibold bg-gradient-to-r bg-clip-text text-transparent inline-block"
          style={{
            backgroundImage:
              "linear-gradient(90deg, var(--site-primary), var(--site-accent))",
          }}
        >
          Welcome back
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Sign in to your account to continue.
        </p>
        <form onSubmit={onSubmit} className="mt-6 sm:mt-8 space-y-4">
          <Field label="Email" value={email} type="email" onChange={setEmail} />
          <Field label="Password" value={password} type="password" onChange={setPassword} />
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
        <p className="text-sm text-zinc-500 mt-6 text-center">
          No account?{" "}
          <Link href="/register" className="underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  type,
  onChange,
}: {
  label: string;
  value: string;
  type: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm text-zinc-600 dark:text-zinc-400">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className="mt-1 w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2.5 text-base sm:text-sm"
      />
    </label>
  );
}
