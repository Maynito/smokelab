"use client"

import { useEffect, useRef, useState } from "react"

export type ZoomPanView = { zoom: number; x: number; y: number }

const MIN_ZOOM = 1
const MAX_ZOOM = 3
const DRAG_THRESHOLD = 3

function clampPan(
  pan: { x: number; y: number },
  zoom: number,
  rect: { width: number; height: number }
) {
  const minX = rect.width * (1 - zoom)
  const minY = rect.height * (1 - zoom)
  return {
    x: Math.min(0, Math.max(minX, pan.x)),
    y: Math.min(0, Math.max(minY, pan.y)),
  }
}

/**
 * Wheel-zoom (anchored to the cursor) + drag-to-pan for a frame element.
 * `onClick` fires only when the pointer barely moved between mousedown/mouseup,
 * so a plain click still works even though drag is handled on the same element.
 */
export function useZoomPan() {
  const frameRef = useRef<HTMLDivElement>(null)
  const [view, setView] = useState<ZoomPanView>({ zoom: 1, x: 0, y: 0 })

  function reset() {
    setView({ zoom: 1, x: 0, y: 0 })
  }

  function handleMouseDown(e: React.MouseEvent, onClick?: (e: MouseEvent) => void) {
    if (e.button !== 0) return

    // Nothing to pan at the default zoom level — treat this as a plain click so a
    // few pixels of natural mouse jitter never gets misread as a drag.
    if (view.zoom <= MIN_ZOOM) {
      function onUpNoZoom(ev: MouseEvent) {
        window.removeEventListener("mouseup", onUpNoZoom)
        onClick?.(ev)
      }
      window.addEventListener("mouseup", onUpNoZoom)
      return
    }

    const startX = e.clientX
    const startY = e.clientY
    const startPan = { x: view.x, y: view.y }
    let moved = false

    function onMove(ev: MouseEvent) {
      const dx = ev.clientX - startX
      const dy = ev.clientY - startY
      if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) moved = true
      if (!moved || !frameRef.current) return
      const rect = frameRef.current.getBoundingClientRect()
      setView((v) => ({ ...v, ...clampPan({ x: startPan.x + dx, y: startPan.y + dy }, v.zoom, rect) }))
    }

    function onUp(ev: MouseEvent) {
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseup", onUp)
      if (!moved) onClick?.(ev)
    }

    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", onUp)
  }

  useEffect(() => {
    const el = frameRef.current
    if (!el) return

    function handleWheel(e: WheelEvent) {
      e.preventDefault()
      if (!frameRef.current) return
      const rect = frameRef.current.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top

      setView((v) => {
        const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, v.zoom - e.deltaY * 0.0015))
        const contentX = (mx - v.x) / v.zoom
        const contentY = (my - v.y) / v.zoom
        const pan = clampPan(
          { x: mx - contentX * newZoom, y: my - contentY * newZoom },
          newZoom,
          rect
        )
        return { zoom: newZoom, x: pan.x, y: pan.y }
      })
    }

    el.addEventListener("wheel", handleWheel, { passive: false })
    return () => el.removeEventListener("wheel", handleWheel)
  }, [])

  return { frameRef, view, setView, handleMouseDown, reset }
}
