import { createAdminClient } from "@/lib/supabase"
import type { Notification, NotificationType } from "@/types"

export async function createNotification(
  userId: string,
  type: NotificationType,
  message: string,
  link: string | null
) {
  const { error } = await createAdminClient()
    .from("notifications")
    .insert({ user_id: userId, type, message, link })

  if (error) throw error
}

export async function getNotifications(userId: string) {
  const { data, error } = await createAdminClient()
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(30)

  if (error) throw error
  return (data ?? []) as Notification[]
}

export async function getUnreadNotificationCount(userId: string) {
  const { count, error } = await createAdminClient()
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("read", false)

  if (error) throw error
  return count ?? 0
}

export async function markAllNotificationsRead(userId: string) {
  const { error } = await createAdminClient()
    .from("notifications")
    .update({ read: true })
    .eq("user_id", userId)
    .eq("read", false)

  if (error) throw error
}
