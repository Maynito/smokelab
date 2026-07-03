"use server"

import { getSession } from "@/lib/session"
import { createAdminClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export async function toggleBookmark(lineupId: string) {
  const session = await getSession()
  if (!session.user) throw new Error("Unauthorized")

  const admin = createAdminClient()

  const { data: existing, error: fetchError } = await admin
    .from("user_lineups")
    .select("user_id")
    .eq("user_id", session.user.id)
    .eq("lineup_id", lineupId)
    .maybeSingle()

  if (fetchError) throw fetchError

  if (existing) {
    const { error } = await admin
      .from("user_lineups")
      .delete()
      .eq("user_id", session.user.id)
      .eq("lineup_id", lineupId)
    if (error) throw error
  } else {
    const { error } = await admin
      .from("user_lineups")
      .insert({ user_id: session.user.id, lineup_id: lineupId })
    if (error) throw error
  }

  const { data: lineup } = await admin.from("lineups").select("map").eq("id", lineupId).single()

  revalidatePath("/my-book")
  if (lineup) revalidatePath(`/map/${lineup.map}`)
}
