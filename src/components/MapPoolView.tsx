"use client"

import { useState } from "react"
import Link from "next/link"
import type { BookSummary, Lineup, MapName } from "@/types"
import { RadarViewer } from "@/components/RadarViewer"
import { LineupGrid } from "@/components/LineupGrid"

export function MapPoolView({
  map,
  radarSrc,
  lineups,
  currentUserId,
  isAdmin,
  bookmarkedIds,
  myBooks,
}: {
  map: MapName
  radarSrc: string
  lineups: Lineup[]
  currentUserId: string
  isAdmin: boolean
  bookmarkedIds: string[]
  myBooks: BookSummary[]
}) {
  const [openLineupId, setOpenLineupId] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<Lineup["type"]>("smoke")

  const visibleLineups = lineups.filter((l) => l.type === selectedType)

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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold capitalize">{map}</h1>
          <Link
            href={`/map/${map}/new`}
            className="bg-orange-500 hover:bg-orange-600 transition-colors rounded-md px-4 py-2 text-sm font-medium"
          >
            + Ajouter une lineup
          </Link>
        </div>

        {visibleLineups.length === 0 ? (
          <div className="text-zinc-500 text-sm">Aucune lineup de ce type pour l&apos;instant.</div>
        ) : (
          <LineupGrid
            lineups={visibleLineups}
            currentUserId={currentUserId}
            isAdmin={isAdmin}
            bookmarkedIds={bookmarkedIds}
            myBooks={myBooks}
            openLineupId={openLineupId}
            onOpenLineupIdChange={setOpenLineupId}
          />
        )}
      </div>
    </>
  )
}
