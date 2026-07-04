"use client"

import { useEffect, useRef, useState } from "react"
import type { BookSummary } from "@/types"

export function BookPreviewPicker({
  books,
  selectedIds,
  onChange,
}: {
  books: BookSummary[]
  selectedIds: Set<string>
  onChange: (ids: Set<string>) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onClickOutside)
    return () => document.removeEventListener("mousedown", onClickOutside)
  }, [open])

  function toggle(id: string) {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onChange(next)
  }

  const label =
    selectedIds.size === 0
      ? "Afficher mes livres sur le radar"
      : selectedIds.size === 1
        ? (books.find((b) => selectedIds.has(b.id))?.name ?? "1 livre")
        : `${selectedIds.size} livres affichés`

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 text-sm rounded-md border px-3 py-1.5 transition-colors ${
          selectedIds.size > 0
            ? "bg-orange-500/10 border-orange-500/40 text-orange-300"
            : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-600"
        }`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 shrink-0">
          <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H12v18H6.5A2.5 2.5 0 0 1 4 18.5v-13Z" strokeLinejoin="round" />
          <path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H12v18h5.5a2.5 2.5 0 0 0 2.5-2.5v-13Z" strokeLinejoin="round" />
        </svg>
        {label}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`w-3.5 h-3.5 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-20 mt-2 w-60 rounded-lg border border-zinc-800 bg-zinc-900 shadow-xl p-1.5">
          <div className="max-h-64 overflow-y-auto space-y-0.5">
            {books.map((book) => (
              <label
                key={book.id}
                className="flex items-center gap-2 text-sm text-zinc-300 hover:bg-zinc-800 rounded-md px-2 py-1.5 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.has(book.id)}
                  onChange={() => toggle(book.id)}
                  className="accent-orange-500"
                />
                {book.name}
              </label>
            ))}
          </div>
          {selectedIds.size > 0 && (
            <button
              type="button"
              onClick={() => onChange(new Set())}
              className="w-full text-left text-xs text-zinc-500 hover:text-white px-2 py-1.5 mt-0.5 border-t border-zinc-800"
            >
              Tout désélectionner
            </button>
          )}
        </div>
      )}
    </div>
  )
}
