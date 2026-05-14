# Frontend Tour

## Pages

| Route | Component | Auth |
|---|---|---|
| `/` | `app/page.tsx` (RSC) | Public — landing page (developer-template style) |
| `/login` | `app/login/page.tsx` (client) | Public |
| `/register` | `app/register/page.tsx` (client) | Public |
| `/dashboard` | `app/dashboard/page.tsx` (RSC) | Any signed-in user |
| `/files` | `app/files/page.tsx` (RSC) + `files-client.tsx` | Any signed-in user |
| `/admin` | `app/admin/page.tsx` (RSC) + `admin-client.tsx` | `ADMIN` only |

RSC = React Server Component. They run on the server, can call `getCurrentUser()`
and Prisma directly, and stream the result.

## Layout

`app/layout.tsx` is async (it calls `getCurrentUser()`):

- Renders the top nav with the user's email + role badge when signed in
- Includes the `LogoutButton` client component
- Shows a tiny "NODE_ENV=… · STORAGE=…" footer so you always know which env
  is loaded

## Files page (`/files`)

`files-client.tsx` is the only meaty client component. State it tracks:

```ts
files: FileRow[]        // all files visible to the user
folders: FolderRow[]    // all owned folders
activeFolder: string    // "root" or a folder id
sortKey: "name" | "size" | "driver" | "createdAt"
sortDir: "asc" | "desc"
```

Behaviours:

- **Sidebar** — clickable folders + "+ new" to inline-create one. "All files"
  shows everything not in a folder.
- **Sort headers** — click to cycle: same column toggles direction, switching
  columns picks a sensible default (desc for `size`/`createdAt`, asc for the rest).
- **Upload button** — uploads into the currently selected folder (or root if
  none selected). Shows "Uploading…" while in-flight.
- **Delete folder** — visible only inside a folder view. Confirms with a count
  of contained files; cascade-deletes everything.

The component is intentionally one file with no helper libs so it's easy to
fork and customise.

## Admin page (`/admin`)

`admin-client.tsx` handles:

- Listing all users (with file counts via `_count`)
- Inline create form (email/password/name/role)
- Role dropdown that calls `PATCH /api/admin/users/:id` on change
- Active/disabled toggle button
- Delete button with confirmation

Admins cannot demote, disable, or delete themselves — those buttons are
visually disabled in the UI and re-enforced on the server.

## Styling

- Tailwind v4 (the new "Oxide" engine, configured via `postcss.config.mjs`)
- No component library — every component is hand-rolled with utility classes
  so you can change the design without fighting a framework
- Dark mode is automatic via `prefers-color-scheme`; the design works in both
- Geist Sans / Geist Mono fonts loaded via `next/font/google`
- All icons are inline SVGs (no `lucide-react` or similar dependency)

## Adding a new page

```tsx
// app/things/page.tsx
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function ThingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-semibold">Things</h1>
      {/* … */}
    </div>
  );
}
```

If the page needs interactivity, extract a `"use client"` component beside
it and pass server-fetched data in as props.
