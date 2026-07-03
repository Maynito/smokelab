"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleLogout() {
    startTransition(async () => {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/login")
      router.refresh()
    })
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isPending}
      className={className ?? "text-sm text-zinc-400 hover:text-white disabled:opacity-50"}
    >
      {isPending ? "..." : "Déconnexion"}
    </button>
  )
}
