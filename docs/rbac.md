# Roles & Permissions

The schema defines three roles:

```prisma
enum Role {
  ADMIN
  USER
  GUEST
}
```

## Capability matrix

| Capability | ADMIN | USER | GUEST |
|---|:-:|:-:|:-:|
| Sign in | ✓ | ✓ | ✓ |
| See own profile (`/api/auth/me`) | ✓ | ✓ | ✓ |
| Create folder | ✓ | ✓ | ✗ |
| Upload file | ✓ | ✓ | ✗ |
| List own files | ✓ | ✓ | ✓ (empty) |
| Delete own file | ✓ | ✓ | ✗ |
| List all users' files | ✓ | ✗ | ✗ |
| Delete any user's file | ✓ | ✗ | ✗ |
| `/admin` console | ✓ | ✗ | ✗ |
| Create / update / delete users | ✓ | ✗ | ✗ |

> **Note**: `GUEST` is currently a "read-only" placeholder role. The API
> doesn't reject GUESTs from uploads at the moment (it just rejects them via
> the UI). If you need hard enforcement, add a `requireRole("USER", "ADMIN")`
> guard inside `app/api/files/route.ts` POST.

## How a role is set

| Path | Result |
|---|---|
| User self-registers via `/register` or `POST /api/auth/register` | Role = `USER` |
| Admin creates a user via the `/admin` UI or `POST /api/admin/users` | Role = whatever the admin picked |
| Seed script `db:seed` | Role = `ADMIN` for the bootstrap account |
| Admin changes role via `/admin` UI or `PATCH /api/admin/users/:id` | New role applied (cannot demote self) |

## Self-protection

Admins cannot:

- Demote themselves (`role: "USER" | "GUEST"`)
- Disable themselves (`isActive: false`)
- Delete themselves

These checks live in `app/api/admin/users/[id]/route.ts`.

## Patterns for new permission checks

### In API routes
```ts
const me = await requireRole("ADMIN", "USER");          // anyone except GUEST
if (resource.ownerId !== me.id && me.role !== "ADMIN") {
  return NextResponse.json({ error: "forbidden" }, { status: 403 });
}
```

### In server components
```tsx
const user = await getCurrentUser();
if (!user) redirect("/login");
if (user.role !== "ADMIN") redirect("/dashboard");
```

### In client components
The client never receives the password hash or anything sensitive. Use the
`role` field returned by `/api/auth/me` (or passed down as a prop from a server
component) to conditionally render UI — but always re-check on the server.
