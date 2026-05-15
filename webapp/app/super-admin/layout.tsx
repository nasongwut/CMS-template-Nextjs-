import { redirect } from "next/navigation";
import Link from "next/link";
import { getPlatformAdmin, isPlatformReady } from "@/lib/platform";

export const dynamic = "force-dynamic";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Login page renders itself unauthenticated — guard everything else.
  // (We can't easily branch by path here, so the login page calls
  //  getPlatformAdmin() too and skips when already signed in.)
  const ready = isPlatformReady();
  const admin = ready ? await getPlatformAdmin() : null;

  return (
    <div className="min-h-screen">
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <Link href="/super-admin" className="flex items-center gap-2">
            <span
              className="inline-flex items-center justify-center w-7 h-7 rounded-md text-white text-xs font-bold"
              style={{
                background:
                  "linear-gradient(135deg, var(--site-primary), var(--site-accent))",
              }}
            >
              ★
            </span>
            <span className="font-semibold text-sm sm:text-base">
              Super-admin
            </span>
            <span className="hidden sm:inline text-xs font-mono text-zinc-500">
              platform control plane
            </span>
          </Link>
          {admin && (
            <div className="flex items-center gap-3 text-sm">
              <span className="text-zinc-500 max-w-[200px] truncate hidden sm:inline">
                {admin.email}
              </span>
              <SignOutForm />
            </div>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {!ready && <NotReadyBanner />}
        {children}
      </main>
    </div>
  );
}

function NotReadyBanner() {
  return (
    <div className="mb-6 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 p-4 text-sm">
      <p className="font-medium">Platform tables aren&apos;t migrated yet.</p>
      <p className="mt-1">
        Run{" "}
        <code className="font-mono bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 rounded">
          npm run prisma:migrate
        </code>
        , then{" "}
        <code className="font-mono bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 rounded">
          npm run db:seed
        </code>{" "}
        to create the first PlatformAdmin user.
      </p>
    </div>
  );
}

function SignOutForm() {
  async function signOut() {
    "use server";
    const { clearPlatformCookie } = await import("@/lib/platform");
    await clearPlatformCookie();
    redirect("/super-admin/login");
  }
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
      >
        Sign out
      </button>
    </form>
  );
}
