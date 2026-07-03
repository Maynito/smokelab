"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { GRENADE_TYPES } from "@/lib/maps"

const selectClass =
  "bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"

export function FilterBar({ showBookFilter = false }: { showBookFilter?: boolean }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-3 mb-8">
      <select
        className={selectClass}
        defaultValue={searchParams.get("type") ?? ""}
        onChange={(e) => updateFilter("type", e.target.value)}
      >
        <option value="">Tous les types</option>
        {GRENADE_TYPES.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>

      <select
        className={selectClass}
        defaultValue={searchParams.get("difficulty") ?? ""}
        onChange={(e) => updateFilter("difficulty", e.target.value)}
      >
        <option value="">Toutes difficultés</option>
        <option value="1">Facile</option>
        <option value="2">Moyen</option>
        <option value="3">Difficile</option>
      </select>

      {showBookFilter && (
        <select
          className={selectClass}
          defaultValue={searchParams.get("book") ?? ""}
          onChange={(e) => updateFilter("book", e.target.value)}
        >
          <option value="">Toutes les lineups</option>
          <option value="mine">Dans mon livre</option>
          <option value="not-mine">Hors de mon livre</option>
        </select>
      )}
    </div>
  )
}
