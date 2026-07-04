export type GrenadeType = "smoke" | "flash" | "molotov" | "he"

export type MapName =
  | "mirage"
  | "inferno"
  | "dust2"
  | "nuke"
  | "overpass"
  | "ancient"
  | "anubis"
  | "vertigo"
  | "train"
  | "cache"

export type Difficulty = 1 | 2 | 3

export type LineupStatus = "personal" | "pending" | "approved" | "rejected"

export interface Lineup {
  id: string
  map: MapName
  type: GrenadeType
  from_pos: string
  to_pos: string
  from_x: number
  from_y: number
  to_x: number
  to_y: number
  tags: string[]
  difficulty: Difficulty
  media_lineup: string
  media_result: string
  media_gif: string
  status: LineupStatus
  rejection_reason: string | null
  created_by: string
  created_at: string
}

export interface Book {
  id: string
  user_id: string
  map: MapName
  name: string
  created_at: string
}

export type BookSummary = Pick<Book, "id" | "name" | "map">

// Un lineup dans un de mes livres — utilisé pour lier le ruban "favori"
// affiché sur une LineupCard vers le livre précis qui la contient.
export interface LineupBookmark {
  lineupId: string
  bookId: string
  bookName: string
}

export interface BookLineup {
  book_id: string
  lineup_id: string
  mastered: boolean
  note: string | null
  added_at: string
}

export interface Follow {
  follower_id: string
  followed_id: string
  created_at: string
}

export interface User {
  id: string
  steam_id: string
  steam_name: string
  avatar_url: string
  is_admin: boolean
  created_at: string
}

export interface SessionUser {
  id: string
  steam_id: string
  steam_name: string
  avatar_url: string
  is_admin: boolean
}

export type NotificationType = "lineup_proposed" | "lineup_approved" | "lineup_rejected"

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  message: string
  link: string | null
  read: boolean
  created_at: string
}
