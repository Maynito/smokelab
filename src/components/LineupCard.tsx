import type { Lineup } from "@/types"
import { MAP_IMAGES } from "@/lib/mapImages"

const TYPE_COLORS: Record<Lineup["type"], string> = {
  smoke: "bg-zinc-400/10 text-zinc-300 border-zinc-400/30",
  flash: "bg-yellow-400/10 text-yellow-300 border-yellow-400/30",
  molotov: "bg-orange-500/10 text-orange-400 border-orange-500/30",
  he: "bg-red-500/10 text-red-400 border-red-500/30",
}

export function LineupCard({ lineup }: { lineup: Lineup }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 overflow-hidden hover:border-zinc-700 transition-colors">
      <div className="aspect-video bg-zinc-800 relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={lineup.media_setup}
          alt={`${lineup.from_pos} → ${lineup.to_pos}`}
          className="w-full h-full object-cover"
        />
        <span
          className={`absolute top-2 left-2 text-xs px-2 py-0.5 rounded border capitalize ${TYPE_COLORS[lineup.type]}`}
        >
          {lineup.type}
        </span>
      </div>

      <div className="p-3">
        <div className="flex items-center justify-between mb-1">
          <span className="flex items-center gap-1.5 text-sm font-medium text-white capitalize">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={MAP_IMAGES[lineup.map]}
              alt=""
              className="w-4 h-4 rounded-sm object-cover"
            />
            {lineup.map}
          </span>
          <div className="flex gap-0.5">
            {[1, 2, 3].map((n) => (
              <span
                key={n}
                className={`w-1.5 h-1.5 rounded-full ${n <= lineup.difficulty ? "bg-orange-500" : "bg-zinc-700"}`}
              />
            ))}
          </div>
        </div>

        <p className="text-xs text-zinc-400 truncate">
          {lineup.from_pos} <span className="text-zinc-600">→</span> {lineup.to_pos}
        </p>

        {lineup.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {lineup.tags.map((tag) => (
              <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
