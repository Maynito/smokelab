"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import type { BookSummary, Lineup, LineupBookmark, MapName } from "@/types"
import type { Role } from "@/lib/roles"
import { RadarViewer } from "@/components/RadarViewer"
import { LineupGrid } from "@/components/LineupGrid"
import { BookPreviewPicker } from "@/components/BookPreviewPicker"

// Ouvre directement une lineup depuis un lien de notification
// (`/map/<map>?lineup=<id>`) : bascule sur le bon onglet/type puis nettoie
// l'URL, isolé dans son propre composant car useSearchParams l'exige.
function LineupDeepLink({
  lineups,
  pendingLineups,
  onOpen,
}: {
  lineups: Lineup[]
  pendingLineups: Lineup[]
  onOpen: (lineup: Lineup) => void
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const targetId = searchParams.get("lineup")

  useEffect(() => {
    if (!targetId) return
    const target = lineups.find((l) => l.id === targetId) ?? pendingLineups.find((l) => l.id === targetId)
    if (target) onOpen(target)

    const params = new URLSearchParams(searchParams)
    params.delete("lineup")
    router.replace(params.size > 0 ? `${pathname}?${params}` : pathname, { scroll: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetId])

  return null
}

export function MapPoolView({
  map,
  radarSrc,
  lineups,
  pendingLineups,
  role,
  currentUserId,
  bookmarks,
  viewerSteamId,
  myBooks,
  myBookLineups,
}: {
  map: MapName
  radarSrc: string
  lineups: Lineup[]
  pendingLineups: Lineup[]
  role: Role
  currentUserId: string | null
  bookmarks: LineupBookmark[]
  viewerSteamId: string | null
  myBooks: BookSummary[]
  myBookLineups: { bookId: string; lineup: Lineup }[]
}) {
  const [activeTab, setActiveTab] = useState<"pool" | "proposals">("pool")
  const [openLineupId, setOpenLineupId] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<Lineup["type"]>("smoke")
  const [previewBookIds, setPreviewBookIds] = useState<Set<string>>(new Set())

  const isPoolTab = activeTab === "pool"

  // Aperçu perso : les lineups des livres sélectionnés se superposent au
  // radar ET à la grille en dessous, uniquement côté client de l'utilisateur
  // qui a fait le choix — n'affecte ni le pool ni ce que voient les autres
  // visiteurs. Non pertinent sur l'onglet "Propositions" (file de revue, pas
  // de contexte personnel).
  const previewLineups =
    isPoolTab ? myBookLineups.filter((bl) => previewBookIds.has(bl.bookId)).map((bl) => bl.lineup) : []

  const sourceLineups = isPoolTab
    ? previewLineups.length > 0
      ? [...new Map([...lineups, ...previewLineups].map((l) => [l.id, l])).values()]
      : lineups
    : pendingLineups

  const visibleLineups = sourceLineups.filter((l) => l.type === selectedType)

  return (
    <>
      <Suspense fallback={null}>
        <LineupDeepLink
          lineups={lineups}
          pendingLineups={pendingLineups}
          onOpen={(target) => {
            setActiveTab(target.status === "pending" ? "proposals" : "pool")
            setSelectedType(target.type)
            setOpenLineupId(target.id)
          }}
        />
      </Suspense>

      <RadarViewer
        radarSrc={radarSrc}
        alt={map}
        lineups={sourceLineups}
        selectedType={selectedType}
        onSelectType={setSelectedType}
        onOpenLineup={setOpenLineupId}
      />

      <div className="max-w-[1100px] mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold capitalize">{map}</h1>
          {role === "admin" && (
            <Link
              href={`/map/${map}/new`}
              className="bg-orange-500 hover:bg-orange-600 transition-colors rounded-md px-4 py-2 text-sm font-medium"
            >
              + Ajouter une lineup
            </Link>
          )}
          {role === "user" && (
            <Link
              href={`/map/${map}/new`}
              className="bg-zinc-800 hover:bg-zinc-700 transition-colors rounded-md px-4 py-2 text-sm font-medium text-zinc-200"
            >
              + Créer une lineup perso
            </Link>
          )}
        </div>

        {role === "admin" && (
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => setActiveTab("pool")}
              className={`text-sm px-3 py-1.5 rounded-md border transition-colors ${
                isPoolTab
                  ? "bg-orange-500 text-white border-orange-500"
                  : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-600"
              }`}
            >
              Pool
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("proposals")}
              className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md border transition-colors ${
                !isPoolTab
                  ? "bg-orange-500 text-white border-orange-500"
                  : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-600"
              }`}
            >
              Propositions
              {pendingLineups.length > 0 && (
                <span
                  className={`min-w-[18px] h-[18px] px-1 rounded-full text-[10px] leading-[18px] text-center font-medium ${
                    isPoolTab ? "bg-orange-500/20 text-orange-300" : "bg-white/20 text-white"
                  }`}
                >
                  {pendingLineups.length}
                </span>
              )}
            </button>
          </div>
        )}

        {isPoolTab && myBooks.length > 0 && (
          <div className="mb-6">
            <BookPreviewPicker books={myBooks} selectedIds={previewBookIds} onChange={setPreviewBookIds} />
          </div>
        )}

        {visibleLineups.length === 0 ? (
          <div className="text-zinc-500 text-sm">
            {isPoolTab ? "Aucune lineup de ce type pour l'instant." : "Aucune proposition de ce type pour l'instant."}
          </div>
        ) : (
          <LineupGrid
            lineups={visibleLineups}
            currentUserId={currentUserId}
            isAdmin={role === "admin"}
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
