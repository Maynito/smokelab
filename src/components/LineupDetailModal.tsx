"use client"

import { useEffect, useState, useTransition } from "react"
import Link from "next/link"
import type { BookSummary, Lineup } from "@/types"
import { MAP_IMAGES } from "@/lib/mapImages"
import { MediaView } from "@/components/MediaView"
import { ZoomableMedia } from "@/components/ZoomableMedia"
import { TypeBadge, DifficultyDots } from "@/components/LineupBadges"
import { BookPicker } from "@/components/BookPicker"
import { deleteLineup } from "@/app/map/[map]/actions"
import { getLineupBookIds, setLineupBooks } from "@/app/u/[steamId]/actions"

export function LineupDetailModal({
  lineup,
  currentUserId,
  isAdmin,
  myBooks,
  onClose,
}: {
  lineup: Lineup
  currentUserId: string
  isAdmin: boolean
  myBooks: BookSummary[]
  onClose: () => void
}) {
  const [mediaView, setMediaView] = useState<"gif" | "stills">("gif")
  const [expandedMedia, setExpandedMedia] = useState<"lineup" | "result" | null>(null)
  const [isDeleting, startDeleteTransition] = useTransition()
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const [booksPickerOpen, setBooksPickerOpen] = useState(false)
  const [lineupBookIds, setLineupBookIdsState] = useState<string[] | null>(null)
  const [loadingBooks, startLoadingBooks] = useTransition()
  const [booksError, setBooksError] = useState<string | null>(null)

  const canManage = isAdmin || lineup.created_by === currentUserId
  const booksForThisMap = myBooks.filter((b) => b.map === lineup.map)

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return
      if (expandedMedia) setExpandedMedia(null)
      else onClose()
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [expandedMedia, onClose])

  function handleDelete() {
    if (!confirm("Supprimer définitivement cette lineup ?")) return
    setDeleteError(null)
    startDeleteTransition(async () => {
      try {
        await deleteLineup(lineup.id)
        onClose()
      } catch {
        setDeleteError("Impossible de supprimer cette lineup. Réessaie.")
      }
    })
  }

  function openBooksPicker() {
    setBooksError(null)
    startLoadingBooks(async () => {
      try {
        const ids = await getLineupBookIds(lineup.id)
        setLineupBookIdsState(ids)
        setBooksPickerOpen(true)
      } catch {
        setBooksError("Impossible de charger tes livres.")
      }
    })
  }

  async function handleSaveBooks(bookIds: string[]) {
    await setLineupBooks(lineup.id, bookIds)
    setLineupBookIdsState(bookIds)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />

      <div className="relative z-10 w-[80vw] h-[80vh] max-w-6xl bg-zinc-900 border border-zinc-800 rounded-lg overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="fixed top-4 right-4 z-20 rounded-md bg-black/60 p-1.5 text-white hover:bg-black/80 transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>

        <div className="aspect-video bg-black">
          {mediaView === "gif" ? (
            <MediaView
              src={lineup.media_gif}
              alt="Gif de la lineup"
              className="w-full h-full object-contain"
              controls
            />
          ) : (
            <div className="grid grid-cols-2 h-full gap-px bg-zinc-800">
              <ZoomableMedia
                src={lineup.media_lineup}
                alt="Visée / lineup"
                transitionClass="[view-transition-name:stills-lineup]"
                expanded={expandedMedia === "lineup"}
                onToggle={(next) => setExpandedMedia(next ? "lineup" : null)}
              />
              <ZoomableMedia
                src={lineup.media_result}
                alt="Résultat"
                transitionClass="[view-transition-name:stills-result]"
                expanded={expandedMedia === "result"}
                onToggle={(next) => setExpandedMedia(next ? "result" : null)}
              />
            </div>
          )}
        </div>

        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMediaView("gif")}
                className={`text-xs px-3 py-1.5 rounded-md transition-colors ${
                  mediaView === "gif"
                    ? "bg-orange-500 text-white"
                    : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                }`}
              >
                Gif
              </button>
              <button
                type="button"
                onClick={() => setMediaView("stills")}
                className={`text-xs px-3 py-1.5 rounded-md transition-colors ${
                  mediaView === "stills"
                    ? "bg-orange-500 text-white"
                    : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                }`}
              >
                Visée &amp; résultat
              </button>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={openBooksPicker}
                disabled={loadingBooks}
                className="text-xs px-3 py-1.5 rounded-md bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors disabled:opacity-50"
              >
                {loadingBooks ? "..." : "Mes livres"}
              </button>

              {canManage && (
                <Link
                  href={`/map/${lineup.map}/${lineup.id}/edit`}
                  className="text-xs px-3 py-1.5 rounded-md bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
                >
                  Modifier
                </Link>
              )}

              {canManage && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-xs px-3 py-1.5 rounded-md bg-red-950 text-red-400 hover:bg-red-900 hover:text-red-300 transition-colors disabled:opacity-50"
                >
                  {isDeleting ? "Suppression..." : "Supprimer"}
                </button>
              )}
            </div>
          </div>

          {(deleteError || booksError) && (
            <p className="text-xs text-red-400">{deleteError || booksError}</p>
          )}

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-sm font-medium text-white capitalize">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={MAP_IMAGES[lineup.map]} alt="" className="w-4 h-4 rounded-sm object-cover" />
              {lineup.map}
            </span>
            <TypeBadge type={lineup.type} />
            <DifficultyDots difficulty={lineup.difficulty} />
          </div>

          <p className="text-sm text-zinc-300">
            {lineup.from_pos} <span className="text-zinc-600">→</span> {lineup.to_pos}
          </p>

          {lineup.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {lineup.tags.map((tag) => (
                <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {booksPickerOpen && lineupBookIds && (
        <BookPicker
          map={lineup.map}
          books={booksForThisMap}
          initiallySelected={lineupBookIds}
          onClose={() => setBooksPickerOpen(false)}
          onSave={handleSaveBooks}
        />
      )}
    </div>
  )
}
