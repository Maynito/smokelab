"use server"

import { getSession } from "@/lib/session"
import { createAdminClient } from "@/lib/supabase"
import { isMapName, GRENADE_TYPES } from "@/lib/maps"
import { roleOf, can } from "@/lib/roles"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { setLineupBooks } from "@/app/u/[steamId]/actions"
import { createNotification } from "@/lib/notifications"
import type { GrenadeType } from "@/types"

const MEDIA_FIELDS = ["media_lineup", "media_result", "media_gif"] as const

export type LineupFormState = { error: string } | undefined

export async function createLineup(
  _prevState: LineupFormState,
  formData: FormData
): Promise<LineupFormState> {
  const session = await getSession()
  if (!session.user) return { error: "Ta session a expiré, reconnecte-toi." }

  const map = formData.get("map")
  if (typeof map !== "string" || !isMapName(map)) return { error: "Map invalide." }

  const type = formData.get("type")
  if (typeof type !== "string" || !GRENADE_TYPES.includes(type as GrenadeType)) {
    return { error: "Type de grenade invalide." }
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
    return { error: "Place les deux points sur le radar et remplis les positions." }
  }

  const difficulty = Number(formData.get("difficulty"))
  if (![1, 2, 3].includes(difficulty)) return { error: "Difficulté invalide." }

  const tags = formData
    .getAll("tags")
    .map((t) => String(t).trim())
    .filter(Boolean)

  const admin = createAdminClient()

  for (const field of MEDIA_FIELDS) {
    const file = formData.get(field)
    if (!(file instanceof File) || file.size === 0) {
      return { error: "Les 3 médias (visée, résultat, gif) sont obligatoires." }
    }
  }

  const mediaUrls: string[] = []
  for (const field of MEDIA_FIELDS) {
    const file = formData.get(field) as File
    const path = `${map}/${crypto.randomUUID()}-${file.name}`
    const { error } = await admin.storage
      .from("lineup-media")
      .upload(path, file, { contentType: file.type })
    if (error) return { error: "Échec de l'upload d'un média. Réessaie." }
    mediaUrls.push(admin.storage.from("lineup-media").getPublicUrl(path).data.publicUrl)
  }

  // Admin -> directement dans le pool de la map ; utilisateur normal ->
  // lineup perso (profil + livres), à proposer ensuite à un admin. Exception :
  // créée depuis le bouton "+ Créer une lineup" d'un livre précis (même pour
  // un admin) -> reste perso, elle ne vit que dans ce livre.
  const scopedBookId = formData.get("scoped_to_book")
  const isScopedToBook = typeof scopedBookId === "string" && scopedBookId.length > 0
  const publishesToPool = !isScopedToBook && can.publishToPool(roleOf(session.user))

  const { data: inserted, error } = await admin
    .from("lineups")
    .insert({
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
      media_lineup: mediaUrls[0],
      media_result: mediaUrls[1],
      media_gif: mediaUrls[2],
      status: publishesToPool ? "approved" : "personal",
      created_by: session.user.id,
    })
    .select("id")
    .single()

  if (error || !inserted) return { error: "Échec de l'enregistrement de la lineup. Réessaie." }

  const bookIds = formData.getAll("book_ids").map(String)
  if (bookIds.length > 0) await setLineupBooks(inserted.id, bookIds)

  revalidatePath(`/map/${map}`)
  revalidatePath(`/u/${session.user.steam_id}`)

  if (publishesToPool) {
    redirect(`/map/${map}?toast=lineup-pool-created`)
  }
  if (isScopedToBook && bookIds.includes(String(scopedBookId))) {
    revalidatePath(`/u/${session.user.steam_id}/books/${scopedBookId}`)
    redirect(`/u/${session.user.steam_id}/books/${scopedBookId}?toast=lineup-created`)
  }
  redirect(`/u/${session.user.steam_id}?toast=lineup-created`)
}

export async function updateLineup(
  _prevState: LineupFormState,
  formData: FormData
): Promise<LineupFormState> {
  const session = await getSession()
  if (!session.user) return { error: "Ta session a expiré, reconnecte-toi." }

  const lineupId = formData.get("lineup_id")
  if (typeof lineupId !== "string" || !lineupId) return { error: "Lineup invalide." }

  const admin = createAdminClient()

  const { data: existing, error: fetchError } = await admin
    .from("lineups")
    .select("created_by, status, media_lineup, media_result, media_gif")
    .eq("id", lineupId)
    .single()

  if (fetchError || !existing) return { error: "Lineup introuvable." }

  if (!can.manageLineup(session.user, existing)) {
    return { error: "Tu n'as pas le droit de modifier cette lineup." }
  }

  const map = formData.get("map")
  if (typeof map !== "string" || !isMapName(map)) return { error: "Map invalide." }

  const type = formData.get("type")
  if (typeof type !== "string" || !GRENADE_TYPES.includes(type as GrenadeType)) {
    return { error: "Type de grenade invalide." }
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
    return { error: "Place les deux points sur le radar et remplis les positions." }
  }

  const difficulty = Number(formData.get("difficulty"))
  if (![1, 2, 3].includes(difficulty)) return { error: "Difficulté invalide." }

  const tags = formData
    .getAll("tags")
    .map((t) => String(t).trim())
    .filter(Boolean)

  const mediaUrls: string[] = []
  for (const field of MEDIA_FIELDS) {
    const file = formData.get(field)
    if (file instanceof File && file.size > 0) {
      const path = `${map}/${crypto.randomUUID()}-${file.name}`
      const { error } = await admin.storage
        .from("lineup-media")
        .upload(path, file, { contentType: file.type })
      if (error) return { error: "Échec de l'upload d'un média. Réessaie." }
      mediaUrls.push(admin.storage.from("lineup-media").getPublicUrl(path).data.publicUrl)
    } else {
      mediaUrls.push(existing[field])
    }
  }

  const { error } = await admin
    .from("lineups")
    .update({
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
      media_lineup: mediaUrls[0],
      media_result: mediaUrls[1],
      media_gif: mediaUrls[2],
    })
    .eq("id", lineupId)

  if (error) return { error: "Échec de l'enregistrement des modifications. Réessaie." }

  revalidatePath(`/map/${map}`)
  revalidatePath(`/u/${session.user.steam_id}`)
  // Une lineup du pool renvoie vers la map, une lineup perso vers le profil
  redirect(
    existing.status === "approved"
      ? `/map/${map}?toast=lineup-updated`
      : `/u/${session.user.steam_id}?toast=lineup-updated`
  )
}

function storagePathFromPublicUrl(publicUrl: string): string | null {
  const marker = "/object/public/lineup-media/"
  const idx = publicUrl.indexOf(marker)
  return idx === -1 ? null : publicUrl.slice(idx + marker.length)
}

export async function deleteLineup(lineupId: string) {
  const session = await getSession()
  if (!session.user) throw new Error("Unauthorized")

  const admin = createAdminClient()

  const { data: lineup, error: fetchError } = await admin
    .from("lineups")
    .select("map, created_by, media_lineup, media_result, media_gif")
    .eq("id", lineupId)
    .single()

  if (fetchError || !lineup) throw new Error("Lineup introuvable")
  if (!can.manageLineup(session.user, lineup)) throw new Error("Unauthorized")

  const paths = [lineup.media_lineup, lineup.media_result, lineup.media_gif]
    .map(storagePathFromPublicUrl)
    .filter((p): p is string => p !== null)

  if (paths.length > 0) {
    await admin.storage.from("lineup-media").remove(paths)
  }

  const { error } = await admin.from("lineups").delete().eq("id", lineupId)
  if (error) throw new Error("Échec de la suppression. Réessaie.")

  revalidatePath(`/map/${lineup.map}`)
  revalidatePath(`/u/${session.user.steam_id}`)
}

// Propose une lineup perso (ou refusée) à la validation d'un admin. Passe son
// statut à "pending" — elle apparaît alors dans l'onglet "Propositions" de la
// map pour les admins, en plus de rester visible sur le profil de son auteur.
export async function proposeLineup(lineupId: string) {
  const session = await getSession()
  if (!session.user) throw new Error("Unauthorized")

  const admin = createAdminClient()
  const { data: lineup, error: fetchError } = await admin
    .from("lineups")
    .select("map, created_by, status, from_pos, to_pos")
    .eq("id", lineupId)
    .single()

  if (fetchError || !lineup) throw new Error("Lineup introuvable")
  if (!can.proposeLineup(session.user, lineup)) throw new Error("Unauthorized")

  const { error } = await admin
    .from("lineups")
    .update({ status: "pending", rejection_reason: null })
    .eq("id", lineupId)

  if (error) throw new Error("Échec de la proposition. Réessaie.")

  const { data: admins } = await admin.from("users").select("id").eq("is_admin", true)
  await Promise.all(
    (admins ?? []).map((a) =>
      createNotification(
        a.id as string,
        "lineup_proposed",
        `${session.user!.steam_name} propose une lineup (${lineup.from_pos} → ${lineup.to_pos}) sur ${lineup.map}.`,
        `/map/${lineup.map}?lineup=${lineupId}`
      )
    )
  )

  revalidatePath(`/map/${lineup.map}`)
  revalidatePath(`/u/${session.user.steam_id}`)
}

export async function approveLineup(lineupId: string) {
  const session = await getSession()
  if (!can.reviewLineup(roleOf(session.user))) throw new Error("Unauthorized")

  const admin = createAdminClient()
  const { data: lineup, error: fetchError } = await admin
    .from("lineups")
    .select("map, created_by, from_pos, to_pos, status, users(steam_id)")
    .eq("id", lineupId)
    .single()

  if (fetchError || !lineup) throw new Error("Lineup introuvable")
  if (lineup.status !== "pending") throw new Error("Cette lineup n'est plus en attente.")

  const { error } = await admin
    .from("lineups")
    .update({ status: "approved", rejection_reason: null })
    .eq("id", lineupId)

  if (error) throw new Error("Échec de la validation. Réessaie.")

  await createNotification(
    lineup.created_by,
    "lineup_approved",
    `Ta lineup ${lineup.from_pos} → ${lineup.to_pos} (${lineup.map}) a été ajoutée au pool.`,
    `/map/${lineup.map}?lineup=${lineupId}`
  )

  revalidatePath(`/map/${lineup.map}`)
  const ownerSteamId = (lineup.users as unknown as { steam_id: string } | null)?.steam_id
  if (ownerSteamId) revalidatePath(`/u/${ownerSteamId}`)
}

export async function rejectLineup(lineupId: string, reason: string) {
  const session = await getSession()
  if (!can.reviewLineup(roleOf(session.user))) throw new Error("Unauthorized")

  const trimmedReason = reason.trim()
  if (!trimmedReason) throw new Error("Indique un motif de refus.")

  const admin = createAdminClient()
  const { data: lineup, error: fetchError } = await admin
    .from("lineups")
    .select("map, created_by, from_pos, to_pos, status, users(steam_id)")
    .eq("id", lineupId)
    .single()

  if (fetchError || !lineup) throw new Error("Lineup introuvable")
  if (lineup.status !== "pending") throw new Error("Cette lineup n'est plus en attente.")

  const { error } = await admin
    .from("lineups")
    .update({ status: "rejected", rejection_reason: trimmedReason })
    .eq("id", lineupId)

  if (error) throw new Error("Échec du refus. Réessaie.")

  const ownerSteamId = (lineup.users as unknown as { steam_id: string } | null)?.steam_id

  await createNotification(
    lineup.created_by,
    "lineup_rejected",
    `Ta lineup ${lineup.from_pos} → ${lineup.to_pos} (${lineup.map}) a été refusée : ${trimmedReason}`,
    ownerSteamId ? `/u/${ownerSteamId}` : null
  )

  revalidatePath(`/map/${lineup.map}`)
  if (ownerSteamId) revalidatePath(`/u/${ownerSteamId}`)
}
