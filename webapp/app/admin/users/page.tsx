import { getCurrentUser } from "@/lib/auth";
import AdminClient from "../admin-client";

export default async function AdminUsersPage() {
  // Auth/role redirects are handled by app/admin/layout.tsx
  const user = (await getCurrentUser())!;
  return (
    <section>
      <h2 className="text-lg sm:text-xl font-medium">User management</h2>
      <p className="text-sm text-zinc-500 mt-0.5">
        Create accounts, change roles, disable or delete members.
      </p>
      <div className="mt-4 sm:mt-6">
        <AdminClient currentAdminId={user.id} />
      </div>
    </section>
  );
}
