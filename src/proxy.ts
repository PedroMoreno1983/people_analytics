import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { AUTH_COOKIE_NAME, verifySessionToken } from "@/lib/auth/token";

const APP_PROTECTED_PREFIXES = ["/dashboard", "/people", "/departments", "/upload"];
const API_PROTECTED_PREFIXES = ["/api/analytics", "/api/ingestion", "/api/copilot"];

function isProtectedPath(pathname: string) {
  return (
    APP_PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ||
    API_PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  );
}

function isApiPath(pathname: string) {
  return API_PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function buildLoginUrl(request: NextRequest) {
  const loginUrl = new URL("/login", request.url);
  const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;

  if (nextPath && nextPath !== "/") {
    loginUrl.searchParams.set("next", nextPath);
  }

  return loginUrl;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const sessionToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!sessionToken) {
    return isApiPath(pathname)
      ? NextResponse.json({ error: "Authentication required." }, { status: 401 })
      : NextResponse.redirect(buildLoginUrl(request));
  }

  const sessionPayload = await verifySessionToken(sessionToken);

  if (!sessionPayload) {
    return isApiPath(pathname)
      ? NextResponse.json({ error: "Invalid session." }, { status: 401 })
      : NextResponse.redirect(buildLoginUrl(request));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/people/:path*",
    "/departments/:path*",
    "/upload/:path*",
    "/api/analytics/:path*",
    "/api/ingestion/:path*",
    "/api/copilot/:path*",
  ],
};
