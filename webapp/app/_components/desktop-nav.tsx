"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export interface NavLinkProp {
  id: string;
  href: string;
  label: string;
  external?: boolean;
  openInNew?: boolean;
  accent?: boolean;
  children?: NavLinkProp[];
}

export default function DesktopNav({ links }: { links: NavLinkProp[] }) {
  return (
    <div className="hidden md:flex items-center gap-1 flex-1">
      {links.map((l) =>
        l.children && l.children.length > 0 ? (
          <DropdownItem key={l.id} item={l} />
        ) : (
          <NavLink key={l.id} item={l} />
        ),
      )}
    </div>
  );
}

function NavLink({ item }: { item: NavLinkProp }) {
  return (
    <Link
      href={item.href || "#"}
      target={item.openInNew || item.external ? "_blank" : undefined}
      rel={item.external ? "noopener noreferrer" : undefined}
      className={`px-3 py-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm transition ${
        item.accent
          ? "text-amber-600 dark:text-amber-400 font-medium"
          : item.href === "/docs"
            ? "text-zinc-500 dark:text-zinc-400"
            : ""
      }`}
    >
      {item.label}
    </Link>
  );
}

function DropdownItem({ item }: { item: NavLinkProp }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | null>(null);

  // Close on click outside.
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function scheduleClose() {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpen(false), 120);
  }
  function cancelClose() {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }

  return (
    <div
      ref={wrapRef}
      className="relative"
      onMouseEnter={() => {
        cancelClose();
        setOpen(true);
      }}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm transition ${
          open ? "bg-zinc-100 dark:bg-zinc-800" : ""
        }`}
      >
        {item.label}
        <svg
          viewBox="0 0 24 24"
          className={`h-3 w-3 opacity-60 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-0 top-full mt-1 min-w-[220px] rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-lg shadow-zinc-900/5 dark:shadow-black/30 p-1.5 z-50"
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        >
          {/* If the parent has its own link too, render it first */}
          {item.href && (
            <Link
              href={item.href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block px-3 py-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm font-medium"
            >
              {item.label} overview
            </Link>
          )}
          {item.children?.map((c) => (
            <Link
              key={c.id}
              href={c.href || "#"}
              target={c.openInNew || c.external ? "_blank" : undefined}
              rel={c.external ? "noopener noreferrer" : undefined}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-start gap-3 px-3 py-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm"
            >
              <span
                aria-hidden
                className="mt-1.5 h-1.5 w-1.5 rounded-full shrink-0"
                style={{
                  background:
                    "linear-gradient(135deg, var(--site-primary), var(--site-accent))",
                }}
              />
              <span className="flex-1 min-w-0">
                <span className="block truncate">{c.label}</span>
              </span>
              {(c.openInNew || c.external) && (
                <span aria-hidden className="text-xs text-zinc-400 mt-0.5">↗</span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
