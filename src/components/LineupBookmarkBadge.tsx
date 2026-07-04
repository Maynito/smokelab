import Link from "next/link"
import type { LineupBookmark } from "@/types"

// Ruban "favori" superposé en haut à droite d'une LineupCard — rendu par le
// parent (LineupGrid/BookLineupSelector) en dehors du bouton de la card pour
// pouvoir naviguer sans déclencher l'ouverture de la modale au clic.
export function LineupBookmarkBadge({
  bookmarks,
  viewerSteamId,
}: {
  bookmarks: LineupBookmark[]
  viewerSteamId: string | null
}) {
  if (bookmarks.length === 0) return null

  const sorted = [...bookmarks].sort((a, b) => a.bookName.localeCompare(b.bookName))
  const title =
    sorted.length === 1
      ? `Dans le livre « ${sorted[0].bookName} »`
      : `Dans ${sorted.length} livres : ${sorted.map((b) => b.bookName).join(", ")}`

  const icon = (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
      <path d="M6 3a1 1 0 0 0-1 1v17l7-4 7 4V4a1 1 0 0 0-1-1H6Z" />
    </svg>
  )

  if (!viewerSteamId) {
    return (
      <span
        title={title}
        className="absolute top-2 right-2 z-10 rounded-full bg-orange-500 p-1 text-white"
      >
        {icon}
      </span>
    )
  }

  return (
    <Link
      href={`/u/${viewerSteamId}/books/${sorted[0].bookId}`}
      title={title}
      onClick={(e) => e.stopPropagation()}
      className="absolute top-2 right-2 z-10 rounded-full bg-orange-500 hover:bg-orange-600 transition-colors p-1 text-white"
    >
      {icon}
    </Link>
  )
}
