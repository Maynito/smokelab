import { getSession } from "@/lib/session"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { isMapName } from "@/lib/maps"
import { getUserBooks } from "@/lib/books"
import { LineupForm } from "@/components/LineupForm"
import { SiteHeader } from "@/components/SiteHeader"
import { createLineup } from "../actions"

export default async function NewLineupPage({
  params,
  searchParams,
}: {
  params: Promise<{ map: string }>
  searchParams: Promise<{ bookId?: string }>
}) {
  const session = await getSession()
  if (!session.user) redirect("/login")

  const { map } = await params
  if (!isMapName(map)) notFound()

  const { bookId } = await searchParams
  const myBooks = await getUserBooks(session.user.id, map)

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

        {!session.user.is_admin && (
          <p className="mb-6 text-sm text-zinc-400 bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2">
            Ta lineup sera visible sur ton profil et pourra être rangée dans tes livres — elle ne
            rejoindra pas directement le pool de la map.
          </p>
        )}

        {session.user.is_admin && bookId && (
          <p className="mb-6 text-sm text-zinc-400 bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2">
            Créée depuis un livre, cette lineup restera dans ce livre — elle ne rejoindra pas
            directement le pool de la map.
          </p>
        )}

        <LineupForm
          map={map}
          action={createLineup}
          submitLabel="Créer la lineup"
          myBooks={myBooks}
          initialBookIds={bookId ? [bookId] : undefined}
          scopedBookId={bookId}
        />
      </div>
    </main>
  )
}
