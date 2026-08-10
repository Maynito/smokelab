import Link from "next/link"
import { LogoutButton } from "@/components/LogoutButton"
import { NotificationBell } from "@/components/NotificationBell"
import type { SessionUser } from "@/types"

export function SiteHeader({ user }: { user?: SessionUser | null }) {
  return (
    <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur">
      <div className="max-w-[1100px] mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/maps" className="text-lg font-bold tracking-tight">
          smoke<span className="text-orange-500">lab</span>
        </Link>
        {user ? (
          <div className="flex items-center gap-4">
            <NotificationBell />
            <Link
              href={`/u/${user.steam_id}`}
              className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={user.avatar_url}
                alt=""
                className="w-6 h-6 rounded-full border border-zinc-700"
              />
              {user.steam_name}
              {user.is_admin && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/15 text-orange-400 border border-orange-500/30">
                  admin
                </span>
              )}
            </Link>
            <LogoutButton />
          </div>
        ) : (
          <Link
            href="/login"
            className="text-sm bg-orange-500 hover:bg-orange-600 transition-colors rounded-md px-3 py-1.5 font-medium"
          >
            Se connecter
          </Link>
        )}
      </div>
    </header>
  )
}
