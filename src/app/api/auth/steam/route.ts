import { NextResponse } from "next/server"
import { getSteamLoginUrl } from "@/lib/steam"

export async function GET() {
  try {
    const url = await getSteamLoginUrl()
    return NextResponse.redirect(url)
  } catch {
    return NextResponse.json({ error: "Failed to initiate Steam login" }, { status: 500 })
  }
}
