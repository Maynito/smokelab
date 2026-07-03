"use client"

import { useState } from "react"
import Link from "next/link"
import type { Lineup, MapName } from "@/types"
import { RadarViewer } from "@/components/RadarViewer"
import { FilterBar } from "@/components/FilterBar"
import { LineupGrid } from "@/components/LineupGrid"

export function MapPoolView({
  map,
  radarSrc,
  lineups,
  currentUserId,
  isAdmin,
  bookmarkedIds,
}: {
  map: MapName
  radarSrc: string
  lineups: Lineup[]
  currentUserId: string
  isAdmin: boolean
  bookmarkedIds: string[]
}) {
  const [openLineupId, setOpenLineupId] = useState<string | null>(null)

  return (
    <>
      <RadarViewer radarSrc={radarSrc} alt={map} lineups={lineups} onOpenLineup={setOpenLineupId} />

      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold capitalize">{map}</h1>
          <div className="flex items-center gap-4">
            <Link href="/my-book" className="text-sm text-zinc-400 hover:text-white">
              Mon livre
            </Link>
            <Link href="/" className="text-sm text-zinc-400 hover:text-white">
              ← Retour aux maps
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-between mb-2">
          <FilterBar showBookFilter />
          <Link
            href={`/map/${map}/new`}
            className="mb-8 h-fit bg-orange-500 hover:bg-orange-600 transition-colors rounded-md px-4 py-2 text-sm font-medium"
          >
            + Ajouter une lineup
          </Link>
        </div>

        {lineups.length === 0 ? (
          <div className="text-zinc-500 text-sm">Aucune lineup ne correspond à ces filtres.</div>
        ) : (
          <LineupGrid
            lineups={lineups}
            currentUserId={currentUserId}
            isAdmin={isAdmin}
            bookmarkedIds={bookmarkedIds}
            openLineupId={openLineupId}
            onOpenLineupIdChange={setOpenLineupId}
          />
        )}
      </div>
    </>
  )
}
