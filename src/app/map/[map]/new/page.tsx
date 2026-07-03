import { getSession } from "@/lib/session"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { isMapName } from "@/lib/maps"
import { LineupForm } from "@/components/LineupForm"
import { SiteHeader } from "@/components/SiteHeader"
import { createLineup } from "../actions"

export default async function NewLineupPage({
  params,
}: {
  params: Promise<{ map: string }>
}) {
  const session = await getSession()
  if (!session.user) redirect("/login")

  const { map } = await params
  if (!isMapName(map)) notFound()

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <SiteHeader user={session.user} />
      <div className="max-w-[1100px] mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold capitalize">Nouvelle lineup — {map}</h1>
          <Link href={`/map/${map}`} className="text-sm text-zinc-400 hover:text-white">
            ← Annuler
          </Link>
        </div>

        <LineupForm map={map} action={createLineup} submitLabel="Créer la lineup" />
      </div>
    </main>
  )
}
