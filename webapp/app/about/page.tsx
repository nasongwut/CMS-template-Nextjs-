import type { Metadata } from "next";
import {
  getAboutPage,
  isAboutReady,
  listTimeline,
  sortTimelineByYear,
} from "@/lib/about";
import { getSettings } from "@/lib/settings";
import AboutLayoutDispatcher from "./about-layouts";

export async function generateMetadata(): Promise<Metadata> {
  const [page, site] = await Promise.all([getAboutPage(), getSettings()]);
  return {
    title: page.heading,
    description: page.subheading || `About ${site.siteName}`,
  };
}

export default async function AboutPage() {
  const ready = isAboutReady();
  const [page, rawTimeline] = await Promise.all([
    getAboutPage(),
    listTimeline(),
  ]);

  // Auto-sort by year — admins don't need to drag-reorder.
  const timeline = sortTimelineByYear(rawTimeline, "asc");

  return (
    <>
      {!ready && (
        <section className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
          <div className="rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 p-4 text-sm">
            <p className="font-medium">About content tables aren&apos;t ready yet.</p>
            <p className="mt-1">
              Run{" "}
              <code className="font-mono bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 rounded">
                npm run prisma:migrate
              </code>
              , then refresh.
            </p>
          </div>
        </section>
      )}

      <AboutLayoutDispatcher data={{ page, timeline }} />

      {ready && timeline.length === 0 && !page.body && (
        <section className="max-w-2xl mx-auto px-4 sm:px-6 py-12 text-center text-zinc-500">
          <p>
            This page is waiting for content. Admins can edit it at{" "}
            <code className="font-mono">/admin/about</code>.
          </p>
        </section>
      )}
    </>
  );
}
