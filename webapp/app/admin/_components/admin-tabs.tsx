"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/admin", label: "Dashboard", icon: <IconChart /> },
  { href: "/admin/configuration", label: "Configuration", icon: <IconGear /> },
  { href: "/admin/theme", label: "Theme", icon: <IconBrush /> },
  { href: "/admin/nav", label: "Navigation", icon: <IconMenu /> },
  { href: "/admin/about", label: "About page", icon: <IconBook /> },
  { href: "/admin/categories", label: "Categories", icon: <IconTag /> },
  { href: "/admin/articles", label: "Articles", icon: <IconDoc /> },
  { href: "/admin/careers", label: "Careers", icon: <IconBriefcase /> },
  { href: "/admin/users", label: "User management", icon: <IconUsers /> },
];

export default function AdminTabs() {
  const pathname = usePathname();
  return (
    <nav className="-mx-4 sm:mx-0 overflow-x-auto">
      <div className="px-4 sm:px-0 flex items-center gap-1 border-b border-zinc-200 dark:border-zinc-800 min-w-max">
        {tabs.map((t) => {
          const active =
            pathname === t.href ||
            (t.href !== "/admin" && pathname.startsWith(t.href + "/"));
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`relative px-3 sm:px-4 py-2.5 text-sm whitespace-nowrap flex items-center gap-2 ${
                active
                  ? "text-zinc-900 dark:text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
            >
              <span className={active ? "" : "text-zinc-400"}>{t.icon}</span>
              <span>{t.label}</span>
              {active && (
                <span
                  className="absolute left-0 right-0 -bottom-px h-0.5 rounded-full"
                  style={{
                    background:
                      "linear-gradient(90deg, var(--site-primary), var(--site-accent))",
                  }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function IconChart() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 4v16h16" strokeLinecap="round" />
      <path d="M8 14l3-3 3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconGear() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 01-4 0v-.1a1.7 1.7 0 00-1-1.5 1.7 1.7 0 00-1.9.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.9 1.7 1.7 0 00-1.5-1H3a2 2 0 010-4h.1a1.7 1.7 0 001.5-1 1.7 1.7 0 00-.3-1.9l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.9.3H9a1.7 1.7 0 001-1.5V3a2 2 0 014 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.9-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.9V9a1.7 1.7 0 001.5 1H21a2 2 0 010 4h-.1a1.7 1.7 0 00-1.5 1z" />
    </svg>
  );
}
function IconBrush() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M19 3l2 2-9 9-3-1-1-3 9-9 2 2z" strokeLinejoin="round" />
      <path d="M9 13l-4 4a3 3 0 105 5l4-4" strokeLinejoin="round" />
    </svg>
  );
}
function IconBook() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 4h7a3 3 0 013 3v14M20 4h-7a3 3 0 00-3 3v14" strokeLinejoin="round" />
    </svg>
  );
}
function IconMenu() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
    </svg>
  );
}
function IconTag() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" strokeLinejoin="round" />
      <circle cx="7" cy="7" r="1.4" fill="currentColor" />
    </svg>
  );
}
function IconDoc() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinejoin="round" />
      <path d="M14 2v6h6M8 13h8M8 17h5" strokeLinecap="round" />
    </svg>
  );
}
function IconBriefcase() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2" strokeLinejoin="round" />
      <path d="M3 12h18" />
    </svg>
  );
}
function IconUsers() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="9" cy="8" r="3" />
      <circle cx="17" cy="10" r="2.5" />
      <path d="M3 19c0-3 3-5 6-5s6 2 6 5" strokeLinecap="round" />
      <path d="M14 18c0-2 2-3.5 4-3.5s4 1.5 4 3.5" strokeLinecap="round" />
    </svg>
  );
}
