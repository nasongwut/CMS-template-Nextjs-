import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArticleBySlug } from "@/lib/articles";
import ArticleLayoutDispatcher from "../article-layouts";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Not found" };
  return {
    title: article.title,
    description: article.excerpt ?? undefined,
    openGraph: article.coverImage
      ? { images: [{ url: article.coverImage }] }
      : undefined,
  };
}

export default async function ArticleDetail({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article || !article.isPublished) notFound();
  return <ArticleLayoutDispatcher data={{ article }} />;
}
