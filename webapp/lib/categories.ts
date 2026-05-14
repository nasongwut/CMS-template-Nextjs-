/**
 * Category helpers — graceful fallback when the migration hasn't been applied.
 */
import { prisma } from "./prisma";

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  coverImage: string | null;
  order: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export function isCategoriesReady(): boolean {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return !!(prisma as any)?.category?.findMany;
}

export async function listCategories({
  includeDrafts = false,
}: { includeDrafts?: boolean } = {}): Promise<Category[]> {
  if (!isCategoriesReady()) return [];
  try {
    return (await prisma.category.findMany({
      where: includeDrafts ? {} : { isPublished: true },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    })) as Category[];
  } catch (e) {
    console.warn("listCategories: falling back", e);
    return [];
  }
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  if (!isCategoriesReady()) return null;
  try {
    return (await prisma.category.findUnique({ where: { slug } })) as Category | null;
  } catch (e) {
    console.warn("getCategoryBySlug: failed", e);
    return null;
  }
}

/** Strip everything that isn't a-z0-9-. Used both client + server-side. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9฀-๿\s-]/g, "") // keep Thai code-block + word chars
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}
