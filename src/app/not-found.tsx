import Link from "next/link"

export default function NotFound() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-8">
      <div className="text-center space-y-4 max-w-sm">
        <h1 className="text-2xl font-bold">
          smoke<span className="text-orange-500">lab</span>
        </h1>
        <p className="text-zinc-400 text-sm">
          Cette page n&apos;existe pas, ou la lineup que tu cherches a été supprimée.
        </p>
        <Link
          href="/"
          className="inline-block bg-orange-500 hover:bg-orange-600 transition-colors rounded-md px-4 py-2 text-sm font-medium"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </main>
  )
}
