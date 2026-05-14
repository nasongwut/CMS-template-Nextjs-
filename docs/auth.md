# Authentication

A self-contained JWT-cookie session system — no external auth provider.

## At a glance

- Passwords hashed with **bcryptjs** (cost 10)
- Session = **JWT signed with HS256** using `AUTH_SECRET`
- JWT stored in an **HttpOnly, SameSite=Lax, Secure-in-prod** cookie
- Middleware checks the cookie on the Edge for redirects
- API routes & RSC pages re-verify via `requireUser()` / `requireRole(...)`

## File map

| File | Purpose |
|---|---|
| `lib/auth.ts` | Sign / verify JWT, cookie helpers, role guards |
| `lib/prisma.ts` | Singleton PrismaClient |
| `middleware.ts` | Edge: redirect unauth'd users away from `/dashboard`, `/files`, `/admin` |
| `app/api/auth/register/route.ts` | Create account → set session |
| `app/api/auth/login/route.ts` | Verify password → set session |
| `app/api/auth/logout/route.ts` | Delete cookie |
| `app/api/auth/me/route.ts` | Return the current user (or `null`) |

## JWT payload

```ts
interface SessionPayload {
  sub: string;     // user id (cuid)
  email: string;
  role: "ADMIN" | "USER" | "GUEST";
  name: string | null;
}
```

Standard registered claims included: `iss: "webapp"`, `iat`, `exp`. The token's
`exp` mirrors the cookie's `Max-Age` (`SESSION_MAX_AGE_SECONDS`).

## Adding a route that requires auth

```ts
// app/api/things/route.ts
import { NextResponse } from "next/server";
import { requireUser, AuthError } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const me = await requireUser();                       // 401 if no session
    const things = await prisma.thing.findMany({
      where: { ownerId: me.id },
    });
    return NextResponse.json({ things });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.code }, { status: e.status });
    }
    throw e;
  }
}
```

## Adding an admin-only route

```ts
const me = await requireRole("ADMIN");
```

`requireRole(...roles)` accepts a variadic list — passing multiple roles
allows e.g. `requireRole("ADMIN", "USER")` to lock out `GUEST`.

## Server components

Use `getCurrentUser()` instead of `requireUser()` when you want to show
different content for guests rather than 401:

```tsx
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Page() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return <p>Hi {user.email}</p>;
}
```

## Edge middleware

`middleware.ts` runs on every matched request and:

1. Reads the `SESSION_COOKIE_NAME` cookie
2. Verifies the JWT (no DB call — Edge runtime)
3. Redirects to `/login?from=<path>` if invalid/missing
4. For `/admin/*` paths, also redirects to `/dashboard` if the role isn't `ADMIN`

`middleware.ts`'s matcher only covers `/dashboard`, `/files`, `/admin`. Public
routes (landing page, login, register, the `/api/auth/*` endpoints) are
intentionally not gated by middleware — they're handled at the route level.

## Rotating `AUTH_SECRET`

Rotating the secret invalidates every existing JWT (and therefore every
logged-in session) — users will be bounced to `/login`. There is no built-in
"key rotation" mechanism with overlap; if you need zero-downtime rotation,
extend `lib/auth.ts` to try a list of secrets when verifying.
