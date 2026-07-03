import { getSession } from "@/lib/session"
import { redirect, notFound } from "next/navigation"
import { createAdminClient } from "@/lib/supabase"
import { isMapName } from "@/lib/maps"
import { MAP_RADARS } from "@/lib/mapImages"
import { MapPoolView } from "@/components/MapPoolView"
import type { Lineup, MapName } from "@/types"

async function getLineups(map: MapName, filters: { type?: string; difficulty?: string }) {
  let query = createAdminClient()
    .from("lineups")
    .select("*")
    .eq("map", map)
    .order("created_at", { ascending: false })

  if (filters.type) query = query.eq("type", filters.type)
  if (filters.difficulty) query = query.eq("difficulty", Number(filters.difficulty))

  const { data, error } = await query
  if (error) throw error
  return data as Lineup[]
}

async function getBookmarkedIds(userId: string) {
  const { data, error } = await createAdminClient()
    .from("user_lineups")
    .select("lineup_id")
    .eq("user_id", userId)

  if (error) throw error
  return new Set((data ?? []).map((row) => row.lineup_id as string))
}

export default async function MapPage({
  params,
  searchParams,
}: {
  params: Promise<{ map: string }>
  searchParams: Promise<{ type?: string; difficulty?: string; book?: string }>
}) {
  const session = await getSession()
  if (!session.user) redirect("/login")

  const { map } = await params
  if (!isMapName(map)) notFound()

  const filters = await searchParams
  const [allLineups, bookmarkedIds] = await Promise.all([
    getLineups(map, filters),
    getBookmarkedIds(session.user.id),
  ])

  const lineups =
    filters.book === "mine"
      ? allLineups.filter((l) => bookmarkedIds.has(l.id))
      : filters.book === "not-mine"
        ? allLineups.filter((l) => !bookmarkedIds.has(l.id))
        : allLineups

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <MapPoolView
        map={map}
        radarSrc={MAP_RADARS[map]}
        lineups={lineups}
        currentUserId={session.user.id}
        isAdmin={session.user.is_admin}
        bookmarkedIds={[...bookmarkedIds]}
      />
    </main>
  )
}
