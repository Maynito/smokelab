"use client"

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-8 antialiased">
        <div className="text-center space-y-4 max-w-sm">
          <h1 className="text-2xl font-bold">Un problème est survenu</h1>
          <p className="text-zinc-400 text-sm">
            L&apos;application a rencontré une erreur inattendue. Réessaie, ou reviens plus tard si
            ça persiste.
          </p>
          {error.digest && <p className="text-zinc-600 text-xs">Référence : {error.digest}</p>}
          <button
            type="button"
            onClick={() => unstable_retry()}
            className="bg-orange-500 hover:bg-orange-600 transition-colors rounded-md px-4 py-2 text-sm font-medium"
          >
            Réessayer
          </button>
        </div>
      </body>
    </html>
  )
}
