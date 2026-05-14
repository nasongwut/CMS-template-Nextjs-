import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import FilesClient from "./files-client";

export default async function FilesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <h1
        className="text-xl sm:text-2xl font-semibold bg-gradient-to-r bg-clip-text text-transparent inline-block"
        style={{
          backgroundImage:
            "linear-gradient(90deg, var(--site-primary), var(--site-accent))",
        }}
      >
        Files
      </h1>
      <p className="text-sm text-zinc-500 mt-1">
        {user.role === "ADMIN"
          ? "Admin view — see and remove every uploaded file."
          : "Your uploaded files."}
      </p>
      <div className="mt-4 sm:mt-6">
        <FilesClient role={user.role} />
      </div>
    </div>
  );
}
