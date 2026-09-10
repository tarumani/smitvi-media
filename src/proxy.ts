import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const protectedPaths = ["/profile", "/saved", "/history", "/creator/dashboard", "/creator/upload", "/admin"];

export function proxy(req: NextRequest) {
  const res = NextResponse.next();
  if (!req.cookies.get("smitvi_anon")?.value) {
    res.cookies.set("smitvi_anon", crypto.randomUUID(), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }
  const { pathname } = req.nextUrl;
  const isProtected = protectedPaths.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (!isProtected) return res;
  const session = req.cookies.get("smitvi_session")?.value;
  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    const redirect = NextResponse.redirect(url);
    res.cookies.getAll().forEach((c) => redirect.cookies.set(c));
    return redirect;
  }
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.svg|placeholder-thumb.svg).*)"],
};
