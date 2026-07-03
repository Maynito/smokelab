import { getSession } from "@/lib/session"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { createAdminClient } from "@/lib/supabase"
import { getUserBooks, getBookmarkedLineupIds } from "@/lib/books"
import { LineupGrid } from "@/components/LineupGrid"
import { BookLineupSelector } from "@/components/BookLineupSelector"
import { SiteHeader } from "@/components/SiteHeader"
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
  if (!session.user) redirect("/login")

  const { steamId, bookId } = await params
  const book = await getBook(bookId)
  if (!book || book.users?.steam_id !== steamId) notFound()

  const isOwnBook = book.user_id === session.user.id

  const [lineups, viewerBookmarkedIds, viewerBooksForMap] = await Promise.all([
    getBookLineups(bookId),
    getBookmarkedLineupIds(session.user.id),
    getUserBooks(session.user.id, book.map),
  ])

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <SiteHeader user={session.user} />
      <div className="max-w-[1100px] mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{book.name}</h1>
            <p className="text-zinc-400 text-sm capitalize">
              {book.map} — {lineups.length} lineup{lineups.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Link href={`/u/${steamId}`} className="text-sm text-zinc-400 hover:text-white">
            ← Retour au profil
          </Link>
        </div>

        {lineups.length === 0 ? (
          <div className="text-zinc-500 text-sm">Ce livre est vide.</div>
        ) : isOwnBook ? (
          <LineupGrid
            lineups={lineups}
            currentUserId={session.user.id}
            isAdmin={session.user.is_admin}
            bookmarkedIds={[...viewerBookmarkedIds]}
            myBooks={viewerBooksForMap}
          />
        ) : (
          <BookLineupSelector
            lineups={lineups}
            currentUserId={session.user.id}
            isAdmin={session.user.is_admin}
            bookmarkedIds={[...viewerBookmarkedIds]}
            myBooks={viewerBooksForMap}
          />
        )}
      </div>
    </main>
  )
}
