import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const GATE_CODE_COOKIE = "x-gate-code";

type MiddlewareFn = (req: NextRequest) => Promise<Response | NextResponse>;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasGateCode = request.cookies.has(GATE_CODE_COOKIE);

  // Gate page: redirect to home if already has code, otherwise allow through
  if (pathname === "/gate") {
    if (hasGateCode) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // All other routes: require gate code before anything else
  if (!hasGateCode) {
    return NextResponse.redirect(new URL("/gate", request.url));
  }

  // Gate code present — run auth middleware
  return (auth as unknown as MiddlewareFn)(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
  runtime: "nodejs",
};
