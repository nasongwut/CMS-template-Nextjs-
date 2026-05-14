/**
 * NavBar item resolver — loads NavItem rows from the DB and converts them
 * into renderable {href, label} structures the layout can iterate over.
 *
 * Falls back to a sensible default list when the migration hasn't been
 * applied yet, so the site is never linkless.
 */
import { prisma } from "./prisma";

export const NAV_KINDS = ["page", "category", "article", "external"] as const;
export type NavKind = (typeof NAV_KINDS)[number];

export function isNavKind(v: unknown): v is NavKind {
  return typeof v === "string" && (NAV_KINDS as readonly string[]).includes(v);
}

export interface NavItem {
  id: string;
  label: string;
  kind: NavKind;
  target: string;
  order: number;
  requireAuth: boolean;
  adminOnly: boolean;
  openInNew: boolean;
  isPublished: boolean;
}

export interface ResolvedNavLink {
  id: string;
  href: string;
  label: string;
  external: boolean;
  openInNew: boolean;
  requireAuth: boolean;
  adminOnly: boolean;
}

const DEFAULT_LINKS: ResolvedNavLink[] = [
  { id: "_about", href: "/about", label: "About", external: false, openInNew: false, requireAuth: false, adminOnly: false },
  { id: "_articles", href: "/articles", label: "Articles", external: false, openInNew: false, requireAuth: false, adminOnly: false },
  { id: "_careers", href: "/careers", label: "Careers", external: false, openInNew: false, requireAuth: false, adminOnly: false },
  { id: "_files", href: "/files", label: "Files", external: false, openInNew: false, requireAuth: true, adminOnly: false },
  { id: "_docs", href: "/docs", label: "Docs", external: false, openInNew: false, requireAuth: false, adminOnly: false },
];

function isNavReady(): boolean {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return !!(prisma as any)?.navItem?.findMany;
}

export function resolveHref(kind: NavKind, target: string): { href: string; external: boolean } {
  switch (kind) {
    case "external":
      return { href: target, external: true };
    case "category":
      return { href: `/categories/${stripSlashes(target)}`, external: false };
    case "article":
      return { href: `/articles/${stripSlashes(target)}`, external: false };
    case "page":
    default:
      return {
        href: target.startsWith("/") ? target : `/${target}`,
        external: false,
      };
  }
}

function stripSlashes(s: string): string {
  return s.replace(/^\/+|\/+$/g, "");
}

/**
 * Returns the nav links that should appear in the top bar, filtered by the
 * caller's auth/role and ordered for rendering. Used by app/layout.tsx.
 */
export async function getNavLinks(opts: {
  isAuthed: boolean;
  isAdmin: boolean;
}): Promise<ResolvedNavLink[]> {
  let items: ResolvedNavLink[];
  if (!isNavReady()) {
    items = [...DEFAULT_LINKS];
  } else {
    try {
      const rows = (await prisma.navItem.findMany({
        where: { isPublished: true },
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      })) as NavItem[];

      if (rows.length === 0) {
        // Empty table on a fresh install — show defaults so the site isn't
        // navless. Admins can override by adding rows.
        items = [...DEFAULT_LINKS];
      } else {
        items = rows.map((r) => {
          const { href, external } = resolveHref(r.kind, r.target);
          return {
            id: r.id,
            label: r.label,
            href,
            external,
            openInNew: r.openInNew,
            requireAuth: r.requireAuth,
            adminOnly: r.adminOnly,
          };
        });
      }
    } catch (e) {
      console.warn("getNavLinks: falling back to defaults", e);
      items = [...DEFAULT_LINKS];
    }
  }

  // Filter by caller's state
  return items.filter((i) => {
    if (i.adminOnly && !opts.isAdmin) return false;
    if (i.requireAuth && !opts.isAuthed) return false;
    return true;
  });
}

/** Used by admin pages to retrieve everything (drafts too). */
export async function listAllNavItems(): Promise<NavItem[]> {
  if (!isNavReady()) return [];
  try {
    return (await prisma.navItem.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    })) as NavItem[];
  } catch {
    return [];
  }
}
