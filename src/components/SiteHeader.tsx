import Link from "next/link"
import { LogoutButton } from "@/components/LogoutButton"
import type { SessionUser } from "@/types"

export function SiteHeader({ user }: { user: SessionUser }) {
  return (
    <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur">
      <div className="max-w-[1100px] mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold tracking-tight">
          smoke<span className="text-orange-500">lab</span>
        </Link>
        <div className="flex items-center gap-4">
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
          </Link>
          <LogoutButton />
        </div>
      </div>
    </header>
  )
}
