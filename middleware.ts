import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = req.nextUrl;

  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (pathname.startsWith("/admin")) {
    const role =
      session.user.user_metadata?.role ?? session.user.app_metadata?.role;
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
