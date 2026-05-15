/**
 * Shape of a "site template" — a self-contained bundle of content that can
 * be applied to a freshly-provisioned tenant database to bootstrap a site
 * for a specific vertical (vehicles, pets, furniture, party, engineering).
 */
import type { SiteStyle } from "../theme";

export interface TemplateCategory {
  slug: string;
  name: string;
  description: string;
  coverImage?: string;
  order: number;
}

export interface TemplateArticle {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  coverImage?: string;
  /** Article layout id — see lib/article-layouts.ts. */
  layout: string;
  categorySlug: string;
  order: number;
}

export interface TemplateTimeline {
  date: string;
  title: string;
  description: string;
  imageUrl?: string;
  order: number;
}

export interface TemplateNavChild {
  label: string;
  kind: "page" | "category" | "article" | "external";
  target: string;
  order: number;
  requireAuth?: boolean;
}

export interface TemplateNavItem extends TemplateNavChild {
  children?: TemplateNavChild[];
}

export interface TemplatePosition {
  id: string;
  title: string;
  team: string;
  type: string;
  location: string;
  summary: string;
}

export interface SiteTemplate {
  id: string;
  /** Display name in the picker. */
  name: string;
  /** Two-three word tagline. */
  blurb: string;
  /** Symbol shown in the swatch. */
  glyph: string;
  /** Brand vibe — pick one of the 5 SITE_THEMES. */
  themeId: SiteStyle;

  // Site-wide settings
  siteName: string;
  siteDescription: string;

  // About page
  about: {
    heading: string;
    subheading: string;
    body: string;
    heroImage?: string;
    /** About layout id — see lib/about-layouts.ts. */
    layout: string;
  };

  categories: TemplateCategory[];
  articles: TemplateArticle[];
  timeline: TemplateTimeline[];
  navItems: TemplateNavItem[];
  /** Job positions shown on the public /careers page for this template. */
  openPositions: TemplatePosition[];
}
