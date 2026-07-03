@AGENTS.md

# Project context: smokelab

Bibliothèque collaborative de lineups CS2 (pool global par map + livre personnel). Next.js 16 (App Router) + React 19 + TypeScript + Tailwind v4 + Supabase (Postgres + Storage) + iron-session + Steam OpenID.

See [README.md](./README.md) for setup/run instructions and [docs/USER_GUIDE.md](./docs/USER_GUIDE.md) for user-facing behavior.

## Conventions

- UI copy and comments are in **French**; code identifiers are in English.
- Styling is Tailwind utility classes inline, dark theme only (`bg-zinc-950`/`zinc-900` surfaces, `orange-500` accent). No CSS modules, no component library.
- No icon library is installed — icons are hand-written inline SVGs (see `RadarPicker.tsx`).
- Data fetching happens in Server Components; mutations go through Server Actions (`"use server"` files named `actions.ts` colocated with the route, e.g. `src/app/map/[map]/actions.ts`).

## Architecture decisions (non-obvious from code alone)

- **No Supabase Auth.** Auth is Steam OpenID 2.0 + a custom `iron-session` cookie (`src/lib/session.ts`). Because of this, `auth.uid()` is always `null` in Postgres — RLS policies that reference it (e.g. on `user_lineups`) are a fail-safe that blocks the anon key entirely, not a real per-user filter. **All reads/writes must go through `createAdminClient()`** (service role, bypasses RLS) from Server Components/Actions. The anon client exported from `src/lib/supabase.ts` is intentionally unusable for real queries from the browser — don't wire it up to fetch data client-side.
- **`users` table has RLS enabled with zero policies** (see `supabase/schema.sql`) — deliberate, since the anon key is public in the JS bundle and this table holds `steam_id`. Keep it that way; don't add an anon-facing policy without discussing it first.
- **Lineup positions** are normalized `from_x/from_y/to_x/to_y` (0–1, relative to the radar image), set by clicking in `RadarPicker.tsx`. `from_pos`/`to_pos` are separate free-text labels (e.g. "T Spawn") — don't conflate the two.
- **Media uploads** (`media_setup`/`media_aim`/`media_result`) go to the public Supabase Storage bucket `lineup-media`, created in `supabase/migrations/002_lineup_positions_and_storage.sql`. Uploaded server-side inside the `createLineup` action, never from the client.
- **Schema changes go in `supabase/migrations/NNN_description.sql`**, numbered sequentially — `schema.sql` is the original base and is not re-run after the first setup, so don't edit it for incremental changes; add a new migration file instead, and update `README.md`'s migration table/notes if the change is structural.
- **`next.config.ts`** sets `experimental.serverActions.bodySizeLimit` to `25mb` (default is 1MB) to allow media uploads through Server Actions — don't remove this without providing another upload path.
- **`RadarPicker.tsx`** uses the browser View Transitions API (`document.startViewTransition`, feature-detected with a graceful fallback) to animate the expand/collapse of the radar into a fullscreen overlay. Zoom is mouse-wheel driven and anchored to the cursor position (not centered); panning is drag-based and only engages past a small movement threshold so a plain click still places a point. If you touch the zoom/pan math, keep the click-vs-drag distinction — it's easy to accidentally break "click to place a point."
- **Map assets** (`public/maps` screenshots, `public/icons` veto emblems, `public/radars` top-down radars) were sourced from community GitHub mirrors of Valve's official CS2 game assets (see git history / prior session for sources), not hand-made — if adding a new map, look for the equivalent asset in the same repos rather than sourcing from elsewhere, to keep filenames/format consistent (`src/lib/mapImages.ts` maps `MapName` → path; some files have a `.png` extension but are actually WebP/JPEG under the hood — verify with `file` before assuming format).

## Known gaps / not yet built

- No logout button in the UI (the route `POST /api/auth/logout` exists and works, just isn't wired to a visible button anywhere).
- `my-book` page is a static placeholder — "save lineup to book" and the `user_lineups` read/write flow aren't implemented yet.
- No pagination/infinite scroll on the map pool grid.
