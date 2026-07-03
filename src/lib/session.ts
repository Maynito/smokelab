import { getIronSession, IronSession, SessionOptions } from "iron-session"
import { cookies } from "next/headers"
import { SessionUser } from "@/types"

export interface SmokelabSession {
  user?: SessionUser
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET as string,
  cookieName: "smokelab_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
}

export async function getSession(): Promise<IronSession<SmokelabSession>> {
  const cookieStore = await cookies()
  return getIronSession<SmokelabSession>(cookieStore, sessionOptions)
}
