import { getSession } from "@/lib/session"
import { redirect, notFound } from "next/navigation"
import { createAdminClient } from "@/lib/supabase"
import { isMapName } from "@/lib/maps"
import { MAP_RADARS } from "@/lib/mapImages"
import { MapPoolView } from "@/components/MapPoolView"
import { SiteHeader } from "@/components/SiteHeader"
import { getUserBooks, getBookmarkedLineupIds } from "@/lib/books"
import type { Lineup, MapName } from "@/types"

async function getLineups(map: MapName) {
  const { data, error } = await createAdminClient()
    .from("lineups")
    .select("*")
    .eq("map", map)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data as Lineup[]
}

export default async function MapPage({
  params,
}: {
  params: Promise<{ map: string }>
}) {
  const session = await getSession()
  if (!session.user) redirect("/login")

  const { map } = await params
  if (!isMapName(map)) notFound()

  const [lineups, bookmarkedIds, myBooks] = await Promise.all([
    getLineups(map),
    getBookmarkedLineupIds(session.user.id),
    getUserBooks(session.user.id),
  ])

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <SiteHeader user={session.user} />
      <MapPoolView
        map={map}
        radarSrc={MAP_RADARS[map]}
        lineups={lineups}
        currentUserId={session.user.id}
        isAdmin={session.user.is_admin}
        bookmarkedIds={[...bookmarkedIds]}
        myBooks={myBooks}
      />
    </main>
  )
}
