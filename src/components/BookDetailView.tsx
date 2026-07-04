"use client"

import { useState } from "react"
import type { BookSummary, Lineup, LineupBookmark, MapName } from "@/types"
import { RadarViewer } from "@/components/RadarViewer"
import { LineupGrid } from "@/components/LineupGrid"
import { BookLineupSelector } from "@/components/BookLineupSelector"

export function BookDetailView({
  map,
  radarSrc,
  lineups,
  showSelector,
  currentUserId,
  isAdmin,
  bookmarks,
  viewerSteamId,
  myBooks,
}: {
  map: MapName
  radarSrc: string
  lineups: Lineup[]
  showSelector: boolean
  currentUserId: string | null
  isAdmin: boolean
  bookmarks: LineupBookmark[]
  viewerSteamId: string | null
  myBooks: BookSummary[]
}) {
  const [openLineupId, setOpenLineupId] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<Lineup["type"]>(lineups[0]?.type ?? "smoke")

  return (
    <>
      <RadarViewer
        radarSrc={radarSrc}
        alt={map}
        lineups={lineups}
        selectedType={selectedType}
        onSelectType={setSelectedType}
        onOpenLineup={setOpenLineupId}
      />

      <div className="max-w-[1100px] mx-auto px-6 py-8">
        {showSelector ? (
          <BookLineupSelector
            lineups={lineups}
            currentUserId={currentUserId!}
            isAdmin={isAdmin}
            bookmarks={bookmarks}
            viewerSteamId={viewerSteamId}
            myBooks={myBooks}
            openLineupId={openLineupId}
            onOpenLineupIdChange={setOpenLineupId}
          />
        ) : (
          <LineupGrid
            lineups={lineups}
            currentUserId={currentUserId}
            isAdmin={isAdmin}
            bookmarks={bookmarks}
            viewerSteamId={viewerSteamId}
            myBooks={myBooks}
            openLineupId={openLineupId}
            onOpenLineupIdChange={setOpenLineupId}
          />
        )}
      </div>
    </>
  )
}
