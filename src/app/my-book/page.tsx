import { getSession } from "@/lib/session"
import { redirect } from "next/navigation"
import Link from "next/link"
import { createAdminClient } from "@/lib/supabase"
import { FilterBar } from "@/components/FilterBar"
import { LineupGrid } from "@/components/LineupGrid"
import type { Lineup } from "@/types"

async function getBookLineups(userId: string, filters: { type?: string; difficulty?: string }) {
  const { data, error } = await createAdminClient()
    .from("user_lineups")
    .select("lineups(*)")
    .eq("user_id", userId)
    .order("added_at", { ascending: false })

  if (error) throw error

  let lineups = ((data ?? []) as unknown as { lineups: Lineup | null }[])
    .map((row) => row.lineups)
    .filter((l): l is Lineup => l !== null)

  if (filters.type) lineups = lineups.filter((l) => l.type === filters.type)
  if (filters.difficulty) lineups = lineups.filter((l) => l.difficulty === Number(filters.difficulty))

  return lineups
}

export default async function MyBookPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; difficulty?: string }>
}) {
  const session = await getSession()
  if (!session.user) redirect("/login")

  const filters = await searchParams
  const lineups = await getBookLineups(session.user.id, filters)

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Mon livre</h1>
          <p className="text-zinc-400 text-sm">Tes lineups sauvegardées — {session.user.steam_name}</p>
        </div>
        <Link href="/" className="text-sm text-zinc-400 hover:text-white">
          ← Retour aux maps
        </Link>
      </div>

      <FilterBar />

      {lineups.length === 0 ? (
        <div className="text-zinc-500 text-sm">Aucune lineup sauvegardée pour l&apos;instant.</div>
      ) : (
        <LineupGrid
          lineups={lineups}
          currentUserId={session.user.id}
          isAdmin={session.user.is_admin}
          bookmarkedIds={lineups.map((l) => l.id)}
        />
      )}
    </main>
  )
}
