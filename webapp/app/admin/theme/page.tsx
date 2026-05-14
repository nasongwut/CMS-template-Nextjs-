import { getTheme, themeDefaults } from "@/lib/theme";
import ThemeClient from "./theme-client";

export default async function AdminThemePage() {
  // Auth/role redirects handled by app/admin/layout.tsx
  const theme = await getTheme();
  return (
    <section>
      <h2 className="text-lg sm:text-xl font-medium">Theme</h2>
      <p className="text-sm text-zinc-500 mt-0.5">
        Pick your brand colours. The palette is injected into the page as CSS
        variables and respected by primary buttons, nav highlights, the analytics
        chart, and the site name in the header.
      </p>
      <div className="mt-4 sm:mt-6">
        <ThemeClient
          initial={{
            lightPrimary: theme.lightPrimary,
            lightAccent: theme.lightAccent,
            lightBackground: theme.lightBackground,
            lightForeground: theme.lightForeground,
            darkPrimary: theme.darkPrimary,
            darkAccent: theme.darkAccent,
            darkBackground: theme.darkBackground,
            darkForeground: theme.darkForeground,
          }}
          defaults={themeDefaults}
        />
      </div>
    </section>
  );
}
