/**
 * Article helpers — backed by the new `Article` model (separate from the
 * legacy AboutArticle which is hidden from the UI).
 */
import { prisma } from "./prisma";

export interface ArticleCategoryRef {
  id: string;
  slug: string;
  name: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body: string;
  coverImage: string | null;
  layout: string;
  categoryId: string | null;
  category?: ArticleCategoryRef | null;
  isPublished: boolean;
  publishedAt: Date | null;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export function isArticlesReady(): boolean {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return !!(prisma as any)?.article?.findMany;
}

interface ListOptions {
  includeDrafts?: boolean;
  categoryId?: string;
  categorySlug?: string;
  limit?: number;
}

export async function listArticles(opts: ListOptions = {}): Promise<Article[]> {
  if (!isArticlesReady()) return [];
  try {
    const where: Record<string, unknown> = opts.includeDrafts
      ? {}
      : { isPublished: true };
    if (opts.categoryId) where.categoryId = opts.categoryId;
    if (opts.categorySlug) where.category = { slug: opts.categorySlug };

    return (await prisma.article.findMany({
      where,
      orderBy: [
        { order: "asc" },
        { publishedAt: "desc" },
        { createdAt: "desc" },
      ],
      take: opts.limit,
      include: {
        category: { select: { id: true, slug: true, name: true } },
      },
    })) as unknown as Article[];
  } catch (e) {
    console.warn("listArticles: falling back", e);
    return [];
  }
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  if (!isArticlesReady()) return null;
  try {
    return (await prisma.article.findUnique({
      where: { slug },
      include: {
        category: { select: { id: true, slug: true, name: true } },
      },
    })) as unknown as Article | null;
  } catch (e) {
    console.warn("getArticleBySlug: failed", e);
    return null;
  }
}

/** Split a plain-text body on blank lines into paragraph chunks. */
export function splitArticleParagraphs(body: string): string[][] {
  return body
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((p) => p.split("\n").map((s) => s.trim()).filter(Boolean))
    .filter((lines) => lines.length > 0);
}

/** Compute reading time from a body in minutes (≈ 200 words/min, supports Thai). */
export function readingTime(body: string): number {
  // Rough heuristic: 220 cps for Thai, 200 wpm for English.
  const wordCount = body.trim().split(/\s+/).filter(Boolean).length;
  const charCount = body.length;
  const minutes = Math.max(wordCount / 200, charCount / 1400);
  return Math.max(1, Math.round(minutes));
}
