import type { SessionUser } from "@/types"

// Trois rangs : invité (pas de session), utilisateur normal, admin.
// Le rang invité n'existe pas en base — c'est simplement l'absence de session.
export type Role = "guest" | "user" | "admin"

export function roleOf(user: SessionUser | null | undefined): Role {
  if (!user) return "guest"
  return user.is_admin ? "admin" : "user"
}

// Qui peut quoi — garder les règles ici plutôt qu'éparpillées dans les
// composants. Les Server Actions restent la vraie barrière : ces helpers
// sont réutilisés des deux côtés.
export const can = {
  // Créer une lineup (admin : dans le pool de la map, user : perso sur son profil)
  createLineup: (role: Role) => role !== "guest",
  // Publier directement dans le pool d'une map
  publishToPool: (role: Role) => role === "admin",
  // Utiliser les livres (créer, ranger des lineups) / suivre quelqu'un
  useBooks: (role: Role) => role !== "guest",
  follow: (role: Role) => role !== "guest",
  // Gérer (modifier/supprimer) une lineup précise
  manageLineup: (
    user: Pick<SessionUser, "id" | "is_admin"> | null | undefined,
    lineup: { created_by: string }
  ) => !!user && (user.is_admin || lineup.created_by === user.id),
  // Gérer un livre précis
  manageBook: (
    user: Pick<SessionUser, "id" | "is_admin"> | null | undefined,
    book: { user_id: string }
  ) => !!user && (user.is_admin || book.user_id === user.id),
  // Proposer sa lineup perso (ou refusée) au pool d'une map
  proposeLineup: (
    user: Pick<SessionUser, "id"> | null | undefined,
    lineup: { created_by: string; status: string }
  ) =>
    !!user &&
    lineup.created_by === user.id &&
    (lineup.status === "personal" || lineup.status === "rejected"),
  // Valider/refuser une lineup proposée
  reviewLineup: (role: Role) => role === "admin",
}
