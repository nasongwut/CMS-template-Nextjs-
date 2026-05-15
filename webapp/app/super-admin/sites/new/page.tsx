import { redirect } from "next/navigation";
import { getPlatformAdmin, isPlatformReady } from "@/lib/platform";
import { TEMPLATES } from "@/lib/templates";
import NewSiteClient from "./new-site-client";

export const dynamic = "force-dynamic";

export default async function NewSitePage() {
  if (!isPlatformReady()) return null;
  const admin = await getPlatformAdmin();
  if (!admin) redirect("/super-admin/login");

  return (
    <NewSiteClient
      templates={TEMPLATES.map((t) => ({
        id: t.id,
        name: t.name,
        blurb: t.blurb,
        glyph: t.glyph,
        themeId: t.themeId,
        counts: {
          categories: t.categories.length,
          articles: t.articles.length,
          timeline: t.timeline.length,
          navItems:
            t.navItems.length +
            t.navItems.reduce((n, i) => n + (i.children?.length ?? 0), 0),
        },
      }))}
    />
  );
}
