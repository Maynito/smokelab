import { getSession } from "@/lib/session"
import { notFound } from "next/navigation"
import { createAdminClient } from "@/lib/supabase"
import { isMapName } from "@/lib/maps"
import { roleOf } from "@/lib/roles"
import { MAP_RADARS } from "@/lib/mapImages"
import { MapPoolView } from "@/components/MapPoolView"
import { SiteHeader } from "@/components/SiteHeader"
import { getUserBooks, getBookmarkedLineupBooks, getUserBookLineupsForMap } from "@/lib/books"
import type { Lineup, MapName } from "@/types"

// Le pool d'une map n'affiche que les lineups validées — les lineups perso
// des utilisateurs vivent sur leur profil et dans leurs livres.
async function getPoolLineups(map: MapName) {
  const { data, error } = await createAdminClient()
    .from("lineups")
    .select("*")
    .eq("map", map)
    .eq("status", "approved")
    .order("created_at", { ascending: false })

  if (error) throw error
  return data as Lineup[]
}

// Onglet "Propositions", admin uniquement — les lineups en attente de revue.
async function getPendingLineups(map: MapName) {
  const { data, error } = await createAdminClient()
    .from("lineups")
    .select("*")
    .eq("map", map)
    .eq("status", "pending")
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
  const user = session.user ?? null

  const { map } = await params
  if (!isMapName(map)) notFound()

  const role = roleOf(user)

  const [lineups, pendingLineups, bookmarks, myBooks, myBookLineups] = await Promise.all([
    getPoolLineups(map),
    role === "admin" ? getPendingLineups(map) : Promise.resolve([]),
    user ? getBookmarkedLineupBooks(user.id) : Promise.resolve([]),
    user ? getUserBooks(user.id, map) : Promise.resolve([]),
    user ? getUserBookLineupsForMap(user.id, map) : Promise.resolve([]),
  ])

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <SiteHeader user={user} />
      <MapPoolView
        map={map}
        radarSrc={MAP_RADARS[map]}
        lineups={lineups}
        pendingLineups={pendingLineups}
        role={role}
        currentUserId={user?.id ?? null}
        bookmarks={bookmarks}
        viewerSteamId={user?.steam_id ?? null}
        myBooks={myBooks}
        myBookLineups={myBookLineups}
      />
    </main>
  )
}
