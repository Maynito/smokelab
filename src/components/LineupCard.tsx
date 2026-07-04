import type { Lineup } from "@/types"
import { MAP_IMAGES } from "@/lib/mapImages"
import { MediaView } from "@/components/MediaView"
import { TypeBadge, DifficultyDots, StatusBadge } from "@/components/LineupBadges"

export function LineupCard({
  lineup,
  onOpen,
}: {
  lineup: Lineup
  onOpen: () => void
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex flex-col h-full text-left w-full rounded-lg border border-zinc-800 bg-zinc-900 overflow-hidden hover:border-orange-500 transition-colors duration-150 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/50"
    >
      <div className="aspect-video bg-zinc-800 relative overflow-hidden shrink-0">
        <MediaView
          src={lineup.media_gif}
          alt={`${lineup.from_pos} → ${lineup.to_pos}`}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <TypeBadge type={lineup.type} className="absolute top-2 left-2 bg-zinc-950/80" />
        <StatusBadge status={lineup.status} className="absolute bottom-2 left-2 bg-zinc-950/80" />
      </div>

      <div className="p-3 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="flex items-center gap-1.5 text-sm font-medium text-white capitalize">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={MAP_IMAGES[lineup.map]} alt="" className="w-4 h-4 rounded-sm object-cover" />
            {lineup.map}
          </span>
          <DifficultyDots difficulty={lineup.difficulty} />
        </div>

        <p className="text-xs text-zinc-400 truncate">
          {lineup.from_pos} <span className="text-zinc-600">→</span> {lineup.to_pos}
        </p>

        {lineup.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-auto pt-2">
            {lineup.tags.map((tag) => (
              <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </button>
  )
}
