import type { Lineup } from "@/types"
import { MAP_IMAGES } from "@/lib/mapImages"
import { MediaView } from "@/components/MediaView"
import { TypeBadge, DifficultyDots } from "@/components/LineupBadges"

export function LineupCard({
  lineup,
  isBookmarked,
  onOpen,
}: {
  lineup: Lineup
  isBookmarked: boolean
  onOpen: () => void
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="text-left w-full rounded-lg border border-zinc-800 bg-zinc-900 overflow-hidden hover:border-zinc-700 transition-colors"
    >
      <div className="aspect-video bg-zinc-800 relative">
        <MediaView
          src={lineup.media_gif}
          alt={`${lineup.from_pos} → ${lineup.to_pos}`}
          className="w-full h-full object-cover"
        />
        <TypeBadge type={lineup.type} className="absolute top-2 left-2 bg-zinc-950/80" />
        {isBookmarked && (
          <span className="absolute top-2 right-2 rounded-full bg-orange-500 p-1 text-white">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
              <path d="M6 3a1 1 0 0 0-1 1v17l7-4 7 4V4a1 1 0 0 0-1-1H6Z" />
            </svg>
          </span>
        )}
      </div>

      <div className="p-3">
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
          <div className="flex flex-wrap gap-1 mt-2">
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
