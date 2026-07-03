"use client"

import { useEffect } from "react"

export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-8">
      <div className="text-center space-y-4 max-w-sm">
        <h1 className="text-2xl font-bold">Un problème est survenu</h1>
        <p className="text-zinc-400 text-sm">
          Quelque chose s&apos;est mal passé. Réessaie, ou reviens plus tard si ça persiste.
        </p>
        {error.digest && <p className="text-zinc-600 text-xs">Référence : {error.digest}</p>}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => unstable_retry()}
            className="bg-orange-500 hover:bg-orange-600 transition-colors rounded-md px-4 py-2 text-sm font-medium"
          >
            Réessayer
          </button>
          <a href="/" className="text-sm text-zinc-400 hover:text-white">
            Retour à l&apos;accueil
          </a>
        </div>
      </div>
    </main>
  )
}
