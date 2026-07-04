"use client"

import { useState } from "react"
import type { BookSummary, Lineup, LineupBookmark } from "@/types"
import { LineupCard } from "@/components/LineupCard"
import { LineupBookmarkBadge } from "@/components/LineupBookmarkBadge"
import { LineupDetailModal } from "@/components/LineupDetailModal"
import { BookPicker } from "@/components/BookPicker"
import { useToast } from "@/components/ToastProvider"
import { addLineupsToBooks } from "@/app/u/[steamId]/actions"

export function BookLineupSelector({
  lineups,
  currentUserId,
  isAdmin,
  bookmarks,
  viewerSteamId,
  myBooks,
  openLineupId: controlledOpenId,
  onOpenLineupIdChange,
}: {
  lineups: Lineup[]
  currentUserId: string
  isAdmin: boolean
  bookmarks: LineupBookmark[]
  viewerSteamId: string | null
  myBooks: BookSummary[]
  openLineupId?: string | null
  onOpenLineupIdChange?: (id: string | null) => void
}) {
  const toast = useToast()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [internalOpenId, setInternalOpenId] = useState<string | null>(null)
  const openLineupId = controlledOpenId !== undefined ? controlledOpenId : internalOpenId
  const setOpenLineupId = onOpenLineupIdChange ?? setInternalOpenId
  const [pickerOpen, setPickerOpen] = useState(false)

  const map = lineups[0]?.map
  const openLineup = lineups.find((l) => l.id === openLineupId) ?? null

  function toggleSelect(id: string) {
    setSelected((s) => {
      const next = new Set(s)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleSave(bookIds: string[]) {
    const count = selected.size
    await addLineupsToBooks([...selected], bookIds)
    setSelected(new Set())
    toast(`${count} lineup${count !== 1 ? "s" : ""} ajoutée${count !== 1 ? "s" : ""} à tes livres.`)
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 pb-20">
        {lineups.map((lineup) => (
          <div key={lineup.id} className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                toggleSelect(lineup.id)
              }}
              onMouseDown={(e) => e.stopPropagation()}
              aria-label="Sélectionner"
              className={`absolute top-2 left-2 z-10 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                selected.has(lineup.id) ? "bg-orange-500 border-orange-500" : "bg-black/60 border-white"
              }`}
            >
              {selected.has(lineup.id) && (
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-3 h-3">
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
            <LineupCard lineup={lineup} onOpen={() => setOpenLineupId(lineup.id)} />
            <LineupBookmarkBadge
              bookmarks={bookmarks.filter((b) => b.lineupId === lineup.id)}
              viewerSteamId={viewerSteamId}
            />
          </div>
        ))}
      </div>

      {selected.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl px-4 py-3 flex items-center gap-3">
          <span className="text-sm text-zinc-300">{selected.size} sélectionnée(s)</span>
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="text-xs px-3 py-1.5 rounded-md bg-orange-500 hover:bg-orange-600 transition-colors"
          >
            Ajouter à mes livres
          </button>
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="text-xs text-zinc-500 hover:text-white"
          >
            Annuler
          </button>
        </div>
      )}

      {pickerOpen && map && (
        <BookPicker
          map={map}
          books={myBooks}
          initiallySelected={[]}
          onClose={() => setPickerOpen(false)}
          onSave={handleSave}
        />
      )}

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
