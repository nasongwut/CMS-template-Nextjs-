import { getSettings } from "@/lib/settings";
import SettingsClient from "../settings/settings-client";

export default async function AdminConfigurationPage() {
  // Auth/role redirects handled by app/admin/layout.tsx
  const settings = await getSettings();
  return (
    <section>
      <h2 className="text-lg sm:text-xl font-medium">Configuration</h2>
      <p className="text-sm text-zinc-500 mt-0.5">
        Site branding and SEO metadata. Changes apply immediately to every page.
      </p>
      <div className="mt-4 sm:mt-6">
        <SettingsClient
          initial={{
            siteName: settings.siteName,
            description: settings.description,
            keywords: settings.keywords,
            author: settings.author,
          }}
        />
      </div>
    </section>
  );
}
