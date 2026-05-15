import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { platformPrisma as prisma } from "@/lib/prisma-platform";
import { getPlatformAdmin, isPlatformReady } from "@/lib/platform";
import SiteDetailClient from "./site-detail-client";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SiteDetailPage({ params }: PageProps) {
  if (!isPlatformReady()) return null;
  const admin = await getPlatformAdmin();
  if (!admin) redirect("/super-admin/login");

  const { id } = await params;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const site = await (prisma as any).site.findUnique({
    where: { id },
    include: { domains: { orderBy: { createdAt: "asc" } } },
  });
  if (!site) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const otherSites = await (prisma as any).site.findMany({
    where: { id: { not: id }, isActive: true, NOT: { databaseUrl: "" } },
    select: { id: true, name: true, slug: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-3xl">
      <Link
        href="/super-admin"
        className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
      >
        ← back to sites
      </Link>
      <SiteDetailClient
        site={{
          id: site.id,
          name: site.name,
          slug: site.slug,
          primaryDomain: site.primaryDomain,
          databaseUrl: site.databaseUrl,
          directDbUrl: site.directDbUrl,
          notes: site.notes,
          isActive: site.isActive,
          templateSiteId: site.templateSiteId,
          createdAt: site.createdAt.toISOString(),
          domains: site.domains.map(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (d: any) => ({
              id: d.id,
              hostname: d.hostname,
              isPrimary: d.isPrimary,
            }),
          ),
        }}
        templates={otherSites}
      />
    </div>
  );
}
