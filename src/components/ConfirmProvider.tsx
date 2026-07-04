"use client"

import { createContext, useCallback, useContext, useEffect, useState } from "react"

type ConfirmOptions = {
  title: string
  message?: string
  confirmLabel?: string
}

type PendingConfirm = {
  opts: ConfirmOptions
  resolve: (confirmed: boolean) => void
}

const ConfirmContext = createContext<(opts: ConfirmOptions) => Promise<boolean>>(
  async () => false
)

// Remplace le confirm() natif du navigateur par une boîte de dialogue stylée :
//   const confirm = useConfirm()
//   if (!(await confirm({ title: "Supprimer ?" }))) return
export function useConfirm() {
  return useContext(ConfirmContext)
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [pending, setPending] = useState<PendingConfirm | null>(null)

  const confirm = useCallback(
    (opts: ConfirmOptions) =>
      new Promise<boolean>((resolve) => setPending({ opts, resolve })),
    []
  )

  function close(confirmed: boolean) {
    pending?.resolve(confirmed)
    setPending(null)
  }

  useEffect(() => {
    if (!pending) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") close(false)
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending])

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}

      {pending && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => close(false)} />
          <div
            role="alertdialog"
            aria-label={pending.opts.title}
            className="relative z-10 w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-lg p-5 space-y-4 animate-[toast-in_.15s_ease-out]"
          >
            <h3 className="text-sm font-semibold text-white">{pending.opts.title}</h3>
            {pending.opts.message && (
              <p className="text-sm text-zinc-400">{pending.opts.message}</p>
            )}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => close(false)}
                className="text-xs px-3 py-1.5 rounded-md text-zinc-400 hover:text-white transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                autoFocus
                onClick={() => close(true)}
                className="text-xs px-3 py-1.5 rounded-md bg-red-600 text-white hover:bg-red-500 transition-colors"
              >
                {pending.opts.confirmLabel ?? "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  )
}
