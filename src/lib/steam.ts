import { RelyingParty } from "openid"

const STEAM_OPENID_URL = "https://steamcommunity.com/openid"
const STEAM_ID_REGEX = /^https?:\/\/steamcommunity\.com\/openid\/id\/(\d+)$/

function getRelyingParty() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!
  return new RelyingParty(
    `${appUrl}/api/auth/steam/callback`,
    appUrl,
    true,  // stateless
    false, // strict mode
    []
  )
}

export function getSteamLoginUrl(): Promise<string> {
  return new Promise((resolve, reject) => {
    const rp = getRelyingParty()
    rp.authenticate(STEAM_OPENID_URL, false, (err, authUrl) => {
      if (err || !authUrl) return reject(err ?? new Error("No auth URL"))
      resolve(authUrl)
    })
  })
}

export function verifySteamCallback(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const rp = getRelyingParty()
    rp.verifyAssertion(url, (err, result) => {
      if (err || !result?.authenticated) {
        return reject(err ?? new Error("Steam authentication failed"))
      }
      const match = result.claimedIdentifier?.match(STEAM_ID_REGEX)
      if (!match) return reject(new Error("Invalid Steam ID format"))
      resolve(match[1])
    })
  })
}

export async function getSteamProfile(steamId: string) {
  const res = await fetch(
    `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${process.env.STEAM_API_KEY}&steamids=${steamId}`
  )
  const data = await res.json()
  const player = data?.response?.players?.[0]
  if (!player) throw new Error("Steam profile not found")
  return {
    steam_id: steamId,
    steam_name: player.personaname as string,
    avatar_url: player.avatarfull as string,
  }
}
