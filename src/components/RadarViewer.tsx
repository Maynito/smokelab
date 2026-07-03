"use client"

import { useState } from "react"
import { useZoomPan } from "@/lib/useZoomPan"
import { GrenadeIcon } from "@/components/GrenadeIcon"
import { MediaView } from "@/components/MediaView"
import { TypeBadge, DifficultyDots } from "@/components/LineupBadges"
import { GRENADE_TYPES } from "@/lib/maps"
import type { Lineup } from "@/types"

const TYPE_DOT: Record<Lineup["type"], string> = {
  smoke: "bg-zinc-300 text-zinc-900",
  flash: "bg-yellow-300 text-yellow-950",
  molotov: "bg-orange-500 text-white",
  he: "bg-red-500 text-white",
}

const TYPE_BUTTON_ACTIVE: Record<Lineup["type"], string> = {
  smoke: "bg-zinc-300 text-zinc-900 border-zinc-300",
  flash: "bg-yellow-300 text-yellow-950 border-yellow-300",
  molotov: "bg-orange-500 text-white border-orange-500",
  he: "bg-red-500 text-white border-red-500",
}

const CLUSTER_THRESHOLD = 0.025

type PointCluster = { key: string; x: number; y: number; items: Lineup[] }

function clusterByPosition(
  lineups: Lineup[],
  getX: (l: Lineup) => number,
  getY: (l: Lineup) => number
): PointCluster[] {
  const clusters: { x: number; y: number; items: Lineup[] }[] = []

  for (const lineup of lineups) {
    const x = getX(lineup)
    const y = getY(lineup)
    const existing = clusters.find((c) => Math.hypot(c.x - x, c.y - y) < CLUSTER_THRESHOLD)
    if (existing) {
      existing.items.push(lineup)
      existing.x = existing.items.reduce((sum, l) => sum + getX(l), 0) / existing.items.length
      existing.y = existing.items.reduce((sum, l) => sum + getY(l), 0) / existing.items.length
    } else {
      clusters.push({ x, y, items: [lineup] })
    }
  }

  return clusters.map((c) => ({
    ...c,
    key: c.items
      .map((l) => l.id)
      .sort()
      .join(","),
  }))
}

function HoverPreview({ lineup }: { lineup: Lineup }) {
  return (
    <div className="w-40 rounded-lg border border-zinc-700 bg-zinc-900 shadow-xl overflow-hidden">
      <div className="aspect-video bg-black">
        <MediaView src={lineup.media_gif} alt="" className="w-full h-full object-cover" />
      </div>
      <div className="p-2 space-y-1">
        <div className="flex items-center justify-between gap-1">
          <TypeBadge type={lineup.type} />
          <DifficultyDots difficulty={lineup.difficulty} />
        </div>
        <p className="text-[11px] text-zinc-300 truncate">
          {lineup.from_pos} <span className="text-zinc-600">→</span> {lineup.to_pos}
        </p>
      </div>
    </div>
  )
}

export function RadarViewer({
  radarSrc,
  alt,
  lineups = [],
  selectedType,
  onSelectType,
  onOpenLineup,
}: {
  radarSrc: string
  alt: string
  lineups?: Lineup[]
  selectedType: Lineup["type"]
  onSelectType: (type: Lineup["type"]) => void
  onOpenLineup?: (lineupId: string) => void
}) {
  const { frameRef, view, handleMouseDown, reset } = useZoomPan()
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const visibleLineups = lineups.filter((l) => l.type === selectedType)
  const fromClusters = clusterByPosition(visibleLineups, (l) => l.from_x, (l) => l.from_y)
  const selectedCluster = fromClusters.find((c) => c.key === selectedKey) ?? null
  const landingClusters = selectedCluster
    ? clusterByPosition(selectedCluster.items, (l) => l.to_x, (l) => l.to_y)
    : []

  function selectType(type: Lineup["type"]) {
    onSelectType(type)
    setSelectedKey(null)
  }

  function hoverHandlers(id: string) {
    return {
      onMouseEnter: () => setHoveredId(id),
      onMouseLeave: () => setHoveredId((h) => (h === id ? null : h)),
    }
  }

  return (
    <div className="w-full bg-black border-b border-zinc-800 flex flex-col items-center gap-3 py-4">
      <div className="flex gap-2">
        {GRENADE_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => selectType(type)}
            className={`flex items-center gap-1.5 text-xs capitalize px-3 py-1.5 rounded-md border transition-colors ${
              selectedType === type
                ? TYPE_BUTTON_ACTIVE[type]
                : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-600"
            }`}
          >
            <GrenadeIcon type={type} className="w-4 h-4" />
            {type}
          </button>
        ))}
      </div>

      <div
        ref={frameRef}
        className="relative aspect-square h-[55vh] max-w-full overflow-hidden rounded-lg"
      >
        <div
          onMouseDown={(e) => handleMouseDown(e, () => setSelectedKey(null))}
          className={`absolute inset-0 origin-top-left ${view.zoom > 1 ? "cursor-grab" : ""}`}
          style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.zoom})` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={radarSrc}
            alt={alt}
            draggable={false}
            className="absolute inset-0 w-full h-full object-contain"
          />

          {selectedCluster && (
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="absolute inset-0 w-full h-full pointer-events-none"
            >
              {landingClusters.map((lc) => (
                <line
                  key={lc.key}
                  x1={selectedCluster.x * 100}
                  y1={selectedCluster.y * 100}
                  x2={lc.x * 100}
                  y2={lc.y * 100}
                  stroke="white"
                  strokeWidth="0.4"
                  strokeDasharray="1.5 1.2"
                  opacity="0.85"
                />
              ))}
            </svg>
          )}

          {selectedCluster &&
            landingClusters.map((lc) => {
              const boxWidth = Math.max(60, lc.items.length * 22)
              return (
                <div
                  key={lc.key}
                  className="group absolute"
                  style={{
                    left: `${lc.x * 100}%`,
                    top: `${lc.y * 100}%`,
                    width: boxWidth,
                    height: 44,
                    transform: "translate(-50%, -100%)",
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  {/* single lineup here: directly clickable, with its own hover preview */}
                  {lc.items.length === 1 && (
                    <button
                      type="button"
                      {...hoverHandlers(lc.items[0].id)}
                      onClick={(e) => {
                        e.stopPropagation()
                        onOpenLineup?.(lc.items[0].id)
                      }}
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-white bg-black/70 hover:bg-orange-500 transition-colors cursor-pointer"
                    >
                      {hoveredId === lc.items[0].id && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-30 pointer-events-none">
                          <HoverPreview lineup={lc.items[0]} />
                        </div>
                      )}
                    </button>
                  )}

                  {/* several lineups land here: base dot with count, hover reveals one circle per lineup */}
                  {lc.items.length > 1 && (
                    <>
                      <div
                        title={`${lc.items.length} lineups ici — survole pour choisir`}
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-white bg-black/70"
                      >
                        <span className="absolute -top-1.5 -right-1.5 min-w-[13px] h-3.5 px-0.5 rounded-full bg-orange-500 text-white text-[9px] leading-3.5 font-medium text-center">
                          {lc.items.length}
                        </span>
                      </div>

                      <div className="absolute inset-0 opacity-0 pointer-events-none transition-opacity group-hover:opacity-100 group-hover:pointer-events-auto">
                        {lc.items.map((lineup, i) => {
                          const offset = (i - (lc.items.length - 1) / 2) * 22
                          return (
                            <button
                              key={lineup.id}
                              type="button"
                              {...hoverHandlers(lineup.id)}
                              onMouseDown={(e) => e.stopPropagation()}
                              onClick={(e) => {
                                e.stopPropagation()
                                onOpenLineup?.(lineup.id)
                              }}
                              className="absolute top-0 -translate-x-1/2 w-3.5 h-3.5 rounded-full border-2 border-white bg-black hover:bg-orange-500 transition-colors"
                              style={{ left: `calc(50% + ${offset}px)` }}
                            >
                              {hoveredId === lineup.id && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-30 pointer-events-none">
                                  <HoverPreview lineup={lineup} />
                                </div>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    </>
                  )}
                </div>
              )
            })}

          {fromClusters.map((cluster) => {
            const type = cluster.items[0].type
            return (
              <button
                key={cluster.key}
                type="button"
                title={
                  cluster.items.length > 1
                    ? cluster.items.map((l) => `${l.type} — ${l.from_pos} → ${l.to_pos}`).join("\n")
                    : undefined
                }
                {...(cluster.items.length === 1 ? hoverHandlers(cluster.items[0].id) : {})}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedKey((k) => (k === cluster.key ? null : cluster.key))
                }}
                className={`absolute w-5 h-5 -translate-x-1/2 -translate-y-1/2 rounded-full border shadow flex items-center justify-center transition-transform hover:scale-110 ${TYPE_DOT[type]} ${
                  selectedKey === cluster.key ? "border-white ring-2 ring-white" : "border-black/40"
                }`}
                style={{ left: `${cluster.x * 100}%`, top: `${cluster.y * 100}%` }}
              >
                <GrenadeIcon type={type} className="w-3 h-3" />
                {cluster.items.length > 1 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-3.5 px-0.5 rounded-full bg-orange-500 text-white text-[9px] leading-3.5 font-medium text-center">
                    {cluster.items.length}
                  </span>
                )}
                {hoveredId === cluster.items[0].id && cluster.items.length === 1 && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-30 pointer-events-none">
                    <HoverPreview lineup={cluster.items[0]} />
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {view.zoom > 1 && (
          <button
            type="button"
            onClick={reset}
            className="absolute top-2 right-2 z-10 rounded-md bg-black/60 px-2 py-1 text-xs text-white hover:bg-black/80 transition-colors"
          >
            Réinitialiser la vue
          </button>
        )}
      </div>
    </div>
  )
}
