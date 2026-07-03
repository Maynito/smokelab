import type { GrenadeType } from "@/types"

function SmokeGlyph() {
  return (
    <>
      <path d="M9 20h6a2 2 0 0 0 2-2v-3H7v3a2 2 0 0 0 2 2Z" />
      <path d="M7 15h10l-1-4H8l-1 4Z" />
      <path d="M9 11V8h6v3" />
      <path d="M9 6c1-1 1-2 0-3M12 6c1-1.5 1-2.5 0-4M15 6c1-1 1-2 0-3" strokeLinecap="round" />
    </>
  )
}

function FlashGlyph() {
  return (
    <>
      <rect x="8" y="9" width="8" height="10" rx="1.5" />
      <path d="M10 9V6a2 2 0 0 1 4 0v3" />
      <path d="M4 6l2 2M20 6l-2 2M4 3.5l2.5 1M20 3.5l-2.5 1M12 2v3" strokeLinecap="round" />
    </>
  )
}

function MolotovGlyph() {
  return (
    <>
      <path d="M10 22h4a1 1 0 0 0 1-1v-8.5c0-1-1-1.5-1-2.5V7h-4v3c0 1-1 1.5-1 2.5V21a1 1 0 0 0 1 1Z" />
      <path d="M10.5 7V4h3v3" />
      <path d="M12 4V2" strokeLinecap="round" />
      <path
        d="M12 2c1 1 1.2 2 .3 2.6C11.4 5.2 11.6 6 12 6.4c1-.6 1.4-1.6.6-2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  )
}

function HeGlyph() {
  return (
    <>
      <circle cx="12" cy="13" r="7" />
      <path d="M9 13a3 3 0 0 1 6 0M9 16a3 3 0 0 0 6 0M12 6V3" strokeLinecap="round" />
      <path d="M9.5 3.5h5" strokeLinecap="round" />
      <circle cx="12" cy="2.5" r="1" fill="currentColor" stroke="none" />
    </>
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
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
      className={className}
    >
      <Glyph />
    </svg>
  )
}
