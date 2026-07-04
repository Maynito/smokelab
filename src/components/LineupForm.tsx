"use client"

import { useActionState } from "react"
import { GRENADE_TYPES } from "@/lib/maps"
import { MAP_RADARS } from "@/lib/mapImages"
import { RadarPicker } from "@/components/RadarPicker"
import { TagInput } from "@/components/TagInput"
import { MediaView } from "@/components/MediaView"
import type { LineupFormState } from "@/app/map/[map]/actions"
import type { BookSummary, Difficulty, GrenadeType, MapName } from "@/types"

const inputClass =
  "w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"

type DefaultValues = {
  id: string
  type: GrenadeType
  difficulty: Difficulty
  from_pos: string
  to_pos: string
  from_x: number
  from_y: number
  to_x: number
  to_y: number
  tags: string[]
}

type CurrentMedia = {
  media_lineup: string
  media_result: string
  media_gif: string
}

export function LineupForm({
  map,
  action,
  submitLabel,
  defaultValues,
  currentMedia,
  myBooks,
  initialBookIds,
  scopedBookId,
}: {
  map: MapName
  action: (prevState: LineupFormState, formData: FormData) => Promise<LineupFormState>
  submitLabel: string
  defaultValues?: DefaultValues
  currentMedia?: CurrentMedia
  // Livres du viewer pour cette map — proposés uniquement à la création, pour
  // ranger la lineup directement dedans (édition : passe par le BookPicker).
  myBooks?: BookSummary[]
  initialBookIds?: string[]
  // Créée depuis le bouton "+ Créer une lineup" d'un livre précis : même pour
  // un admin, la lineup reste hors du pool global — elle vit uniquement dans
  // ce livre. Voir createLineup (src/app/map/[map]/actions.ts).
  scopedBookId?: string
}) {
  const mediaOptional = !!currentMedia
  const [state, formAction, pending] = useActionState(action, undefined)

  return (
    <form action={formAction} className="grid gap-6 lg:grid-cols-2 max-w-4xl">
      <input type="hidden" name="map" value={map} />
      {defaultValues && <input type="hidden" name="lineup_id" value={defaultValues.id} />}
      {scopedBookId && <input type="hidden" name="scoped_to_book" value={scopedBookId} />}

      <div>
        <RadarPicker
          radarSrc={MAP_RADARS[map]}
          initialFrom={
            defaultValues ? { x: defaultValues.from_x, y: defaultValues.from_y } : undefined
          }
          initialTo={defaultValues ? { x: defaultValues.to_x, y: defaultValues.to_y } : undefined}
        />
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">Type</label>
            <select name="type" required defaultValue={defaultValues?.type} className={inputClass}>
              {GRENADE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">Difficulté</label>
            <select
              name="difficulty"
              required
              defaultValue={defaultValues?.difficulty}
              className={inputClass}
            >
              <option value="1">Facile</option>
              <option value="2">Moyen</option>
              <option value="3">Difficile</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">Point de départ</label>
            <input
              name="from_pos"
              required
              defaultValue={defaultValues?.from_pos}
              placeholder="T Spawn"
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">Point d&apos;arrivée</label>
            <input
              name="to_pos"
              required
              defaultValue={defaultValues?.to_pos}
              placeholder="Window"
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-zinc-400 mb-1 block">Tags</label>
          <TagInput name="tags" initialTags={defaultValues?.tags} />
        </div>

        <MediaField
          label="Média — visée / lineup"
          name="media_lineup"
          accept="image/*,video/*"
          optional={mediaOptional}
          currentSrc={currentMedia?.media_lineup}
        />
        <MediaField
          label="Média — résultat"
          name="media_result"
          accept="image/*,video/*"
          optional={mediaOptional}
          currentSrc={currentMedia?.media_result}
        />
        <MediaField
          label="Média — gif"
          name="media_gif"
          accept="image/gif,video/*"
          optional={mediaOptional}
          currentSrc={currentMedia?.media_gif}
        />

        {myBooks && myBooks.length > 0 && (
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">
              Ranger directement dans un ou plusieurs livres
            </label>
            <div className="max-h-40 overflow-y-auto space-y-0.5 bg-zinc-900 border border-zinc-800 rounded-md p-1.5">
              {myBooks.map((book) => (
                <label
                  key={book.id}
                  className="flex items-center gap-2 text-sm text-zinc-300 hover:bg-zinc-800 rounded-md px-2 py-1.5 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    name="book_ids"
                    value={book.id}
                    defaultChecked={initialBookIds?.includes(book.id)}
                    className="accent-orange-500"
                  />
                  {book.name}
                </label>
              ))}
            </div>
          </div>
        )}

        {state?.error && <p className="text-sm text-red-400">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="w-full bg-orange-500 hover:bg-orange-600 transition-colors rounded-md py-2 text-sm font-medium disabled:opacity-50"
        >
          {pending ? "Enregistrement..." : submitLabel}
        </button>
      </div>
    </form>
  )
}

function MediaField({
  label,
  name,
  accept,
  optional,
  currentSrc,
}: {
  label: string
  name: string
  accept: string
  optional: boolean
  currentSrc?: string
}) {
  return (
    <div>
      <label className="text-xs text-zinc-400 mb-1 flex items-center gap-2">
        {label}
        {optional && <span className="text-zinc-600">(laisser vide pour garder l&apos;actuel)</span>}
      </label>
      {currentSrc && (
        <div className="w-20 h-12 rounded overflow-hidden mb-1.5 bg-black border border-zinc-800">
          <MediaView src={currentSrc} alt="" className="w-full h-full object-cover" />
        </div>
      )}
      <input type="file" name={name} accept={accept} required={!optional} className={inputClass} />
    </div>
  )
}
