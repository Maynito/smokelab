"use client"

import { useState, useTransition } from "react"
import { toggleFollow } from "@/app/u/[steamId]/actions"

export function FollowButton({
  followedUserId,
  followedSteamId,
  initialIsFollowing,
}: {
  followedUserId: string
  followedSteamId: string
  initialIsFollowing: boolean
}) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleClick() {
    const next = !isFollowing
    setIsFollowing(next)
    setError(null)
    startTransition(async () => {
      try {
        await toggleFollow(followedUserId, followedSteamId)
      } catch {
        setIsFollowing(!next)
        setError("Échec, réessaie.")
      }
    })
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className={`text-sm px-4 py-2 rounded-md transition-colors disabled:opacity-50 ${
          isFollowing
            ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
            : "bg-orange-500 text-white hover:bg-orange-600"
        }`}
      >
        {isFollowing ? "Abonné ✓" : "Suivre"}
      </button>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  )
}
