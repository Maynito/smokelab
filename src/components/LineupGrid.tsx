"use client"

import { useState } from "react"
import type { BookSummary, Lineup, LineupBookmark } from "@/types"
import { LineupCard } from "@/components/LineupCard"
import { LineupBookmarkBadge } from "@/components/LineupBookmarkBadge"
import { LineupDetailModal } from "@/components/LineupDetailModal"

export function LineupGrid({
  lineups,
  currentUserId,
  isAdmin,
  bookmarks,
  viewerSteamId,
  myBooks,
  openLineupId: controlledOpenId,
  onOpenLineupIdChange,
  extraModalLineups = [],
}: {
  lineups: Lineup[]
  currentUserId: string | null
  isAdmin: boolean
  bookmarks: LineupBookmark[]
  viewerSteamId: string | null
  myBooks: BookSummary[]
  openLineupId?: string | null
  onOpenLineupIdChange?: (id: string | null) => void
  // Lineups pas rendues en carte ici (ex: perso, hors pool) mais qu'il faut
  // pouvoir résoudre si le radar partagé ouvre leur id (overlay "mon livre").
  extraModalLineups?: Lineup[]
}) {
  const [internalOpenId, setInternalOpenId] = useState<string | null>(null)
  const openLineupId = controlledOpenId !== undefined ? controlledOpenId : internalOpenId
  const setOpenLineupId = onOpenLineupIdChange ?? setInternalOpenId

  const openLineup =
    lineups.find((l) => l.id === openLineupId) ??
    extraModalLineups.find((l) => l.id === openLineupId) ??
    null

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {lineups.map((lineup) => (
          <div key={lineup.id} className="relative">
            <LineupCard lineup={lineup} onOpen={() => setOpenLineupId(lineup.id)} />
            <LineupBookmarkBadge
              bookmarks={bookmarks.filter((b) => b.lineupId === lineup.id)}
              viewerSteamId={viewerSteamId}
            />
          </div>
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
