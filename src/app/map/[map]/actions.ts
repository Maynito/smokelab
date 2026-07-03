"use server"

import { getSession } from "@/lib/session"
import { createAdminClient } from "@/lib/supabase"
import { isMapName, GRENADE_TYPES } from "@/lib/maps"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import type { GrenadeType } from "@/types"

const MEDIA_FIELDS = ["media_setup", "media_aim", "media_result"] as const

export async function createLineup(formData: FormData) {
  const session = await getSession()
  if (!session.user) throw new Error("Unauthorized")

  const map = formData.get("map")
  if (typeof map !== "string" || !isMapName(map)) throw new Error("Map invalide")

  const type = formData.get("type")
  if (typeof type !== "string" || !GRENADE_TYPES.includes(type as GrenadeType)) {
    throw new Error("Type invalide")
  }

  const fromPos = formData.get("from_pos")
  const toPos = formData.get("to_pos")
  const fromX = parseFloat(String(formData.get("from_x")))
  const fromY = parseFloat(String(formData.get("from_y")))
  const toX = parseFloat(String(formData.get("to_x")))
  const toY = parseFloat(String(formData.get("to_y")))

  if (
    typeof fromPos !== "string" ||
    !fromPos.trim() ||
    typeof toPos !== "string" ||
    !toPos.trim() ||
    [fromX, fromY, toX, toY].some((n) => Number.isNaN(n))
  ) {
    throw new Error("Place les deux points sur le radar et remplis les positions")
  }

  const difficulty = Number(formData.get("difficulty"))
  if (![1, 2, 3].includes(difficulty)) throw new Error("Difficulté invalide")

  const tags = formData
    .getAll("tags")
    .map((t) => String(t).trim())
    .filter(Boolean)

  const admin = createAdminClient()

  const mediaUrls = await Promise.all(
    MEDIA_FIELDS.map(async (field) => {
      const file = formData.get(field)
      if (!(file instanceof File) || file.size === 0) {
        throw new Error(`Fichier manquant pour ${field}`)
      }
      const path = `${map}/${crypto.randomUUID()}-${file.name}`
      const { error } = await admin.storage
        .from("lineup-media")
        .upload(path, file, { contentType: file.type })
      if (error) throw error
      return admin.storage.from("lineup-media").getPublicUrl(path).data.publicUrl
    })
  )

  const { error } = await admin.from("lineups").insert({
    map,
    type,
    from_pos: fromPos.trim(),
    to_pos: toPos.trim(),
    from_x: fromX,
    from_y: fromY,
    to_x: toX,
    to_y: toY,
    tags,
    difficulty,
    media_setup: mediaUrls[0],
    media_aim: mediaUrls[1],
    media_result: mediaUrls[2],
    created_by: session.user.id,
  })

  if (error) throw error

  revalidatePath(`/map/${map}`)
  redirect(`/map/${map}`)
}
