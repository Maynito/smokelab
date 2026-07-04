"use client"

import {
  Suspense,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

type ToastVariant = "success" | "error"
type Toast = { id: number; message: string; variant: ToastVariant }

const ToastContext = createContext<(message: string, variant?: ToastVariant) => void>(() => {})

export function useToast() {
  return useContext(ToastContext)
}

// Messages déclenchés via ?toast=<code> dans l'URL — utilisés par les Server
// Actions qui terminent sur un redirect() (impossible de toaster côté client
// dans ce cas, le composant appelant est démonté par la navigation).
const QUERY_TOASTS: Record<string, { message: string; variant: ToastVariant }> = {
  "lineup-pool-created": { message: "Lineup ajoutée au pool de la map.", variant: "success" },
  "lineup-created": {
    message: "Lineup créée — visible sur ton profil et dans tes livres.",
    variant: "success",
  },
  "lineup-updated": { message: "Modifications enregistrées.", variant: "success" },
}

function ToastFromQuery({ onToast }: { onToast: (m: string, v?: ToastVariant) => void }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const code = searchParams.get("toast")

  useEffect(() => {
    if (!code) return
    const known = QUERY_TOASTS[code]
    if (known) onToast(known.message, known.variant)
    const params = new URLSearchParams(searchParams)
    params.delete("toast")
    router.replace(params.size > 0 ? `${pathname}?${params}` : pathname, { scroll: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code])

  return null
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(0)

  const toast = useCallback((message: string, variant: ToastVariant = "success") => {
    const id = nextId.current++
    setToasts((t) => [...t, { id, message, variant }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4500)
  }, [])

  function dismiss(id: number) {
    setToasts((t) => t.filter((x) => x.id !== id))
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}

      <div aria-live="polite" className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-2.5 pl-3 pr-2 py-2.5 rounded-lg border shadow-xl text-sm animate-[toast-in_.18s_ease-out] ${
              t.variant === "error"
                ? "bg-red-950 border-red-900 text-red-200"
                : "bg-zinc-900 border-zinc-700 text-zinc-100"
            }`}
          >
            {t.variant === "error" ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 shrink-0 text-red-400">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v5M12 16.5v.5" strokeLinecap="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 shrink-0 text-orange-500">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            {t.message}
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Fermer la notification"
              className="ml-1 p-1 rounded text-zinc-500 hover:text-white transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <Suspense fallback={null}>
        <ToastFromQuery onToast={toast} />
      </Suspense>
    </ToastContext.Provider>
  )
}
