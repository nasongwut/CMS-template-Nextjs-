import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getAboutPage, isAboutReady, sortTimelineByYear } from "@/lib/about";
import AboutClient from "./about-client";

export const dynamic = "force-dynamic";

export default async function AdminAboutPage() {
  const ready = isAboutReady();
  const [page, events] = await Promise.all([
    getAboutPage(),
    ready
      ? prisma.timelineEvent.findMany({
          orderBy: [{ order: "asc" }, { createdAt: "asc" }],
        })
      : Promise.resolve([]),
  ]);

  // Auto-sort events on the server so the admin sees them in year order too.
  const timeline = sortTimelineByYear(events, "asc");

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-medium">About page</h2>
          <p className="text-sm text-zinc-500 mt-0.5">
            Edit the public <code className="font-mono">/about</code> page — hero,
            layout preset, and the vertical timeline.
          </p>
        </div>
        <Link
          href="/about"
          target="_blank"
          className="text-xs sm:text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          View public page ↗
        </Link>
      </div>

      {!ready && (
        <div className="mt-4 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 p-4 text-sm">
          <p className="font-medium">About tables aren&apos;t ready yet.</p>
          <p className="mt-1">
            Run{" "}
            <code className="font-mono bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 rounded">
              npm run prisma:migrate
            </code>
            , then restart{" "}
            <code className="font-mono bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 rounded">
              npm run dev
            </code>
            .
          </p>
        </div>
      )}

      <div className="mt-5 sm:mt-6">
        <AboutClient
          initialPage={{
            heading: page.heading,
            subheading: page.subheading,
            body: page.body,
            heroImage: page.heroImage ?? "",
            layout: page.layout ?? "classic",
          }}
          initialTimeline={timeline}
        />
      </div>
    </section>
  );
}
