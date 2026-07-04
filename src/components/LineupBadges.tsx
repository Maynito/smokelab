import type { Lineup } from "@/types"
import { GrenadeIcon } from "@/components/GrenadeIcon"

export const TYPE_COLORS: Record<Lineup["type"], string> = {
  smoke: "bg-zinc-400/10 text-zinc-300 border-zinc-400/30",
  flash: "bg-yellow-400/10 text-yellow-300 border-yellow-400/30",
  molotov: "bg-orange-500/10 text-orange-400 border-orange-500/30",
  he: "bg-red-500/10 text-red-400 border-red-500/30",
}

export function DifficultyDots({ difficulty }: { difficulty: Lineup["difficulty"] }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3].map((n) => (
        <span
          key={n}
          className={`w-1.5 h-1.5 rounded-full ${n <= difficulty ? "bg-orange-500" : "bg-zinc-700"}`}
        />
      ))}
    </div>
  )
}

export function TypeBadge({ type, className }: { type: Lineup["type"]; className?: string }) {
  return (
    <span
      className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded border capitalize ${TYPE_COLORS[type]} ${className ?? ""}`}
    >
      <GrenadeIcon type={type} className="w-3.5 h-3.5" />
      {type}
    </span>
  )
}

const STATUS_LABELS: Partial<Record<Lineup["status"], string>> = {
  pending: "En attente",
  rejected: "Refusée",
}

const STATUS_COLORS: Partial<Record<Lineup["status"], string>> = {
  pending: "bg-yellow-400/10 text-yellow-300 border-yellow-400/30",
  rejected: "bg-red-500/10 text-red-400 border-red-500/30",
}

// N'affiche rien pour "personal"/"approved" — seuls "pending"/"rejected"
// sont des états qui méritent d'attirer l'oeil de l'auteur sur son profil.
export function StatusBadge({ status, className }: { status: Lineup["status"]; className?: string }) {
  const label = STATUS_LABELS[status]
  if (!label) return null

  return (
    <span
      className={`text-xs px-2 py-0.5 rounded border ${STATUS_COLORS[status]} ${className ?? ""}`}
    >
      {label}
    </span>
  )
}
