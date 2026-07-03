import { getSession } from "@/lib/session"
import { redirect } from "next/navigation"

export default async function MyBookPage() {
  const session = await getSession()
  if (!session.user) redirect("/login")

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-8">
      <h1 className="text-2xl font-bold mb-2">Mon livre</h1>
      <p className="text-zinc-400 text-sm mb-8">
        Tes lineups sauvegardés — {session.user.steam_name}
      </p>

      {/* TODO: personal lineup grid */}
      <div className="text-zinc-500 text-sm">Aucun lineup sauvegardé pour l&apos;instant.</div>
    </main>
  )
}
