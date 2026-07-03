import { getSession } from "@/lib/session"
import { redirect, notFound } from "next/navigation"
import { createAdminClient } from "@/lib/supabase"
import { getUserBooksWithCounts, getUserBooks, getBookmarkedLineupIds } from "@/lib/books"
import { LineupGrid } from "@/components/LineupGrid"
import { FollowButton } from "@/components/FollowButton"
import { SiteHeader } from "@/components/SiteHeader"
import { BookCard } from "@/components/BookCard"
import { CreateBookInline } from "@/components/CreateBookInline"
import type { Lineup, MapName } from "@/types"

async function getProfileUser(steamId: string) {
  const { data, error } = await createAdminClient()
    .from("users")
    .select("id, steam_id, steam_name, avatar_url")
    .eq("steam_id", steamId)
    .single()

  if (error || !data) return null
  return data
}

async function getFollowCounts(userId: string) {
  const admin = createAdminClient()
  const [{ count: followers }, { count: following }] = await Promise.all([
    admin.from("follows").select("follower_id", { count: "exact", head: true }).eq("followed_id", userId),
    admin.from("follows").select("followed_id", { count: "exact", head: true }).eq("follower_id", userId),
  ])
  return { followers: followers ?? 0, following: following ?? 0 }
}

async function getIsFollowing(followerId: string, followedId: string) {
  const { data } = await createAdminClient()
    .from("follows")
    .select("follower_id")
    .eq("follower_id", followerId)
    .eq("followed_id", followedId)
    .maybeSingle()
  return !!data
}

async function getCreatedLineups(userId: string) {
  const { data, error } = await createAdminClient()
    .from("lineups")
    .select("*")
    .eq("created_by", userId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data as Lineup[]
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ steamId: string }>
}) {
  const session = await getSession()
  if (!session.user) redirect("/login")

  const { steamId } = await params
  const profileUser = await getProfileUser(steamId)
  if (!profileUser) notFound()

  const isOwnProfile = profileUser.id === session.user.id

  const [books, followCounts, createdLineups, viewerBookmarkedIds, viewerBooks, isFollowing] =
    await Promise.all([
      getUserBooksWithCounts(profileUser.id),
      getFollowCounts(profileUser.id),
      getCreatedLineups(profileUser.id),
      getBookmarkedLineupIds(session.user.id),
      getUserBooks(session.user.id),
      isOwnProfile ? Promise.resolve(false) : getIsFollowing(session.user.id, profileUser.id),
    ])

  const booksByMap = new Map<MapName, typeof books>()
  for (const book of books) {
    const list = booksByMap.get(book.map as MapName) ?? []
    list.push(book)
    booksByMap.set(book.map as MapName, list)
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <SiteHeader user={session.user} />
      <div className="max-w-[1100px] mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={profileUser.avatar_url} alt="" className="w-16 h-16 rounded-full" />
            <div>
              <h1 className="text-xl font-bold">{profileUser.steam_name}</h1>
              <div className="flex gap-4 text-sm text-zinc-400">
                <span>
                  {followCounts.followers} abonné{followCounts.followers !== 1 ? "s" : ""}
                </span>
                <span>
                  {followCounts.following} abonnement{followCounts.following !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>

          {!isOwnProfile && (
            <FollowButton
              followedUserId={profileUser.id}
              followedSteamId={profileUser.steam_id}
              initialIsFollowing={isFollowing}
            />
          )}
        </div>

        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Livres</h2>
            {isOwnProfile && <CreateBookInline />}
          </div>

          {booksByMap.size === 0 ? (
            <p className="text-sm text-zinc-500">Aucun livre pour l&apos;instant.</p>
          ) : (
            <div className="space-y-6">
              {[...booksByMap.entries()].map(([map, mapBooks]) => (
                <div key={map}>
                  <h3 className="text-sm font-medium text-zinc-400 capitalize mb-2">{map}</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {mapBooks.map((book) => (
                      <BookCard key={book.id} steamId={steamId} book={book} isOwn={isOwnProfile} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-4">
            Lineups créées
          </h2>
          {createdLineups.length === 0 ? (
            <p className="text-sm text-zinc-500">Aucune lineup créée pour l&apos;instant.</p>
          ) : (
            <LineupGrid
              lineups={createdLineups}
              currentUserId={session.user.id}
              isAdmin={session.user.is_admin}
              bookmarkedIds={[...viewerBookmarkedIds]}
              myBooks={viewerBooks}
            />
          )}
        </section>
      </div>
    </main>
  )
}
