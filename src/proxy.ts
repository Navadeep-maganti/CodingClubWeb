import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * Middleware-level route protection.
 *
 * For /dashboard/* routes, we check for a NextAuth session token cookie.
 * If not present, redirect to /login.
 *
 * NOTE: The actual session validity and role-based check happens server-side
 * in the page/route handler via getServerSession(authOptions). This middleware
 * only does a fast cookie-presence check to avoid the cost of a DB lookup on
 * every request.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only protect /dashboard/*
  if (!pathname.startsWith("/dashboard/")) {
    return NextResponse.next()
  }

  // Check for session token cookie (both dev and prod names)
  const sessionToken =
    request.cookies.get("next-auth.session-token")?.value ||
    request.cookies.get("__Secure-next-auth.session-token")?.value

  if (!sessionToken) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*"],
}

