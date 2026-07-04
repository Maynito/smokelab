import { createAdminClient } from "@/lib/supabase"
import type { Lineup, LineupBookmark, MapName } from "@/types"

export async function getUserBooks(userId: string, map?: MapName) {
  let query = createAdminClient()
    .from("books")
    .select("id, name, map")
    .eq("user_id", userId)
    .order("created_at")

  if (map) query = query.eq("map", map)

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function getUserBooksWithCounts(userId: string) {
  const admin = createAdminClient()

  const { data: books, error } = await admin
    .from("books")
    .select("id, name, map")
    .eq("user_id", userId)
    .order("created_at")

  if (error) throw error

  const bookIds = (books ?? []).map((b) => b.id as string)
  const counts = new Map<string, number>()

  if (bookIds.length > 0) {
    const { data: items } = await admin.from("book_lineups").select("book_id").in("book_id", bookIds)
    for (const item of items ?? []) {
      const id = item.book_id as string
      counts.set(id, (counts.get(id) ?? 0) + 1)
    }
  }

  return (books ?? []).map((b) => ({ ...b, count: counts.get(b.id as string) ?? 0 }))
}

// Pour la prévisualisation "mon livre" sur la map d'un pool : les lineups de
// tous les livres de l'utilisateur pour cette map, groupées par livre.
// Inclut ses lineups perso (non "approved") qui ne sont pas dans le pool.
export async function getUserBookLineupsForMap(userId: string, map: MapName) {
  const { data, error } = await createAdminClient()
    .from("book_lineups")
    .select("book_id, lineups(*), books!inner(user_id, map)")
    .eq("books.user_id", userId)
    .eq("books.map", map)

  if (error) throw error

  return ((data ?? []) as unknown as { book_id: string; lineups: Lineup | null }[])
    .filter((row): row is { book_id: string; lineups: Lineup } => row.lineups !== null)
    .map((row) => ({ bookId: row.book_id, lineup: row.lineups }))
}

// Pour le ruban "favori" sur une LineupCard : dans quel(s) livre(s) du viewer
// se trouve chaque lineup, afin que le ruban puisse renvoyer vers le livre.
export async function getBookmarkedLineupBooks(userId: string): Promise<LineupBookmark[]> {
  const { data, error } = await createAdminClient()
    .from("book_lineups")
    .select("lineup_id, book_id, books!inner(user_id, name)")
    .eq("books.user_id", userId)

  if (error) throw error

  return (data ?? []).map((row) => ({
    lineupId: row.lineup_id as string,
    bookId: row.book_id as string,
    bookName: (row.books as unknown as { name: string }).name,
  }))
}
