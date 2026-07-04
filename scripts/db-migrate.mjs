// Applique les migrations de supabase/migrations/ sur la base hébergée,
// via la CLI Supabase (qui note en base les migrations déjà passées).
// Usage : npm run db:migrate [-- --dry-run]
// Requiert SUPABASE_DB_URL dans .env.local (Dashboard -> Connect -> URI, Session pooler).
import { readFileSync } from "node:fs"
import { spawnSync } from "node:child_process"

let envFile
try {
  envFile = readFileSync(new URL("../.env.local", import.meta.url), "utf8")
} catch {
  console.error("Fichier .env.local introuvable.")
  process.exit(1)
}

const match = envFile.match(/^SUPABASE_DB_URL=(.+)$/m)
if (!match || match[1].includes("your-project")) {
  console.error(
    "SUPABASE_DB_URL manquant dans .env.local.\n" +
      "Dashboard Supabase -> Connect -> URI (Session pooler, port 5432), puis ajoute :\n" +
      "SUPABASE_DB_URL=postgresql://postgres.xxx:MDP@aws-0-region.pooler.supabase.com:5432/postgres"
  )
  process.exit(1)
}
const dbUrl = match[1].trim()

const extraArgs = process.argv.slice(2)
const res = spawnSync(
  "npx",
  ["--yes", "supabase", "db", "push", "--db-url", dbUrl, ...extraArgs],
  { stdio: "inherit" }
)
process.exit(res.status ?? 1)
