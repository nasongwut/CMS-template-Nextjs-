"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLink {
  id?: string;
  href: string;
  label: string;
  accent?: boolean;
  external?: boolean;
  openInNew?: boolean;
  children?: NavLink[];
}

interface Props {
  links: NavLink[];
  user: { email: string; role: string } | null;
}

function MobileLink({ link, depth = 0 }: { link: NavLink; depth?: number }) {
  const hasChildren = !!link.children && link.children.length > 0;
  const [open, setOpen] = useState(false);

  const baseClasses =
    "block px-3 py-3 rounded-md text-base hover:bg-zinc-100 dark:hover:bg-zinc-800";
  const accentClasses = link.accent
    ? "text-amber-600 dark:text-amber-400 font-medium"
    : "text-zinc-700 dark:text-zinc-300";
  const indentStyle = depth > 0 ? { paddingLeft: 12 + depth * 16 } : undefined;

  if (!hasChildren) {
    return (
      <Link
        href={link.href || "#"}
        target={link.openInNew || link.external ? "_blank" : undefined}
        rel={link.external ? "noopener noreferrer" : undefined}
        className={`${baseClasses} ${accentClasses}`}
        style={indentStyle}
      >
        {link.label}
      </Link>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`${baseClasses} ${accentClasses} w-full flex items-center justify-between`}
        style={indentStyle}
      >
        <span>{link.label}</span>
        <svg
          viewBox="0 0 24 24"
          className={`h-4 w-4 opacity-60 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className="space-y-0.5 mt-0.5 mb-1">
          {/* If parent has its own link, render an "overview" entry */}
          {link.href && (
            <Link
              href={link.href}
              className="block py-2.5 rounded-md text-sm text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              style={{ paddingLeft: 12 + (depth + 1) * 16 }}
            >
              {link.label} overview
            </Link>
          )}
          {link.children!.map((c, i) => (
            <MobileLink key={c.id ?? `${c.href}-${i}`} link={c} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function MobileNav({ links, user }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // close drawer when navigating
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  async function onLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setOpen(false);
    window.location.href = "/login";
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className="p-2 -mr-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
          {open ? (
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          ) : (
            <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
          )}
        </svg>
      </button>

      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            className="fixed inset-0 top-[57px] bg-black/30 backdrop-blur-sm z-30"
          />
          <div className="fixed inset-x-0 top-[57px] bottom-0 z-40 bg-white dark:bg-zinc-950 overflow-y-auto">
            <div className="px-4 py-4 space-y-1">
              {links.map((l, i) => (
                <MobileLink key={l.id ?? `${l.href}-${i}`} link={l} />
              ))}
              <div className="border-t border-zinc-200 dark:border-zinc-800 my-3" />
              {user ? (
                <>
                  <div className="px-3 py-2 text-sm">
                    <div className="text-zinc-500">Signed in as</div>
                    <div className="font-medium truncate">{user.email}</div>
                    <span className="mt-1 inline-block text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800">
                      {user.role}
                    </span>
                  </div>
                  <button
                    onClick={onLogout}
                    className="block w-full text-left px-3 py-3 rounded-md text-base text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="block px-3 py-3 rounded-md text-base text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/register"
                    className="block px-3 py-3 rounded-md text-base text-white font-medium text-center"
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
          </div>
        </>
      )}
    </>
  );
}
