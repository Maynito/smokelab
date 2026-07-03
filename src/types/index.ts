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
  media_setup: string
  media_aim: string
  media_result: string
  created_by: string
  created_at: string
}

export interface UserLineup {
  user_id: string
  lineup_id: string
  mastered: boolean
  note: string | null
  added_at: string
}

export interface User {
  id: string
  steam_id: string
  steam_name: string
  avatar_url: string
  created_at: string
}

export interface SessionUser {
  id: string
  steam_id: string
  steam_name: string
  avatar_url: string
}
