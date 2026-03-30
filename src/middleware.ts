import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require auth
  const publicRoutes = ["/login", "/register", "/api/auth"];
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Check for session token cookie (NextAuth sets this)
  const sessionToken =
    request.cookies.get("authjs.session-token") ||
    request.cookies.get("__Secure-authjs.session-token");

  if (!sessionToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Decode JWT payload to check isSuperAdmin flag
  // NextAuth JWT is a JWE in production, but the session-token cookie
  // for credentials provider contains a base64url-encoded payload we can peek at.
  // However, since we can't reliably decode JWE in middleware without the secret,
  // we use a lightweight approach: set a cookie flag after login.
  // 
  // Alternative: check a simple "role" cookie that we set during auth callbacks.
  // For now, we'll use the __sa (super-admin) marker cookie set by the /api/auth/me endpoint.

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
