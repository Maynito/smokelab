# smokelab

Bibliothèque collaborative de lineups CS2 (smokes, flashs, molotovs, HE) : pool global par map avec placement interactif sur le radar, et livre personnel par joueur.

## Stack technique

- **[Next.js 16](https://nextjs.org)** (App Router, Turbopack, Server Actions) — ⚠️ voir [AGENTS.md](./AGENTS.md), cette version a des changements par rapport au Next.js habituel
- **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- **[Supabase](https://supabase.com)** — Postgres (données) + Storage (médias des lineups)
- **[iron-session](https://github.com/vvo/iron-session)** — sessions chiffrées en cookie (pas de Supabase Auth)
- **Steam OpenID 2.0** — authentification via compte Steam

## Prérequis

- Node.js 22+
- Un projet [Supabase](https://supabase.com) (gratuit)
- Une clé API Steam : https://steamcommunity.com/dev/apikey

## Setup

### 1. Dépendances

```bash
npm install
```

### 2. Variables d'environnement

```bash
cp .env.local.example .env.local
```

Remplir dans `.env.local` :

| Variable | Où la trouver |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → clé `anon public` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → clé `service_role` (secrète, jamais exposée au client) |
| `SESSION_SECRET` | générer avec `openssl rand -base64 32` (min. 32 caractères) |
| `STEAM_API_KEY` | https://steamcommunity.com/dev/apikey |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` en dev |

### 3. Base de données Supabase

Dans le SQL Editor du projet Supabase, exécuter **dans l'ordre** :

1. [`supabase/schema.sql`](./supabase/schema.sql) — tables `users`, `lineups`, `user_lineups` + RLS
2. Chaque fichier de [`supabase/migrations/`](./supabase/migrations/), dans l'ordre numérique (ex: `002_lineup_positions_and_storage.sql` ajoute les coordonnées radar + le bucket de stockage des médias)

### 4. Lancer le projet

```bash
npm run dev
```

→ http://localhost:3000

## Scripts

| Commande | Effet |
|---|---|
| `npm run dev` | serveur de dev (Turbopack) |
| `npm run build` | build de production |
| `npm run start` | lance le build de production |
| `npm run lint` | ESLint |

## Structure du projet

```
src/
  proxy.ts                    # protection des routes (remplace middleware.ts en Next 16)
  types/index.ts               # types partagés (Lineup, MapName, User, Session...)
  lib/
    session.ts                 # config iron-session + getSession()
    supabase.ts                 # client anon (bloqué par RLS) + createAdminClient() (service role)
    steam.ts                    # OpenID 2.0 : URL de connexion + vérification callback
    maps.ts                     # liste des maps/types de grenade + isMapName()
    mapImages.ts                # chemins des assets par map (galerie, icônes, radars)
  components/
    RadarPicker.tsx              # placement interactif des points sur le radar (zoom/pan)
    TagInput.tsx                 # saisie des tags avec suggestions
    FilterBar.tsx                 # filtres type/difficulté
    LineupCard.tsx                 # carte d'affichage d'une lineup
  app/
    page.tsx                    # galerie de sélection de map
    map/[map]/page.tsx           # pool de lineups d'une map + filtres
    map/[map]/new/page.tsx        # formulaire de création de lineup
    map/[map]/actions.ts           # Server Action createLineup (upload médias + insert DB)
    my-book/page.tsx              # livre personnel (à venir)
    login/page.tsx                 # connexion Steam
    api/auth/steam/                # routes OAuth Steam (login, callback, logout)

public/
  maps/                        # screenshots en jeu (galerie de sélection)
  icons/                       # emblèmes de map (écran de veto CS2)
  radars/                      # vues du dessus (radar) pour le placement des lineups

supabase/
  schema.sql                   # schéma de base
  migrations/                  # évolutions du schéma
```

## Notes d'architecture

- **Pas de Supabase Auth** : l'authentification passe entièrement par Steam OpenID + une session `iron-session` (cookie httpOnly chiffré). Les policies RLS Supabase n'ont donc pas accès à `auth.uid()` — toutes les lectures/écritures passent par les Server Components / Server Actions via `createAdminClient()` (clé `service_role`, contourne la RLS). Le client anon exporté par `src/lib/supabase.ts` n'est volontairement utilisable pour aucune requête utile côté navigateur.
- **Positions des lineups** : `from_x/from_y/to_x/to_y` sont des coordonnées normalisées (0–1) relatives à l'image radar, placées par clic dans `RadarPicker`. `from_pos`/`to_pos` restent des libellés texte lisibles (ex: "T Spawn").
- **Médias** (`media_setup`, `media_aim`, `media_result`) : uploadés vers le bucket public Supabase Storage `lineup-media` au moment de la création (voir `map/[map]/actions.ts`).
- **Server Actions** : `next.config.ts` relève `experimental.serverActions.bodySizeLimit` à `25mb` pour permettre l'upload de médias (limite par défaut : 1MB).

## Documentation

- [Guide utilisateur](./docs/USER_GUIDE.md)
- [AGENTS.md](./AGENTS.md) — spécificités de cette version de Next.js (à lire avant toute modification du code)
