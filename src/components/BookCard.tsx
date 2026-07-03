"use client"

import Link from "next/link"
import { useState, useTransition } from "react"
import { deleteBook, copyBook } from "@/app/u/[steamId]/actions"

export function BookCard({
  steamId,
  book,
  isOwn,
}: {
  steamId: string
  book: { id: string; name: string; count: number }
  isOwn: boolean
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [hidden, setHidden] = useState(false)
  const [copied, setCopied] = useState(false)

  function handleDelete() {
    if (!confirm(`Supprimer le livre "${book.name}" ?`)) return
    setError(null)
    startTransition(async () => {
      try {
        await deleteBook(book.id)
        setHidden(true)
      } catch {
        setError("Échec de la suppression.")
      }
    })
  }

  function handleCopy() {
    setError(null)
    startTransition(async () => {
      try {
        await copyBook(book.id)
        setCopied(true)
      } catch {
        setError("Échec de la copie.")
      }
    })
  }

  if (hidden) return null

  return (
    <div className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 hover:border-zinc-700 transition-colors px-3 py-2">
      <Link href={`/u/${steamId}/books/${book.id}`} className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{book.name}</p>
        <p className="text-xs text-zinc-500">
          {book.count} lineup{book.count !== 1 ? "s" : ""}
        </p>
      </Link>

      {isOwn ? (
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          aria-label="Supprimer le livre"
          className="text-zinc-600 hover:text-red-400 transition-colors disabled:opacity-50 px-1"
        >
          ×
        </button>
      ) : (
        <button
          type="button"
          onClick={handleCopy}
          disabled={isPending || copied}
          className="text-[10px] px-2 py-1 rounded-md bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          {copied ? "Copié ✓" : isPending ? "..." : "Copier"}
        </button>
      )}
      {error && <p className="text-[10px] text-red-400">{error}</p>}
    </div>
  )
}
