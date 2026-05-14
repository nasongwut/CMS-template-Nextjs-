import { redirect } from "next/navigation";

/** Legacy path. The settings UI now lives at /admin/configuration. */
export default function LegacyAdminSettings() {
  redirect("/admin/configuration");
}
