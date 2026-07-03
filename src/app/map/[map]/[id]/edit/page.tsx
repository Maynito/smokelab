import { getSession } from "@/lib/session"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { createAdminClient } from "@/lib/supabase"
import { isMapName } from "@/lib/maps"
import { LineupForm } from "@/components/LineupForm"
import { SiteHeader } from "@/components/SiteHeader"
import { updateLineup } from "../../actions"
import type { Lineup } from "@/types"

export default async function EditLineupPage({
  params,
}: {
  params: Promise<{ map: string; id: string }>
}) {
  const session = await getSession()
  if (!session.user) redirect("/login")

  const { map, id } = await params
  if (!isMapName(map)) notFound()

  const { data, error } = await createAdminClient()
    .from("lineups")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !data) notFound()
  const lineup = data as Lineup

  const canEdit = session.user.is_admin || lineup.created_by === session.user.id
  if (!canEdit) redirect(`/map/${map}`)

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <SiteHeader user={session.user} />
      <div className="max-w-[1100px] mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold capitalize">Modifier la lineup — {map}</h1>
          <Link href={`/map/${map}`} className="text-sm text-zinc-400 hover:text-white">
            ← Annuler
          </Link>
        </div>

        <LineupForm
          map={map}
          action={updateLineup}
          submitLabel="Enregistrer les modifications"
          defaultValues={{
            id: lineup.id,
            type: lineup.type,
            difficulty: lineup.difficulty,
            from_pos: lineup.from_pos,
            to_pos: lineup.to_pos,
            from_x: lineup.from_x,
            from_y: lineup.from_y,
            to_x: lineup.to_x,
            to_y: lineup.to_y,
            tags: lineup.tags,
          }}
          currentMedia={{
            media_lineup: lineup.media_lineup,
            media_result: lineup.media_result,
            media_gif: lineup.media_gif,
          }}
        />
      </div>
    </main>
  )
}
