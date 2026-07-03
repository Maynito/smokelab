"use server"

import { getSession } from "@/lib/session"
import { createAdminClient } from "@/lib/supabase"
import { isMapName } from "@/lib/maps"
import { revalidatePath } from "next/cache"
import type { MapName } from "@/types"

export async function createBook(name: string, map: MapName): Promise<{ id: string; name: string; map: MapName }> {
  const session = await getSession()
  if (!session.user) throw new Error("Unauthorized")

  const trimmed = name.trim()
  if (!trimmed) throw new Error("Nom de livre requis")
  if (!isMapName(map)) throw new Error("Map invalide")

  const admin = createAdminClient()
  const { data, error } = await admin
    .from("books")
    .insert({ user_id: session.user.id, name: trimmed, map })
    .select("id, name, map")
    .single()

  if (error || !data) throw new Error("Échec de la création du livre")

  revalidatePath(`/u/${session.user.steam_id}`)
  return data
}

export async function deleteBook(bookId: string) {
  const session = await getSession()
  if (!session.user) throw new Error("Unauthorized")

  const admin = createAdminClient()
  const { data: book } = await admin.from("books").select("user_id").eq("id", bookId).single()
  if (!book || book.user_id !== session.user.id) throw new Error("Unauthorized")

  const { error } = await admin.from("books").delete().eq("id", bookId)
  if (error) throw new Error("Échec de la suppression du livre")

  revalidatePath(`/u/${session.user.steam_id}`)
}

export async function getLineupBookIds(lineupId: string): Promise<string[]> {
  const session = await getSession()
  if (!session.user) throw new Error("Unauthorized")

  const admin = createAdminClient()
  const { data, error } = await admin
    .from("book_lineups")
    .select("book_id, books!inner(user_id)")
    .eq("lineup_id", lineupId)
    .eq("books.user_id", session.user.id)

  if (error) throw error
  return (data ?? []).map((row) => row.book_id as string)
}

export async function setLineupBooks(lineupId: string, bookIds: string[]) {
  const session = await getSession()
  if (!session.user) throw new Error("Unauthorized")

  const admin = createAdminClient()

  const { data: lineup } = await admin.from("lineups").select("map").eq("id", lineupId).single()
  if (!lineup) throw new Error("Lineup introuvable")

  const { data: myBooks } = await admin
    .from("books")
    .select("id")
    .eq("user_id", session.user.id)
    .eq("map", lineup.map)

  const myBookIds = new Set((myBooks ?? []).map((b) => b.id as string))
  const targetIds = bookIds.filter((id) => myBookIds.has(id))

  const { data: current } = await admin
    .from("book_lineups")
    .select("book_id")
    .eq("lineup_id", lineupId)
    .in("book_id", [...myBookIds])

  const currentIds = new Set((current ?? []).map((r) => r.book_id as string))

  const toAdd = targetIds.filter((id) => !currentIds.has(id))
  const toRemove = [...currentIds].filter((id) => !targetIds.includes(id))

  if (toAdd.length > 0) {
    const { error } = await admin
      .from("book_lineups")
      .insert(toAdd.map((book_id) => ({ book_id, lineup_id: lineupId })))
    if (error) throw error
  }

  if (toRemove.length > 0) {
    const { error } = await admin
      .from("book_lineups")
      .delete()
      .eq("lineup_id", lineupId)
      .in("book_id", toRemove)
    if (error) throw error
  }

  revalidatePath(`/u/${session.user.steam_id}`)
}

export async function addLineupsToBooks(lineupIds: string[], bookIds: string[]) {
  const session = await getSession()
  if (!session.user) throw new Error("Unauthorized")
  if (lineupIds.length === 0 || bookIds.length === 0) return

  const admin = createAdminClient()

  const { data: myBooks } = await admin
    .from("books")
    .select("id")
    .eq("user_id", session.user.id)
    .in("id", bookIds)

  const targetBookIds = (myBooks ?? []).map((b) => b.id as string)
  if (targetBookIds.length === 0) return

  const rows = targetBookIds.flatMap((book_id) =>
    lineupIds.map((lineup_id) => ({ book_id, lineup_id }))
  )

  const { error } = await admin
    .from("book_lineups")
    .upsert(rows, { onConflict: "book_id,lineup_id", ignoreDuplicates: true })

  if (error) throw error

  revalidatePath(`/u/${session.user.steam_id}`)
}

export async function copyBook(bookId: string) {
  const session = await getSession()
  if (!session.user) throw new Error("Unauthorized")

  const admin = createAdminClient()

  const { data: source, error: fetchError } = await admin
    .from("books")
    .select("name, map")
    .eq("id", bookId)
    .single()

  if (fetchError || !source) throw new Error("Livre introuvable")

  const { data: items } = await admin.from("book_lineups").select("lineup_id").eq("book_id", bookId)

  const { data: newBook, error: insertError } = await admin
    .from("books")
    .insert({ user_id: session.user.id, name: source.name, map: source.map })
    .select("id")
    .single()

  if (insertError || !newBook) throw new Error("Échec de la copie du livre")

  if (items && items.length > 0) {
    const { error } = await admin
      .from("book_lineups")
      .insert(items.map((i) => ({ book_id: newBook.id, lineup_id: i.lineup_id })))
    if (error) throw error
  }

  revalidatePath(`/u/${session.user.steam_id}`)
}

export async function toggleFollow(followedUserId: string, followedSteamId: string) {
  const session = await getSession()
  if (!session.user) throw new Error("Unauthorized")
  if (session.user.id === followedUserId) throw new Error("Tu ne peux pas te suivre toi-même")

  const admin = createAdminClient()

  const { data: existing } = await admin
    .from("follows")
    .select("follower_id")
    .eq("follower_id", session.user.id)
    .eq("followed_id", followedUserId)
    .maybeSingle()

  if (existing) {
    const { error } = await admin
      .from("follows")
      .delete()
      .eq("follower_id", session.user.id)
      .eq("followed_id", followedUserId)
    if (error) throw error
  } else {
    const { error } = await admin
      .from("follows")
      .insert({ follower_id: session.user.id, followed_id: followedUserId })
    if (error) throw error
  }

  revalidatePath(`/u/${followedSteamId}`)
  revalidatePath(`/u/${session.user.steam_id}`)
}
