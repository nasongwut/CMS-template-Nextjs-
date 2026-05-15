/**
 * NavBar item resolver — loads NavItem rows from the DB and converts them
 * into a renderable *tree* (top-level items with optional `children`).
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
  parentId: string | null;
  order: number;
  requireAuth: boolean;
  adminOnly: boolean;
  openInNew: boolean;
  isPublished: boolean;
}

export interface ResolvedNavLink {
  id: string;
  /** Empty string when this is a parent-only item (only opens its dropdown). */
  href: string;
  label: string;
  external: boolean;
  openInNew: boolean;
  requireAuth: boolean;
  adminOnly: boolean;
  /** Direct children — second-level only. Empty if leaf. */
  children: ResolvedNavLink[];
}

/** Built-in defaults used when the NavItem table is empty / not migrated. */
const DEFAULT_LINKS: ResolvedNavLink[] = [
  link("_about", "About", "/about"),
  link("_articles", "Articles", "/articles"),
  link("_careers", "Careers", "/careers"),
  link("_files", "Files", "/files", { requireAuth: true }),
  link("_docs", "Docs", "/docs"),
];

function link(
  id: string,
  label: string,
  href: string,
  extra: Partial<Omit<ResolvedNavLink, "id" | "label" | "href">> = {},
): ResolvedNavLink {
  return {
    id,
    label,
    href,
    external: false,
    openInNew: false,
    requireAuth: false,
    adminOnly: false,
    children: [],
    ...extra,
  };
}

function isNavReady(): boolean {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return !!(prisma as any)?.navItem?.findMany;
}

export function resolveHref(kind: NavKind, target: string): { href: string; external: boolean } {
  if (!target) return { href: "", external: false };
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
 * Returns the nav tree that should appear in the top bar, filtered by the
 * caller's auth/role. Children of an admin-only / requireAuth parent inherit
 * the parent's restrictions implicitly because the entire branch is hidden.
 */
export async function getNavLinks(opts: {
  isAuthed: boolean;
  isAdmin: boolean;
}): Promise<ResolvedNavLink[]> {
  let rows: NavItem[] = [];
  let usedDefaults = false;

  if (!isNavReady()) {
    usedDefaults = true;
  } else {
    try {
      rows = (await prisma.navItem.findMany({
        where: { isPublished: true },
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      })) as unknown as NavItem[];
      if (rows.length === 0) usedDefaults = true;
    } catch (e) {
      console.warn("getNavLinks: falling back to defaults", e);
      usedDefaults = true;
    }
  }

  let items: ResolvedNavLink[];
  if (usedDefaults) {
    items = DEFAULT_LINKS.map((d) => ({ ...d, children: [] }));
  } else {
    // Two passes: gather all rows as ResolvedNavLink, then attach children.
    const byId = new Map<string, ResolvedNavLink>();
    for (const r of rows) {
      const { href, external } = resolveHref(r.kind, r.target);
      byId.set(r.id, {
        id: r.id,
        label: r.label,
        href,
        external,
        openInNew: r.openInNew,
        requireAuth: r.requireAuth,
        adminOnly: r.adminOnly,
        children: [],
      });
    }
    items = [];
    for (const r of rows) {
      const link = byId.get(r.id)!;
      if (r.parentId && byId.has(r.parentId)) {
        byId.get(r.parentId)!.children.push(link);
      } else {
        items.push(link);
      }
    }
  }

  // Filter by caller's state — drop hidden branches entirely.
  return items
    .map((parent) => ({
      ...parent,
      children: parent.children.filter((c) => visible(c, opts)),
    }))
    .filter((parent) => {
      if (!visible(parent, opts)) return false;
      // If the parent has no own link AND no visible children → hide.
      if (!parent.href && parent.children.length === 0) return false;
      return true;
    });
}

function visible(
  l: ResolvedNavLink,
  opts: { isAuthed: boolean; isAdmin: boolean },
): boolean {
  if (l.adminOnly && !opts.isAdmin) return false;
  if (l.requireAuth && !opts.isAuthed) return false;
  return true;
}

/** Used by admin pages — full list including drafts + drafts of children. */
export async function listAllNavItems(): Promise<NavItem[]> {
  if (!isNavReady()) return [];
  try {
    return (await prisma.navItem.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    })) as unknown as NavItem[];
  } catch {
    return [];
  }
}
