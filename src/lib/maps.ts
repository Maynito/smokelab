import type { GrenadeType, MapName } from "@/types"

export const MAPS: MapName[] = [
  "mirage",
  "inferno",
  "dust2",
  "nuke",
  "overpass",
  "ancient",
  "anubis",
  "vertigo",
  "train",
  "cache",
]

export const GRENADE_TYPES: GrenadeType[] = ["smoke", "flash", "molotov", "he"]

export function isMapName(value: string): value is MapName {
  return (MAPS as string[]).includes(value)
}
