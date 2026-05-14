"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Pings /api/track/pageview every time the pathname changes.
 * - referrer = document.referrer ONCE on the first call after a hard nav,
 *   then the previous in-app path on subsequent SPA navs.
 * - UTM params are extracted from the URL.
 *
 * Rendered once in app/layout.tsx so it runs on every page.
 */
export default function PageTracker() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);
  const firstReferrer = useRef<string | null>(
    typeof document !== "undefined" ? document.referrer || null : null,
  );

  useEffect(() => {
    if (!pathname) return;
    if (lastPath.current === pathname) return;

    const previous = lastPath.current;
    lastPath.current = pathname;

    const referrer =
      previous && typeof window !== "undefined"
        ? `${window.location.origin}${previous}`
        : firstReferrer.current;

    const params =
      typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
    const utmSource = params?.get("utm_source") || undefined;
    const utmMedium = params?.get("utm_medium") || undefined;
    const utmCampaign = params?.get("utm_campaign") || undefined;

    const body = JSON.stringify({
      path: pathname,
      referrer: referrer || undefined,
      utmSource,
      utmMedium,
      utmCampaign,
    });

    // Use sendBeacon if available so it survives page unload
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      try {
        navigator.sendBeacon(
          "/api/track/pageview",
          new Blob([body], { type: "application/json" }),
        );
        return;
      } catch {
        /* fall through */
      }
    }
    fetch("/api/track/pageview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {
      /* analytics is best-effort */
    });
  }, [pathname]);

  return null;
}
