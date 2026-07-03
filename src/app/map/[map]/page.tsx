import { getSession } from "@/lib/session"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { createAdminClient } from "@/lib/supabase"
import { isMapName } from "@/lib/maps"
import { MAP_RADARS } from "@/lib/mapImages"
import { FilterBar } from "@/components/FilterBar"
import { LineupCard } from "@/components/LineupCard"
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

export default async function MapPage({
  params,
  searchParams,
}: {
  params: Promise<{ map: string }>
  searchParams: Promise<{ type?: string; difficulty?: string }>
}) {
  const session = await getSession()
  if (!session.user) redirect("/login")

  const { map } = await params
  if (!isMapName(map)) notFound()

  const filters = await searchParams
  const lineups = await getLineups(map, filters)

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="relative w-full max-h-[60vh] bg-black flex justify-center border-b border-zinc-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={MAP_RADARS[map]} alt={map} className="h-full max-h-[60vh] object-contain" />
      </div>

      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold capitalize">{map}</h1>
          <Link href="/" className="text-sm text-zinc-400 hover:text-white">
            ← Retour aux maps
          </Link>
        </div>

        <div className="flex items-center justify-between mb-2">
          <FilterBar />
          <Link
            href={`/map/${map}/new`}
            className="mb-8 h-fit bg-orange-500 hover:bg-orange-600 transition-colors rounded-md px-4 py-2 text-sm font-medium"
          >
            + Ajouter une lineup
          </Link>
        </div>

        {lineups.length === 0 ? (
          <div className="text-zinc-500 text-sm">Aucune lineup ne correspond à ces filtres.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {lineups.map((lineup) => (
              <LineupCard key={lineup.id} lineup={lineup} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
