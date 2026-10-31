import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Fast in-memory JWT evaluation (<1ms) - zero database roundtrips
    const email = (token?.email as string)?.toLowerCase() || "";
    const role = (token?.role as string) || "";
    const isDeveloper =
      token?.isDeveloper === true ||
      role === "DEVELOPER" ||
      email === "suman.baidya.pro@gmail.com";

    const isSuperAdmin =
      isDeveloper ||
      token?.isSuperAdmin === true ||
      role === "SUPER_ADMIN" ||
      email === "suman.baidya.pro@gmail.com";

    // 🔒 1. Strict Platform Admin Protection (/admin/*)
    if (pathname.startsWith("/admin")) {
      // If not Super Admin or Developer, redirect immediately to customer dashboard
      if (!isSuperAdmin) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }

      // Root Developer Diagnostics (/admin/diagnostics) is strictly for Developer
      if (pathname.startsWith("/admin/diagnostics") && !isDeveloper) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Gatekeeper: Must have a verified NextAuth session token cookie
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

// Match all private application routes (excluding public marketing, login, signup, and API webhooks)
export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/admin",
    "/admin/:path*",
    "/content",
    "/content/:path*",
    "/calendar",
    "/calendar/:path*",
    "/social",
    "/social/:path*",
    "/brand",
    "/brand/:path*",
    "/leads",
    "/leads/:path*",
    "/billing",
    "/billing/:path*",
    "/team",
    "/team/:path*",
  ],
};
