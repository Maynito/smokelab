import { NextRequest, NextResponse } from "next/server"
import { verifySteamCallback, getSteamProfile } from "@/lib/steam"
import { getSession } from "@/lib/session"
import { createAdminClient } from "@/lib/supabase"

export async function GET(req: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!

  try {
    const steamId = await verifySteamCallback(req.url)
    const profile = await getSteamProfile(steamId)

    const supabase = createAdminClient()

    // Upsert user in DB
    const { data: user, error } = await supabase
      .from("users")
      .upsert(
        {
          steam_id: profile.steam_id,
          steam_name: profile.steam_name,
          avatar_url: profile.avatar_url,
        },
        { onConflict: "steam_id" }
      )
      .select()
      .single()

    if (error || !user) throw new Error("Failed to upsert user")

    // Create session
    const session = await getSession()
    session.user = {
      id: user.id,
      steam_id: user.steam_id,
      steam_name: user.steam_name,
      avatar_url: user.avatar_url,
    }
    await session.save()

    return NextResponse.redirect(`${appUrl}/`)
  } catch (err) {
    console.error("Steam callback error:", err)
    return NextResponse.redirect(`${appUrl}/login?error=auth_failed`)
  }
}
