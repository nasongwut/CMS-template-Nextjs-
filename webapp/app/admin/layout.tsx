import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import AdminTabs from "./_components/admin-tabs";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/files");

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <header className="mb-5 sm:mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-zinc-500">
            Admin console
          </p>
          <h1
            className="text-2xl sm:text-3xl font-semibold tracking-tight mt-1 bg-gradient-to-r bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(90deg, var(--site-primary), var(--site-accent))",
            }}
          >
            Admin
          </h1>
        </div>
        <Link
          href="/files"
          className="text-xs sm:text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          ← back to app
        </Link>
      </header>
      <AdminTabs />
      <div className="mt-5 sm:mt-6">{children}</div>
    </div>
  );
}
