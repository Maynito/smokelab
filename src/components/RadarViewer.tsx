"use client"

import { useState } from "react"
import { useZoomPan } from "@/lib/useZoomPan"
import { GrenadeIcon } from "@/components/GrenadeIcon"
import type { Lineup } from "@/types"

const TYPE_DOT: Record<Lineup["type"], string> = {
  smoke: "bg-zinc-300 text-zinc-900",
  flash: "bg-yellow-300 text-yellow-950",
  molotov: "bg-orange-500 text-white",
  he: "bg-red-500 text-white",
}

const CLUSTER_THRESHOLD = 0.025

type Cluster = { key: string; x: number; y: number; lineups: Lineup[] }

function clusterLineups(lineups: Lineup[]): Cluster[] {
  const clusters: Cluster[] = []

  for (const lineup of lineups) {
    const existing = clusters.find(
      (c) => Math.hypot(c.x - lineup.from_x, c.y - lineup.from_y) < CLUSTER_THRESHOLD
    )
    if (existing) {
      existing.lineups.push(lineup)
      existing.x = existing.lineups.reduce((sum, l) => sum + l.from_x, 0) / existing.lineups.length
      existing.y = existing.lineups.reduce((sum, l) => sum + l.from_y, 0) / existing.lineups.length
    } else {
      clusters.push({ key: lineup.id, x: lineup.from_x, y: lineup.from_y, lineups: [lineup] })
    }
  }

  for (const cluster of clusters) {
    cluster.key = cluster.lineups
      .map((l) => l.id)
      .sort()
      .join(",")
  }

  return clusters
}

export function RadarViewer({
  radarSrc,
  alt,
  lineups = [],
  onOpenLineup,
}: {
  radarSrc: string
  alt: string
  lineups?: Lineup[]
  onOpenLineup?: (lineupId: string) => void
}) {
  const { frameRef, view, handleMouseDown, reset } = useZoomPan()
  const [selectedKey, setSelectedKey] = useState<string | null>(null)

  const clusters = clusterLineups(lineups)
  const selectedCluster = clusters.find((c) => c.key === selectedKey) ?? null

  return (
    <div className="w-full bg-black border-b border-zinc-800 flex justify-center py-4">
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
              {selectedCluster.lineups.map((lineup) => (
                <line
                  key={lineup.id}
                  x1={selectedCluster.x * 100}
                  y1={selectedCluster.y * 100}
                  x2={lineup.to_x * 100}
                  y2={lineup.to_y * 100}
                  stroke="white"
                  strokeWidth="0.4"
                  strokeDasharray="1.5 1.2"
                  opacity="0.85"
                />
              ))}
            </svg>
          )}

          {selectedCluster &&
            selectedCluster.lineups.map((lineup) => (
              <button
                key={lineup.id}
                type="button"
                title={`Ouvrir : ${lineup.from_pos} → ${lineup.to_pos}`}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation()
                  onOpenLineup?.(lineup.id)
                }}
                className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-black/70 hover:bg-orange-500 transition-colors"
                style={{ left: `${lineup.to_x * 100}%`, top: `${lineup.to_y * 100}%` }}
              />
            ))}

          {clusters.map((cluster) => {
            const type = cluster.lineups[0].type
            return (
              <button
                key={cluster.key}
                type="button"
                title={cluster.lineups
                  .map((l) => `${l.type} — ${l.from_pos} → ${l.to_pos}`)
                  .join("\n")}
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
                {cluster.lineups.length > 1 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-3.5 px-0.5 rounded-full bg-orange-500 text-white text-[9px] leading-3.5 font-medium text-center">
                    {cluster.lineups.length}
                  </span>
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
