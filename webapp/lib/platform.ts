/**
 * Platform / super-admin auth.
 *
 * Lives alongside (but completely separate from) the regular per-tenant
 * auth in lib/auth.ts. Different cookie name, different model
 * (PlatformAdmin), different routes (/super-admin/*).
 */
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { env, isProd } from "./env";
import { platformPrisma as prisma } from "./prisma-platform";

const ISSUER = "platform";
const COOKIE_NAME = "platform_session";

function secretKey(): Uint8Array {
  // Reuse the app auth secret — could be split into its own var later.
  return new TextEncoder().encode(env.auth.secret + ":platform");
}

export interface PlatformSession {
  sub: string; // PlatformAdmin id
  email: string;
  name: string | null;
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

async function sign(payload: PlatformSession): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(ISSUER)
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${env.auth.maxAgeSeconds}s`)
    .sign(secretKey());
}

async function verify(token: string): Promise<PlatformSession | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey(), { issuer: ISSUER });
    if (
      typeof payload.sub === "string" &&
      typeof payload.email === "string"
    ) {
      return {
        sub: payload.sub,
        email: payload.email,
        name: (payload.name as string | null) ?? null,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function setPlatformCookie(payload: PlatformSession) {
  const token = await sign(payload);
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: env.auth.maxAgeSeconds,
  });
}

export async function clearPlatformCookie() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function getPlatformSession(): Promise<PlatformSession | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verify(token);
}

export async function getPlatformAdmin(): Promise<{
  id: string;
  email: string;
  name: string | null;
  isActive: boolean;
} | null> {
  const session = await getPlatformSession();
  if (!session) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row = await (prisma as any).platformAdmin
    ?.findUnique({ where: { id: session.sub } })
    .catch(() => null);
  if (!row || !row.isActive) return null;
  return { id: row.id, email: row.email, name: row.name, isActive: row.isActive };
}

export async function requirePlatformAdmin() {
  const admin = await getPlatformAdmin();
  if (!admin) throw new PlatformAuthError("unauthorized", 401);
  return admin;
}

export class PlatformAuthError extends Error {
  constructor(public code: string, public status: number) {
    super(code);
  }
}

/** Best-effort check that PlatformAdmin model is generated (helps render
 *  a friendly "run migrate" banner if it isn't). */
export function isPlatformReady(): boolean {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return !!(prisma as any)?.platformAdmin?.findUnique;
}
