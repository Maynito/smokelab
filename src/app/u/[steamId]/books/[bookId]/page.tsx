import { getSession } from "@/lib/session"
import { notFound } from "next/navigation"
import Link from "next/link"
import { createAdminClient } from "@/lib/supabase"
import { getUserBooks, getBookmarkedLineupBooks } from "@/lib/books"
import { BookDetailView } from "@/components/BookDetailView"
import { SiteHeader } from "@/components/SiteHeader"
import { MAP_RADARS } from "@/lib/mapImages"
import type { Lineup, MapName } from "@/types"

async function getBook(bookId: string) {
  const { data, error } = await createAdminClient()
    .from("books")
    .select("id, name, map, user_id, users(steam_id)")
    .eq("id", bookId)
    .single()

  if (error || !data) return null
  return data as unknown as {
    id: string
    name: string
    map: MapName
    user_id: string
    users: { steam_id: string } | null
  }
}

async function getBookLineups(bookId: string) {
  const { data, error } = await createAdminClient()
    .from("book_lineups")
    .select("lineups(*)")
    .eq("book_id", bookId)

  if (error) throw error

  return ((data ?? []) as unknown as { lineups: Lineup | null }[])
    .map((row) => row.lineups)
    .filter((l): l is Lineup => l !== null)
}

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ steamId: string; bookId: string }>
}) {
  const session = await getSession()
  const viewer = session.user ?? null

  const { steamId, bookId } = await params
  const book = await getBook(bookId)
  if (!book || book.users?.steam_id !== steamId) notFound()

  const isOwnBook = viewer !== null && book.user_id === viewer.id

  const [lineups, viewerBookmarks, viewerBooksForMap] = await Promise.all([
    getBookLineups(bookId),
    viewer ? getBookmarkedLineupBooks(viewer.id) : Promise.resolve([]),
    viewer ? getUserBooks(viewer.id, book.map) : Promise.resolve([]),
  ])

  // Connecté sur le livre de quelqu'un d'autre : sélection multiple pour
  // copier des lineups dans ses propres livres. Sinon (son livre, ou invité) :
  // simple grille de consultation.
  const showSelector = viewer !== null && !isOwnBook

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <SiteHeader user={viewer} />

      <div className="max-w-[1100px] mx-auto px-6 pt-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{book.name}</h1>
            <p className="text-zinc-400 text-sm capitalize">
              {book.map} — {lineups.length} lineup{lineups.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {isOwnBook && (
              <Link
                href={`/map/${book.map}/new?bookId=${book.id}`}
                className="bg-orange-500 hover:bg-orange-600 transition-colors rounded-md px-4 py-2 text-sm font-medium whitespace-nowrap"
              >
                + Créer une lineup
              </Link>
            )}
            <Link href={`/u/${steamId}`} className="text-sm text-zinc-400 hover:text-white whitespace-nowrap">
              ← Retour au profil
            </Link>
          </div>
        </div>

        {lineups.length === 0 && (
          <div className="text-zinc-500 text-sm pb-8">Ce livre est vide.</div>
        )}
      </div>

      {lineups.length > 0 && (
        <BookDetailView
          map={book.map}
          radarSrc={MAP_RADARS[book.map]}
          lineups={lineups}
          showSelector={showSelector}
          currentUserId={viewer?.id ?? null}
          isAdmin={viewer?.is_admin ?? false}
          bookmarks={viewerBookmarks}
          viewerSteamId={viewer?.steam_id ?? null}
          myBooks={viewerBooksForMap}
        />
      )}
    </main>
  )
}
