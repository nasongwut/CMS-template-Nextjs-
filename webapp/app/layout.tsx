import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getCurrentUser } from "@/lib/auth";
import { getSettings, parseKeywords } from "@/lib/settings";
import { getTheme, themeStyleTag } from "@/lib/theme";
import LogoutButton from "./_components/logout-button";
import PageTracker from "./_components/page-tracker";
import MobileNav from "./_components/mobile-nav";
import { getNavLinks } from "@/lib/nav";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const keywords = parseKeywords(s.keywords);
  return {
    title: { default: s.siteName, template: `%s · ${s.siteName}` },
    description: s.description,
    keywords: keywords.length > 0 ? keywords : undefined,
    authors: s.author ? [{ name: s.author }] : undefined,
    applicationName: s.siteName,
    openGraph: {
      title: s.siteName,
      description: s.description,
      siteName: s.siteName,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [user, settings, theme] = await Promise.all([
    getCurrentUser(),
    getSettings(),
    getTheme(),
  ]);

  // Dynamic nav loaded from the NavItem table (with sensible defaults when empty).
  const dbLinks = await getNavLinks({
    isAuthed: !!user,
    isAdmin: user?.role === "ADMIN",
  });

  // The "Admin" link is always appended for ADMIN users, regardless of nav config.
  const navLinks: { href: string; label: string; accent?: boolean; external?: boolean; openInNew?: boolean }[] = [
    ...dbLinks.map((l) => ({
      href: l.href,
      label: l.label,
      external: l.external,
      openInNew: l.openInNew,
    })),
    ...(user?.role === "ADMIN"
      ? [{ href: "/admin", label: "Admin", accent: true }]
      : []),
  ];

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Inject theme as CSS variables — read by components via var(--site-*) */}
        <style dangerouslySetInnerHTML={{ __html: themeStyleTag(theme) }} />
      </head>
      <body className="min-h-full flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
        <PageTracker />
        <header className="sticky top-0 z-40 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 supports-[backdrop-filter]:dark:bg-zinc-900/60">
          <nav className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-4 sm:gap-6 text-sm">
            <Link href="/" className="font-semibold truncate max-w-[50vw] sm:max-w-none">
              <span
                className="bg-gradient-to-r bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(90deg, var(--site-primary), var(--site-accent))",
                }}
              >
                {settings.siteName}
              </span>
            </Link>

            {/* desktop links */}
            <div className="hidden md:flex items-center gap-4 flex-1">
              {navLinks.map((l, i) => (
                <Link
                  key={`${l.href}-${i}`}
                  href={l.href}
                  target={l.openInNew || l.external ? "_blank" : undefined}
                  rel={l.external ? "noopener noreferrer" : undefined}
                  className={`hover:underline ${
                    l.accent
                      ? "text-amber-600 dark:text-amber-400 font-medium"
                      : l.href === "/docs"
                        ? "text-zinc-500 dark:text-zinc-400"
                        : ""
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3 ml-auto">
              {user ? (
                <>
                  <span className="text-zinc-500 dark:text-zinc-400 max-w-[200px] truncate">
                    {user.email}{" "}
                    <span className="text-xs px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800">
                      {user.role}
                    </span>
                  </span>
                  <LogoutButton />
                </>
              ) : (
                <>
                  <Link href="/login" className="hover:underline">
                    Sign in
                  </Link>
                  <Link
                    href="/register"
                    className="px-3 py-1.5 rounded-md text-white font-medium"
                    style={{
                      background:
                        "linear-gradient(90deg, var(--site-primary), var(--site-accent))",
                    }}
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>

            {/* mobile drawer (client component) */}
            <div className="md:hidden ml-auto">
              <MobileNav
                links={navLinks}
                user={user ? { email: user.email, role: user.role } : null}
              />
            </div>
          </nav>
        </header>
        <main className="flex-1 min-w-0">{children}</main>
        <footer className="text-xs text-zinc-500 text-center px-4 py-4 border-t border-zinc-200 dark:border-zinc-800">
          <span className="block sm:inline">{settings.siteName}</span>
          <span className="hidden sm:inline"> · </span>
          <span className="block sm:inline">
            NODE_ENV={process.env.NODE_ENV} · STORAGE=
            {process.env.STORAGE_DRIVER ?? "local"}
          </span>
        </footer>
      </body>
    </html>
  );
}
