import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/account", "/sell/post", "/sell/edit"];

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refresh session — must NOT use getSession() here per Supabase SSR docs
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Redirect unauthenticated users away from protected routes
  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );

  if (isProtected && !user) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect already-authenticated users away from auth pages
  if (user && pathname.startsWith("/auth/") && !pathname.startsWith("/auth/callback")) {
    return NextResponse.redirect(new URL("/account", request.url));
  }

  return supabaseResponse;
}

export const config = {
  // Only the routes that actually need a server-side session: the protected
  // areas and the auth pages. It used to match every request, which put a
  // Supabase `auth.getUser()` network round-trip in front of EVERY public page
  // render — homepage, collection, marketplace, and every listing — inflating
  // TTFB for real visitors and for Googlebot on pages that never read the
  // session. Browsing the public site no longer pays for auth it doesn't use;
  // the browser Supabase client keeps the token refreshed for signed-in users.
  matcher: ["/account/:path*", "/sell/post/:path*", "/sell/edit/:path*", "/auth/:path*"],
};
