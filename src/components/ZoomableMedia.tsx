"use client"

import { flushSync } from "react-dom"
import { useZoomPan } from "@/lib/useZoomPan"
import { MediaView } from "@/components/MediaView"

type DocumentWithViewTransitions = Document & {
  startViewTransition?: (callback: () => void) => unknown
}

function runToggle(apply: () => void) {
  const doc = document as DocumentWithViewTransitions
  if (doc.startViewTransition) {
    doc.startViewTransition(() => flushSync(apply))
  } else {
    apply()
  }
}

export function ZoomableMedia({
  src,
  alt,
  transitionClass,
  expanded,
  onToggle,
}: {
  src: string
  alt: string
  transitionClass: string
  expanded: boolean
  onToggle: (next: boolean) => void
}) {
  const { frameRef, view, handleMouseDown } = useZoomPan()

  return (
    <>
      {/* Thumbnail: always mounted in its grid cell, geometry never changes,
          so its sibling never reflows when this one expands. */}
      <button
        type="button"
        onClick={() => runToggle(() => onToggle(true))}
        className={`relative w-full h-full cursor-zoom-in ${expanded ? "" : transitionClass}`}
      >
        <MediaView src={src} alt={alt} className="absolute inset-0 w-full h-full object-cover" />
      </button>

      {expanded && (
        <div className="fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/80" onClick={() => runToggle(() => onToggle(false))} />

          <div
            className={`relative z-10 mx-auto my-[5vh] w-[90vw] h-[90vh] ${transitionClass}`}
          >
            <div ref={frameRef} className="relative w-full h-full overflow-hidden rounded-lg bg-black">
              <div
                onMouseDown={(e) => handleMouseDown(e, () => runToggle(() => onToggle(false)))}
                className={`absolute inset-0 origin-top-left ${view.zoom > 1 ? "cursor-grab" : "cursor-zoom-out"}`}
                style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.zoom})` }}
              >
                <MediaView src={src} alt={alt} controls className="absolute inset-0 w-full h-full object-contain" />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
