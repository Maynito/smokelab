import { getSession } from "@/lib/session"
import Link from "next/link"
import { MAPS } from "@/lib/maps"
import { MAP_ICONS, MAP_IMAGES } from "@/lib/mapImages"
import type { SessionUser } from "@/types"

export default async function LandingPage() {
  const session = await getSession()
  const user = session.user ?? null

  return (
    <main className="relative min-h-screen bg-black text-white overflow-x-hidden">
      <section className="relative min-h-screen flex flex-col">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={MAP_IMAGES.mirage}
            alt=""
            className="absolute inset-0 w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50" />
          <div
            className="absolute -top-32 -left-32 w-[34rem] h-[34rem] rounded-full bg-orange-600/20 blur-[110px] animate-[glow-pulse_6s_ease-in-out_infinite]"
            aria-hidden
          />
          <div
            className="absolute top-1/3 -right-32 w-[28rem] h-[28rem] rounded-full bg-red-600/10 blur-[100px] animate-[glow-pulse_7s_ease-in-out_infinite]"
            aria-hidden
          />
        </div>

        <div className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-6">
          <span className="text-xs sm:text-sm font-semibold tracking-[0.35em] uppercase text-zinc-300">
            Smokelab
          </span>

          {user ? (
            <Link
              href={`/u/${user.steam_id}`}
              className="flex items-center gap-2 text-sm text-zinc-300 hover:text-white transition-colors"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={user.avatar_url}
                alt=""
                className="w-7 h-7 rounded-full border border-white/20"
              />
              <span className="hidden sm:inline">{user.steam_name}</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="text-xs sm:text-sm font-medium px-4 py-2 rounded-full border border-white/25 hover:border-orange-500 hover:text-orange-400 transition-colors"
            >
              Se connecter
            </Link>
          )}
        </div>

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6">
          <p
            className="text-orange-500 text-xs sm:text-sm font-semibold tracking-[0.5em] uppercase mb-4 opacity-0 animate-[fade-up_.7s_ease-out_.1s_forwards]"
          >
            Bibliothèque collaborative CS2
          </p>

          <h1 className="text-[19vw] sm:text-[9rem] md:text-[11rem] leading-[0.82] font-black tracking-tighter uppercase opacity-0 animate-[fade-up_.8s_ease-out_.2s_forwards]">
            Smoke
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-red-500">
              Lab
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-zinc-400 text-sm sm:text-base opacity-0 animate-[fade-up_.8s_ease-out_.35s_forwards]">
            Lineups de smokes, flashs et molotovs pour toutes les maps du pool actif — trouve la
            bonne pose, propose les tiennes, range tes favorites dans tes livres.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4 opacity-0 animate-[fade-up_.8s_ease-out_.5s_forwards]">
            <Link
              href="/maps"
              className="px-8 py-3.5 rounded-full bg-orange-500 hover:bg-orange-400 text-black font-semibold text-sm tracking-wide transition-colors"
            >
              Explorer les maps
            </Link>

            {user ? (
              <Link
                href={`/u/${user.steam_id}`}
                className="px-8 py-3.5 rounded-full border border-white/25 hover:border-orange-500 hover:text-orange-400 font-semibold text-sm tracking-wide transition-colors"
              >
                Profil &amp; livres
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-8 py-3.5 rounded-full border border-white/25 hover:border-orange-500 hover:text-orange-400 font-semibold text-sm tracking-wide transition-colors"
              >
                Se connecter avec Steam
              </Link>
            )}
          </div>
        </div>

        <div className="relative z-10 flex justify-center pb-8">
          <div className="flex flex-col items-center gap-2 text-zinc-500 animate-bounce">
            <span className="text-[10px] tracking-[0.3em] uppercase">Scroll</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </section>

      <div className="relative border-y border-white/10 bg-zinc-950 py-4 overflow-hidden">
        <div className="flex w-max animate-[marquee_32s_linear_infinite]">
          {[...MAPS, ...MAPS].map((map, i) => (
            <span
              key={i}
              className="mx-8 flex items-center gap-3 text-sm sm:text-base font-semibold uppercase tracking-widest text-zinc-600"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={MAP_ICONS[map]} alt="" className="w-4 h-4 opacity-70" />
              {map}
            </span>
          ))}
        </div>
      </div>

      <section className="relative bg-zinc-950 px-6 sm:px-10 py-20 sm:py-28">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight mb-10 sm:mb-14 max-w-2xl">
            Tout ce qu&apos;il te faut pour <span className="text-orange-500">dominer le pool</span>
          </h2>

          <div className="grid sm:grid-cols-3 gap-5">
            <FeatureTile
              href="/maps"
              image={MAP_IMAGES.inferno}
              title="Toutes les maps"
              desc="Un pool de lineups validées par map, filtrable par type de grenade et affichable sur le radar."
            />
            <FeatureTile
              href={user ? `/u/${user.steam_id}` : "/login"}
              image={MAP_IMAGES.ancient}
              title="Ton profil"
              desc="Tes lineups perso, tes stats de suivi, et ce que font les joueurs que tu suis."
              user={user}
            />
            <FeatureTile
              href={user ? `/u/${user.steam_id}` : "/login"}
              image={MAP_IMAGES.anubis}
              title="Tes livres"
              desc="Classe tes lineups favorites par map, partage-les, ou copie celles des autres joueurs."
              user={user}
            />
          </div>
        </div>
      </section>

      <footer className="relative bg-black px-6 sm:px-10 py-10 border-t border-white/10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm font-semibold tracking-tight">
            smoke<span className="text-orange-500">lab</span>
          </span>
          <Link
            href="/maps"
            className="text-sm text-zinc-400 hover:text-white transition-colors"
          >
            Explorer les maps →
          </Link>
        </div>
      </footer>
    </main>
  )
}

function FeatureTile({
  href,
  image,
  title,
  desc,
  user,
}: {
  href: string
  image: string
  title: string
  desc: string
  user?: SessionUser | null
}) {
  return (
    <Link
      href={href}
      className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 hover:border-orange-500/60 transition-colors duration-200"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image}
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-70 group-hover:scale-110 transition-all duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

      <div className="relative z-10 h-full flex flex-col justify-end p-5 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold mb-1.5">{title}</h3>
        <p className="text-sm text-zinc-400 leading-snug">{desc}</p>
        {user === null && (
          <span className="mt-3 text-xs font-medium text-orange-400">Se connecter →</span>
        )}
      </div>
    </Link>
  )
}
