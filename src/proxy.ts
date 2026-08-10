import { NextRequest, NextResponse } from "next/server"
import { getIronSession } from "iron-session"
import { SmokelabSession, sessionOptions } from "@/lib/session"

const PUBLIC_PATHS = ["/login", "/api/auth"]

// Pages consultables sans compte (rang "invité", lecture seule).
// Les pages de mutation (/map/x/new, /map/x/<id>/edit) n'y figurent pas.
const GUEST_PATTERNS = [/^\/$/, /^\/maps$/, /^\/map\/[^/]+$/, /^\/u\//]

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p))
  const isGuestAllowed = GUEST_PATTERNS.some((re) => re.test(pathname))
  if (isPublic || isGuestAllowed) return NextResponse.next()

  const res = NextResponse.next()
  const session = await getIronSession<SmokelabSession>(req, res, sessionOptions)

  if (!session.user) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  return res
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|webp|gif|svg|ico)$).*)",
  ],
}
