import type { MapName } from "@/types"

// Screenshots en jeu (non utilisées actuellement, gardées pour plus tard)
export const MAP_IMAGES: Record<MapName, string> = {
  mirage: "/maps/mirage.webp",
  inferno: "/maps/inferno.png",
  dust2: "/maps/dust2.jpg",
  nuke: "/maps/nuke.jpg",
  overpass: "/maps/overpass.webp",
  ancient: "/maps/ancient.webp",
  anubis: "/maps/anubis.jpg",
  vertigo: "/maps/vertigo.png",
  train: "/maps/train.png",
  cache: "/maps/cache.jpg",
}

// Icônes/emblèmes de map (écran de veto), utilisées pour la galerie de sélection
export const MAP_ICONS: Record<MapName, string> = {
  mirage: "/icons/mirage.png",
  inferno: "/icons/inferno.png",
  dust2: "/icons/dust2.png",
  nuke: "/icons/nuke.png",
  overpass: "/icons/overpass.png",
  ancient: "/icons/ancient.png",
  anubis: "/icons/anubis.png",
  vertigo: "/icons/vertigo.png",
  train: "/icons/train.png",
  cache: "/icons/cache.png",
}

// Radars vus du dessus, utilisées comme fond pour placer les lineups
export const MAP_RADARS: Record<MapName, string> = {
  mirage: "/radars/mirage.png",
  inferno: "/radars/inferno.png",
  dust2: "/radars/dust2.png",
  nuke: "/radars/nuke.png",
  overpass: "/radars/overpass.png",
  ancient: "/radars/ancient.png",
  anubis: "/radars/anubis.png",
  vertigo: "/radars/vertigo.png",
  train: "/radars/train.png",
  cache: "/radars/cache.png",
}
