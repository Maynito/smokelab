"use client"

import { useState, useTransition } from "react"
import { createBook } from "@/app/u/[steamId]/actions"
import { MAPS } from "@/lib/maps"
import type { MapName } from "@/types"

export function CreateBookInline() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [map, setMap] = useState<MapName>("mirage")
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleCreate() {
    const trimmed = name.trim()
    if (!trimmed) return
    setError(null)
    startTransition(async () => {
      try {
        await createBook(trimmed, map)
        setName("")
        setOpen(false)
      } catch {
        setError("Échec de la création.")
      }
    })
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm px-3 py-2 rounded-md bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
      >
        + Nouveau livre
      </button>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 p-3">
      <select
        value={map}
        onChange={(e) => setMap(e.target.value as MapName)}
        className="bg-zinc-950 border border-zinc-800 rounded-md px-2 py-1.5 text-sm text-white capitalize focus:outline-none focus:border-orange-500"
      >
        {MAPS.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault()
            handleCreate()
          }
        }}
        placeholder="Nom du livre"
        className="flex-1 min-w-[120px] bg-zinc-950 border border-zinc-800 rounded-md px-2 py-1.5 text-sm text-white focus:outline-none focus:border-orange-500"
      />
      <button
        type="button"
        onClick={handleCreate}
        disabled={isPending || !name.trim()}
        className="text-sm px-3 py-1.5 rounded-md bg-orange-500 hover:bg-orange-600 transition-colors disabled:opacity-50"
      >
        Créer
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="text-sm text-zinc-500 hover:text-white"
      >
        Annuler
      </button>
      {error && <p className="text-xs text-red-400 w-full">{error}</p>}
    </div>
  )
}
