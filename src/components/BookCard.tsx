"use client"

import Link from "next/link"
import { useState, useTransition } from "react"
import { useToast } from "@/components/ToastProvider"
import { useConfirm } from "@/components/ConfirmProvider"
import { deleteBook, copyBook } from "@/app/u/[steamId]/actions"
import { MAP_IMAGES } from "@/lib/mapImages"
import type { MapName } from "@/types"

export function BookCard({
  steamId,
  book,
  canDelete,
  canCopy,
}: {
  steamId: string
  book: { id: string; name: string; map: MapName; count: number }
  canDelete: boolean
  canCopy: boolean
}) {
  const toast = useToast()
  const confirm = useConfirm()
  const [isPending, startTransition] = useTransition()
  const [hidden, setHidden] = useState(false)
  const [copied, setCopied] = useState(false)

  async function handleDelete() {
    const ok = await confirm({
      title: `Supprimer le livre « ${book.name} » ?`,
      message: `Ses ${book.count} lineup${book.count !== 1 ? "s" : ""} n'en seront pas supprimées, seulement retirées du livre.`,
      confirmLabel: "Supprimer",
    })
    if (!ok) return
    startTransition(async () => {
      try {
        await deleteBook(book.id)
        setHidden(true)
        toast("Livre supprimé.")
      } catch {
        toast("Impossible de supprimer ce livre. Réessaie.", "error")
      }
    })
  }

  function handleCopy() {
    startTransition(async () => {
      try {
        await copyBook(book.id)
        setCopied(true)
        toast(`Livre « ${book.name} » copié dans ton profil.`)
      } catch {
        toast("Impossible de copier ce livre. Réessaie.", "error")
      }
    })
  }

  if (hidden) return null

  return (
    <div className="relative flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 hover:border-orange-500 transition-colors duration-150 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/50 px-3 py-2 overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={MAP_IMAGES[book.map]} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 from-35% via-zinc-900/75 to-transparent" />

      <Link href={`/u/${steamId}/books/${book.id}`} className="relative flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{book.name}</p>
        <p className="text-xs text-zinc-300">
          {book.count} lineup{book.count !== 1 ? "s" : ""}
        </p>
      </Link>

      {canDelete && (
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          aria-label="Supprimer le livre"
          className="relative text-zinc-400 hover:text-red-400 transition-colors disabled:opacity-50 px-1"
        >
          ×
        </button>
      )}
      {canCopy && (
        <button
          type="button"
          onClick={handleCopy}
          disabled={isPending || copied}
          className="relative text-[10px] px-2 py-1 rounded-md bg-zinc-800/90 text-zinc-200 hover:bg-zinc-700 transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          {copied ? "Copié ✓" : isPending ? "..." : "Copier"}
        </button>
      )}
    </div>
  )
}
