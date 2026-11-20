import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

/**
 * Handles:
 * 1. Markdown content negotiation (acceptmarkdown.com):
 *    Requests with `Accept: text/markdown` are served clean Markdown bodies via `/api/markdown`.
 * 2. Supabase session cookies & route protection for /admin.
 * 3. Cache coordination: sets `Vary: Accept` on responses.
 */
export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const accept = request.headers.get("accept") ?? "";

  // Content negotiation for AI agents (acceptmarkdown.com)
  const isStaticFile = /\.(ico|png|jpg|jpeg|svg|webp|avif|css|js|txt|xml|json|webmanifest)$/i.test(pathname);
  const wantsMarkdown =
    accept.includes("text/markdown") &&
    !pathname.startsWith("/_next") &&
    !pathname.startsWith("/api") &&
    !isStaticFile;

  if (wantsMarkdown) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = "/api/markdown";
    rewriteUrl.searchParams.set("path", pathname);
    return NextResponse.rewrite(rewriteUrl, {
      request: {
        headers: request.headers,
      },
    });
  }

  // Admin routes protection
  if (pathname.startsWith("/admin")) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (url && key) {
      let response = NextResponse.next({ request });
      const supabase = createServerClient(url, key, {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
          },
        },
      });

      const { data } = await supabase.auth.getClaims();
      const user = data?.claims?.sub ?? null;

      const isLogin = pathname === "/admin/login";
      if (!user && !isLogin) {
        const login = request.nextUrl.clone();
        login.pathname = "/admin/login";
        login.search = "";
        const redirect = NextResponse.redirect(login);
        response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
        return redirect;
      }

      response.headers.set("X-Robots-Tag", "noindex, nofollow");
      response.headers.set("Cache-Control", "private, no-store");
      response.headers.set("Vary", "Accept");
      return response;
    }
  }

  const response = NextResponse.next({ request });
  response.headers.set("Vary", "Accept");
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static build files)
     * - _next/image (image optimization)
     * - favicon.ico, icon.png, apple-icon.png
     * - public assets (/brand/, /samples/)
     */
    "/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|brand/|samples/).*)",
  ],
};
