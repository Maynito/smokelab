import { getSession } from "@/lib/session"
import Link from "next/link"
import { MAPS } from "@/lib/maps"
import { MAP_ICONS, MAP_IMAGES } from "@/lib/mapImages"
import { SiteHeader } from "@/components/SiteHeader"

export default async function MapsPage() {
  const session = await getSession()

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <SiteHeader user={session.user ?? null} />

      <div className="max-w-[1100px] mx-auto px-6 py-8">
        <div className="flex items-baseline justify-between mb-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Bibliothèque
          </h2>
          <span className="text-xs text-zinc-500">{MAPS.length} maps</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {MAPS.map((map) => (
            <Link
              key={map}
              href={`/map/${map}`}
              className="group relative aspect-[2/3] rounded overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-orange-500 transition-colors duration-150 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/50"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={MAP_IMAGES[map]}
                alt=""
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />

              <div className="absolute top-1.5 left-1.5 w-7 h-7 rounded bg-black/60 backdrop-blur-sm flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={MAP_ICONS[map]} alt="" className="w-5 h-5 object-contain" />
              </div>

              <span className="absolute bottom-2 left-2 right-2 text-sm font-semibold capitalize drop-shadow">
                {map}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
