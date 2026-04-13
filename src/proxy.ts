import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { GATE_CODE_COOKIE } from "@/lib/runtimeConfig";

type AuthProxyFn = (req: NextRequest) => Promise<Response | NextResponse>;

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasGateCode = request.cookies.has(GATE_CODE_COOKIE);

  if (pathname === "/gate") {
    if (hasGateCode) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  if (!hasGateCode) {
    return NextResponse.redirect(new URL("/gate", request.url));
  }

  return (auth as unknown as AuthProxyFn)(request);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
