"use client"

import { useMemo, useState } from "react"

const DEFAULT_TAGS = [
  "one-way",
  "jump-throw",
  "run-throw",
  "walk-throw",
  "left-click",
  "no-jump-throw",
  "pixel-perfect",
  "quick",
  "safe",
  "retake",
  "execute",
  "anti-eco",
]

export function TagInput({ name = "tags", initialTags = [] }: { name?: string; initialTags?: string[] }) {
  const [tags, setTags] = useState<string[]>(initialTags)
  const [input, setInput] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)

  const suggestions = useMemo(() => {
    const query = input.trim().toLowerCase()
    return DEFAULT_TAGS.filter(
      (tag) => !tags.includes(tag) && (query === "" || tag.toLowerCase().includes(query))
    )
  }, [input, tags])

  function addTag(tag: string) {
    const trimmed = tag.trim()
    if (!trimmed || tags.includes(trimmed)) return
    setTags((t) => [...t, trimmed])
    setInput("")
  }

  function removeTag(tag: string) {
    setTags((t) => t.filter((x) => x !== tag))
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault()
      addTag(input)
    } else if (e.key === "Backspace" && input === "" && tags.length > 0) {
      removeTag(tags[tags.length - 1])
    }
  }

  return (
    <div className="relative">
      {tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => removeTag(tag)}
              title="Cliquer pour retirer"
              className="group flex items-center gap-1 bg-zinc-700 hover:bg-red-900/60 text-zinc-200 text-xs px-2 py-1 rounded-full transition-colors"
            >
              {tag}
              <span className="text-zinc-400 group-hover:text-red-300 leading-none">×</span>
              <input type="hidden" name={name} value={tag} />
            </button>
          ))}
          {tags.length > 1 && (
            <button
              type="button"
              onClick={() => setTags([])}
              className="text-xs text-zinc-500 hover:text-red-400 underline"
            >
              Tout effacer
            </button>
          )}
        </div>
      )}

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
        placeholder="Ajouter un tag..."
        className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
      />

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-zinc-900 border border-zinc-800 rounded-md overflow-hidden shadow-lg">
          {suggestions.map((tag) => (
            <button
              key={tag}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => addTag(tag)}
              className="block w-full text-left px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800"
            >
              {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
