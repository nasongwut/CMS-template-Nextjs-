import { redirect } from "next/navigation";
import { getPlatformAdmin } from "@/lib/platform";
import LoginClient from "./login-client";

export default async function SuperAdminLoginPage() {
  const admin = await getPlatformAdmin();
  if (admin) redirect("/super-admin");
  return (
    <div className="min-h-[calc(100vh-180px)] flex items-center justify-center px-4 sm:px-6 py-10">
      <LoginClient />
    </div>
  );
}
