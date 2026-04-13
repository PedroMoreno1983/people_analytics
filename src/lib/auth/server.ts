import "server-only";

import type { AppUser } from "@prisma/client";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { ensureBootstrapUser } from "@/lib/auth/bootstrap";
import { verifyPassword } from "@/lib/auth/password";
import {
  AUTH_COOKIE_NAME,
  AUTH_SESSION_MAX_AGE_SECONDS,
  signSessionToken,
  verifySessionToken,
} from "@/lib/auth/token";
import { prisma } from "@/lib/prisma";

type SessionUser = Pick<AppUser, "id" | "email" | "name" | "role">;

export type AuthenticatedSession = {
  sessionId: string;
  user: SessionUser;
  expiresAt: Date;
};

function buildLoginHref(nextPath?: string) {
  if (!nextPath || nextPath === "/") {
    return "/login";
  }

  return `/login?next=${encodeURIComponent(nextPath)}`;
}

async function readRequestMetadata() {
  const requestHeaders = await headers();

  return {
    userAgent: requestHeaders.get("user-agent") ?? undefined,
    ipAddress:
      requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      requestHeaders.get("x-real-ip") ||
      undefined,
  };
}

export async function createAuthenticatedSession(user: SessionUser) {
  const metadata = await readRequestMetadata();
  const expiresAt = new Date(Date.now() + AUTH_SESSION_MAX_AGE_SECONDS * 1000);
  const session = await prisma.appSession.create({
    data: {
      userId: user.id,
      expiresAt,
      userAgent: metadata.userAgent,
      ipAddress: metadata.ipAddress,
    },
  });
  const token = await signSessionToken({
    sid: session.id,
    uid: user.id,
    exp: expiresAt.getTime(),
  });
  const cookieStore = await cookies();

  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: AUTH_SESSION_MAX_AGE_SECONDS,
  });

  return session;
}

export async function clearAuthenticatedSession() {
  const cookieStore = await cookies();
  const currentToken = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (currentToken) {
    const payload = await verifySessionToken(currentToken);

    if (payload) {
      await prisma.appSession.updateMany({
        where: {
          id: payload.sid,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      });
    }
  }

  cookieStore.delete(AUTH_COOKIE_NAME);
}

export async function getAuthenticatedSession(): Promise<AuthenticatedSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const payload = await verifySessionToken(token);

  if (!payload) {
    return null;
  }

  const session = await prisma.appSession.findUnique({
    where: {
      id: payload.sid,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      },
    },
  });

  if (!session || session.userId !== payload.uid) {
    return null;
  }

  if (session.revokedAt || session.expiresAt.getTime() <= Date.now()) {
    return null;
  }

  return {
    sessionId: session.id,
    user: session.user,
    expiresAt: session.expiresAt,
  };
}

export async function getAuthenticatedUser() {
  const session = await getAuthenticatedSession();
  return session?.user ?? null;
}

export async function requireAuthenticatedUser(nextPath?: string) {
  const session = await getAuthenticatedSession();

  if (!session) {
    redirect(buildLoginHref(nextPath));
  }

  return session.user;
}

export async function authenticateUser(email: string, password: string) {
  await ensureBootstrapUser();

  const user = await prisma.appUser.findUnique({
    where: {
      email: email.trim().toLowerCase(),
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      passwordSalt: true,
      passwordHash: true,
    },
  });

  if (!user) {
    return null;
  }

  const isValid = verifyPassword(password, user.passwordSalt, user.passwordHash);

  if (!isValid) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  } satisfies SessionUser;
}

export async function requireApiUser() {
  const user = await getAuthenticatedUser();
  return user;
}
