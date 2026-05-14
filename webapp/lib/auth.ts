/**
 * Auth helpers — JWT cookie session + role checks.
 *
 * We use `jose` for JWT (Edge-friendly) and `bcryptjs` for password hashing.
 */
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { env, isProd } from "./env";
import { prisma } from "./prisma";
import type { Role, User } from "@prisma/client";

const ISSUER = "webapp";

function secretKey(): Uint8Array {
  return new TextEncoder().encode(env.auth.secret);
}

export interface SessionPayload {
  sub: string;     // user id
  email: string;
  role: Role;
  name: string | null;
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(ISSUER)
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${env.auth.maxAgeSeconds}s`)
    .sign(secretKey());
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey(), { issuer: ISSUER });
    if (
      typeof payload.sub === "string" &&
      typeof payload.email === "string" &&
      typeof payload.role === "string"
    ) {
      return {
        sub: payload.sub,
        email: payload.email as string,
        role: payload.role as Role,
        name: (payload.name as string | null) ?? null,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function setSessionCookie(payload: SessionPayload) {
  const token = await signSession(payload);
  const jar = await cookies();
  jar.set(env.auth.cookieName, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: env.auth.maxAgeSeconds,
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(env.auth.cookieName);
}

export async function getSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const token = jar.get(env.auth.cookieName)?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession();
  if (!session) return null;
  return prisma.user.findUnique({ where: { id: session.sub } });
}

export async function requireUser(): Promise<User> {
  const u = await getCurrentUser();
  if (!u) throw new AuthError("unauthorized", 401);
  if (!u.isActive) throw new AuthError("account_disabled", 403);
  return u;
}

export async function requireRole(...allowed: Role[]): Promise<User> {
  const u = await requireUser();
  if (!allowed.includes(u.role)) throw new AuthError("forbidden", 403);
  return u;
}

export class AuthError extends Error {
  constructor(public code: string, public status: number) {
    super(code);
  }
}
