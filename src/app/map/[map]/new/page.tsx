import { getSession } from "@/lib/session"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { isMapName, GRENADE_TYPES } from "@/lib/maps"
import { MAP_RADARS } from "@/lib/mapImages"
import { RadarPicker } from "@/components/RadarPicker"
import { TagInput } from "@/components/TagInput"
import { createLineup } from "../actions"

const inputClass =
  "w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"

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
    <main className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold capitalize">Nouvelle lineup — {map}</h1>
        <Link href={`/map/${map}`} className="text-sm text-zinc-400 hover:text-white">
          ← Annuler
        </Link>
      </div>

      <form action={createLineup} className="grid gap-6 lg:grid-cols-2 max-w-4xl">
        <input type="hidden" name="map" value={map} />

        <div>
          <RadarPicker radarSrc={MAP_RADARS[map]} />
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Type</label>
              <select name="type" required className={inputClass}>
                {GRENADE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Difficulté</label>
              <select name="difficulty" required className={inputClass}>
                <option value="1">Facile</option>
                <option value="2">Moyen</option>
                <option value="3">Difficile</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Point de départ</label>
              <input name="from_pos" required placeholder="T Spawn" className={inputClass} />
            </div>
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Point d&apos;arrivée</label>
              <input name="to_pos" required placeholder="Window" className={inputClass} />
            </div>
          </div>

          <div>
            <label className="text-xs text-zinc-400 mb-1 block">Tags</label>
            <TagInput name="tags" />
          </div>

          <div>
            <label className="text-xs text-zinc-400 mb-1 block">Média — visée / lineup</label>
            <input type="file" name="media_lineup" accept="image/*,video/*" required className={inputClass} />
          </div>
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">Média — résultat</label>
            <input type="file" name="media_result" accept="image/*,video/*" required className={inputClass} />
          </div>
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">Média — gif</label>
            <input type="file" name="media_gif" accept="image/gif,video/*" required className={inputClass} />
          </div>

          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 transition-colors rounded-md py-2 text-sm font-medium"
          >
            Créer la lineup
          </button>
        </div>
      </form>
    </main>
  )
}
