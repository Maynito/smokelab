import type { GrenadeType } from "@/types"

const TITLES: Record<GrenadeType, string> = {
  smoke: "Fumée (smoke)",
  flash: "Éclat de lumière (flash)",
  molotov: "Flammes (molotov)",
  he: "Explosion (HE)",
}

// Nuage de fumée : trois bouffées + base pleine
function SmokeGlyph() {
  return (
    <>
      <circle cx="7.5" cy="14.5" r="4" />
      <circle cx="12.5" cy="10.5" r="5" />
      <circle cx="16.5" cy="14.5" r="4" />
      <rect x="7.5" y="12.5" width="9" height="6" />
    </>
  )
}

// Éclat de lumière : étoile à 4 branches aux flancs concaves
function FlashGlyph() {
  return <path d="M12 3q1.8 7.2 9 9-7.2 1.8-9 9-1.8-7.2-9-9 7.2-1.8 9-9Z" />
}

// Flamme (silhouette Material "whatshot", recadrée dans la grille)
function MolotovGlyph() {
  return (
    <g transform="translate(1 1.4) scale(0.92)">
      <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67Z" />
    </g>
  )
}

// Explosion : éclat déchiqueté à 8 pointes
function HeGlyph() {
  return (
    <path d="M12 2.5 13.53 8.3 18.72 5.28 15.7 10.47 21.5 12 15.7 13.53 18.72 18.72 13.53 15.7 12 21.5 10.47 15.7 5.28 18.72 8.3 13.53 2.5 12 8.3 10.47 5.28 5.28 10.47 8.3Z" />
  )
}

const GLYPHS: Record<GrenadeType, () => React.JSX.Element> = {
  smoke: SmokeGlyph,
  flash: FlashGlyph,
  molotov: MolotovGlyph,
  he: HeGlyph,
}

export function GrenadeIcon({ type, className }: { type: GrenadeType; className?: string }) {
  const Glyph = GLYPHS[type]
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" role="img" className={className}>
      <title>{TITLES[type]}</title>
      <Glyph />
    </svg>
  )
}
