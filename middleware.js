import { NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/register"];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get("taskflow-session");

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  // Let public pages through
  if (isPublic) return NextResponse.next();

  // No session cookie → redirect to login
  // Note: Firebase handles real auth; this cookie is set client-side as a hint.
  // The AuthContext is the real guard — this just prevents flash on cold load.
  if (!session) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
