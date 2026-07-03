"use client"

import { useState } from "react"
import type { BookSummary, Lineup } from "@/types"
import { LineupCard } from "@/components/LineupCard"
import { LineupDetailModal } from "@/components/LineupDetailModal"

export function LineupGrid({
  lineups,
  currentUserId,
  isAdmin,
  bookmarkedIds,
  myBooks,
  openLineupId: controlledOpenId,
  onOpenLineupIdChange,
}: {
  lineups: Lineup[]
  currentUserId: string
  isAdmin: boolean
  bookmarkedIds: string[]
  myBooks: BookSummary[]
  openLineupId?: string | null
  onOpenLineupIdChange?: (id: string | null) => void
}) {
  const [internalOpenId, setInternalOpenId] = useState<string | null>(null)
  const openLineupId = controlledOpenId !== undefined ? controlledOpenId : internalOpenId
  const setOpenLineupId = onOpenLineupIdChange ?? setInternalOpenId

  const openLineup = lineups.find((l) => l.id === openLineupId) ?? null

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {lineups.map((lineup) => (
          <LineupCard
            key={lineup.id}
            lineup={lineup}
            isBookmarked={bookmarkedIds.includes(lineup.id)}
            onOpen={() => setOpenLineupId(lineup.id)}
          />
        ))}
      </div>

      {openLineup && (
        <LineupDetailModal
          lineup={openLineup}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
          myBooks={myBooks}
          onClose={() => setOpenLineupId(null)}
        />
      )}
    </>
  )
}
