"use client"

import { useRef, useState } from "react"
import { flushSync } from "react-dom"
import { useZoomPan } from "@/lib/useZoomPan"

type Point = { x: number; y: number }

type DocumentWithViewTransitions = Document & {
  startViewTransition?: (callback: () => void) => unknown
}

function ExpandIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <path
        d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M3 16v3a2 2 0 0 0 2 2h3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CompressIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <path
        d="M9 3v3a2 2 0 0 1-2 2H4M15 3v3a2 2 0 0 0 2 2h3M4 16h3a2 2 0 0 1 2 2v3M20 16h-3a2 2 0 0 0-2 2v3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function RadarPicker({
  radarSrc,
  initialFrom,
  initialTo,
}: {
  radarSrc: string
  initialFrom?: Point
  initialTo?: Point
}) {
  const [fromPoint, setFromPoint] = useState<Point | null>(initialFrom ?? null)
  const [toPoint, setToPoint] = useState<Point | null>(initialTo ?? null)
  const [expanded, setExpanded] = useState(false)
  const { frameRef, view, handleMouseDown, reset: resetView } = useZoomPan()
  const contentRef = useRef<HTMLDivElement>(null)

  const step = !fromPoint ? "from" : !toPoint ? "to" : "done"

  function placePointAt(clientX: number, clientY: number) {
    if (step === "done" || !contentRef.current) return
    const rect = contentRef.current.getBoundingClientRect()
    const point = {
      x: Math.min(1, Math.max(0, (clientX - rect.left) / rect.width)),
      y: Math.min(1, Math.max(0, (clientY - rect.top) / rect.height)),
    }
    if (step === "from") setFromPoint(point)
    else setToPoint(point)
  }

  function reset() {
    setFromPoint(null)
    setToPoint(null)
  }

  function toggleExpanded() {
    const next = !expanded
    function apply() {
      setExpanded(next)
      resetView()
    }
    const doc = document as DocumentWithViewTransitions
    if (doc.startViewTransition) {
      doc.startViewTransition(() => flushSync(apply))
    } else {
      apply()
    }
  }

  return (
    <div>
      <div
        className={`fixed inset-0 z-40 bg-black/80 transition-opacity duration-300 ${
          expanded ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={toggleExpanded}
      />

      <div
        className={`[view-transition-name:radar-picker] ${
          expanded
            ? "fixed inset-0 z-50 m-auto flex w-fit flex-col items-center gap-2"
            : "relative"
        }`}
      >
        <p className="text-sm text-zinc-400">
          {step === "from" && "Clique sur le radar pour placer le point de départ"}
          {step === "to" && "Clique sur le radar pour placer le point d'arrivée"}
          {step === "done" && "Points placés — réinitialise pour recommencer"}
        </p>

        <div
          ref={frameRef}
          className={`relative select-none overflow-hidden rounded-lg border border-zinc-800 bg-black ${
            expanded ? "h-[80vh] w-[80vh] max-w-[90vw]" : "aspect-square w-full max-w-md"
          }`}
        >
          <div
            ref={contentRef}
            onMouseDown={(e) => handleMouseDown(e, (ev) => placePointAt(ev.clientX, ev.clientY))}
            className={`absolute inset-0 origin-top-left ${
              step === "done" ? (view.zoom > 1 ? "cursor-grab" : "") : "cursor-crosshair"
            }`}
            style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.zoom})` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={radarSrc} alt="" draggable={false} className="absolute inset-0 w-full h-full object-contain" />

            {fromPoint && toPoint && (
              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="absolute inset-0 w-full h-full pointer-events-none"
              >
                <line
                  x1={fromPoint.x * 100}
                  y1={fromPoint.y * 100}
                  x2={toPoint.x * 100}
                  y2={toPoint.y * 100}
                  stroke="rgb(249 115 22 / 0.8)"
                  strokeWidth="0.5"
                  strokeDasharray="2 1.5"
                />
              </svg>
            )}

            {fromPoint && (
              <div
                className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500 border-2 border-white shadow"
                style={{ left: `${fromPoint.x * 100}%`, top: `${fromPoint.y * 100}%` }}
              />
            )}
            {toPoint && (
              <div
                className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500 border-2 border-white shadow"
                style={{ left: `${toPoint.x * 100}%`, top: `${toPoint.y * 100}%` }}
              />
            )}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              toggleExpanded()
            }}
            aria-label={expanded ? "Réduire le radar" : "Agrandir le radar"}
            className="absolute top-2 right-2 z-10 rounded-md bg-black/60 p-1.5 text-white hover:bg-black/80 transition-colors"
          >
            {expanded ? <CompressIcon /> : <ExpandIcon />}
          </button>
        </div>

        {step === "done" && (
          <button
            type="button"
            onClick={reset}
            className="text-xs text-zinc-400 hover:text-white underline"
          >
            Réinitialiser les points
          </button>
        )}
      </div>

      <input type="hidden" name="from_x" value={fromPoint?.x ?? ""} />
      <input type="hidden" name="from_y" value={fromPoint?.y ?? ""} />
      <input type="hidden" name="to_x" value={toPoint?.x ?? ""} />
      <input type="hidden" name="to_y" value={toPoint?.y ?? ""} />
    </div>
  )
}
