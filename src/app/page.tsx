import { getSession } from "@/lib/session"
import { redirect } from "next/navigation"
import Link from "next/link"
import { MAPS } from "@/lib/maps"
import { MAP_ICONS, MAP_IMAGES } from "@/lib/mapImages"

export default async function HomePage() {
  const session = await getSession()
  if (!session.user) redirect("/login")

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold">
          smoke<span className="text-orange-500">lab</span>
        </h1>
        <Link href="/my-book" className="text-sm text-zinc-400 hover:text-white">
          Mon livre
        </Link>
      </div>
      <p className="text-zinc-400 text-sm mb-8">Choisis une map</p>

      <div className="grid grid-cols-5 gap-4 max-w-[780px] mx-auto">
        {MAPS.map((map) => (
          <Link
            key={map}
            href={`/map/${map}`}
            className="group relative aspect-[1/3] rounded-lg overflow-hidden shadow-lg shadow-black/50 border border-zinc-800 hover:border-orange-500 transition-colors"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={MAP_IMAGES[map]}
              alt=""
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/30" />
            <div className="absolute inset-0 flex items-center justify-center p-2">
              <div className="absolute w-3/5 aspect-square rounded-full bg-black/50 blur-xl" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={MAP_ICONS[map]}
                alt={map}
                className="relative w-4/5 h-auto object-contain drop-shadow-lg"
              />
            </div>
            <span className="absolute bottom-2 inset-x-0 text-center text-lg font-semibold capitalize drop-shadow-md">
              {map}
            </span>
          </Link>
        ))}
      </div>
    </main>
  )
}
