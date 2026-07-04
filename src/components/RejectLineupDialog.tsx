"use client"

import { useState, useTransition } from "react"

export function RejectLineupDialog({
  onClose,
  onReject,
}: {
  onClose: () => void
  onReject: (reason: string) => Promise<void>
}) {
  const [reason, setReason] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit() {
    if (!reason.trim()) {
      setError("Indique un motif de refus.")
      return
    }
    setError(null)
    startTransition(async () => {
      try {
        await onReject(reason.trim())
        onClose()
      } catch {
        setError("Échec du refus. Réessaie.")
      }
    })
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />

      <div className="relative z-10 w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-3">
        <h3 className="text-sm font-medium text-white">Refuser cette lineup</h3>
        <p className="text-xs text-zinc-400">
          Le motif sera envoyé en notification à son auteur.
        </p>

        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Ex : médias flous, position déjà couverte..."
          rows={3}
          autoFocus
          className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500 resize-none"
        />

        {error && <p className="text-xs text-red-400">{error}</p>}

        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-zinc-400 hover:text-white px-3 py-1.5"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className="text-xs px-3 py-1.5 rounded-md bg-red-600 hover:bg-red-500 transition-colors disabled:opacity-50"
          >
            {isPending ? "..." : "Refuser"}
          </button>
        </div>
      </div>
    </div>
  )
}
