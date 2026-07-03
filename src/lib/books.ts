import { createAdminClient } from "@/lib/supabase"
import type { MapName } from "@/types"

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

export async function getBookmarkedLineupIds(userId: string) {
  const { data, error } = await createAdminClient()
    .from("book_lineups")
    .select("lineup_id, books!inner(user_id)")
    .eq("books.user_id", userId)

  if (error) throw error
  return new Set((data ?? []).map((row) => row.lineup_id as string))
}
