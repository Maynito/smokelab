"use client"

import { useState, useTransition } from "react"
import { createBook } from "@/app/u/[steamId]/actions"
import type { MapName } from "@/types"

export function BookPicker({
  map,
  books,
  initiallySelected,
  onClose,
  onSave,
}: {
  map: MapName
  books: { id: string; name: string }[]
  initiallySelected: string[]
  onClose: () => void
  onSave: (bookIds: string[]) => Promise<void>
}) {
  const [localBooks, setLocalBooks] = useState(books)
  const [selected, setSelected] = useState<Set<string>>(new Set(initiallySelected))
  const [newName, setNewName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isCreating, startCreating] = useTransition()
  const [isSaving, startSaving] = useTransition()

  function toggle(id: string) {
    setSelected((s) => {
      const next = new Set(s)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleCreate() {
    const name = newName.trim()
    if (!name) return
    setError(null)
    startCreating(async () => {
      try {
        const book = await createBook(name, map)
        setLocalBooks((b) => [...b, book])
        setSelected((s) => new Set([...s, book.id]))
        setNewName("")
      } catch {
        setError("Impossible de créer le livre.")
      }
    })
  }

  function handleSave() {
    setError(null)
    startSaving(async () => {
      try {
        await onSave([...selected])
        onClose()
      } catch {
        setError("Échec de l'enregistrement.")
      }
    })
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />

      <div className="relative z-10 w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-3">
        <h3 className="text-sm font-medium text-white capitalize">Livres — {map}</h3>

        <div className="max-h-56 overflow-y-auto space-y-1">
          {localBooks.length === 0 && (
            <p className="text-xs text-zinc-500">Tu n&apos;as pas encore de livre pour cette map.</p>
          )}
          {localBooks.map((book) => (
            <label
              key={book.id}
              className="flex items-center gap-2 text-sm text-zinc-300 hover:bg-zinc-800 rounded-md px-2 py-1.5 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selected.has(book.id)}
                onChange={() => toggle(book.id)}
                className="accent-orange-500"
              />
              {book.name}
            </label>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                handleCreate()
              }
            }}
            placeholder="Nouveau livre..."
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-md px-2 py-1.5 text-sm text-white focus:outline-none focus:border-orange-500"
          />
          <button
            type="button"
            onClick={handleCreate}
            disabled={isCreating || !newName.trim()}
            className="text-xs px-3 py-1.5 rounded-md bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors disabled:opacity-50"
          >
            Créer
          </button>
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-zinc-400 hover:text-white px-3 py-1.5"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="text-xs px-3 py-1.5 rounded-md bg-orange-500 hover:bg-orange-600 transition-colors disabled:opacity-50"
          >
            {isSaving ? "..." : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  )
}
