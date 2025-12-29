// middleware.ts
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  // Exclude API routes and static files from this middleware
  if (
    req.nextUrl.pathname.startsWith("/api") || 
    req.nextUrl.pathname.startsWith("/_next") ||
    req.nextUrl.pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isAuth = !!token;
  
  // ... rest of your logic ...
  const isAuthPage = req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/signup");

  if (isAuthPage && isAuth) {
    return NextResponse.redirect(new URL("/roadmap", req.url));
  }

  const isProtectedPage = 
    req.nextUrl.pathname.startsWith("/roadmap") || 
    req.nextUrl.pathname.startsWith("/settings") ||
    req.nextUrl.pathname.startsWith("/onboarding");
  
  if (isProtectedPage && !isAuth) {
    let from = req.nextUrl.pathname;
    if (req.nextUrl.search) {
      from += req.nextUrl.search;
    }
    return NextResponse.redirect(
      new URL(`/login?from=${encodeURIComponent(from)}`, req.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};