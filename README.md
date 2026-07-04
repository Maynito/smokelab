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

Les migrations vivent dans [`supabase/migrations/`](./supabase/migrations/) (numérotées, `001_initial_schema.sql` étant le schéma de base). Deux façons de les appliquer :

**En ligne de commande (recommandé)** — nécessite `SUPABASE_DB_URL` dans `.env.local` (Dashboard → Connect → URI, version *Session pooler*, port 5432) :

```bash
npm run db:migrate            # applique les migrations manquantes
npm run db:migrate -- --dry-run  # aperçu sans rien exécuter
```

La CLI Supabase note en base (`supabase_migrations.schema_migrations`) ce qui a déjà été appliqué. Si des migrations ont été passées à la main dans le SQL Editor avant d'utiliser la CLI, les marquer comme faites d'abord :

```bash
npx supabase migration repair --status applied 001 002 003 --db-url "$SUPABASE_DB_URL"
```

**À la main** — coller chaque fichier dans l'ordre numérique dans le SQL Editor du Dashboard.

Créer ensuite le bucket de stockage des médias (`lineup-media`, public) — **pas possible via le SQL Editor** sur Supabase hosted (écriture directe sur `storage.buckets` bloquée), il faut passer par le Dashboard (Storage → New bucket → cocher "Public") ou l'API :

```bash
curl -X POST "$NEXT_PUBLIC_SUPABASE_URL/storage/v1/bucket" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"id":"lineup-media","name":"lineup-media","public":true}'
```

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
  types/index.ts               # types partagés (Lineup, MapName, Book, BookSummary, Follow, Session...)
  lib/
    session.ts                 # config iron-session + getSession()
    supabase.ts                 # client anon (bloqué par RLS) + createAdminClient() (service role)
    steam.ts                    # OpenID 2.0 : URL de connexion + vérification callback
    maps.ts                     # liste des maps/types de grenade + isMapName()
    mapImages.ts                # chemins des assets par map (galerie, icônes, radars)
    books.ts                    # requêtes partagées (livres d'un user, lineups déjà dans un de ses livres)
    useZoomPan.ts                # hook zoom molette + pan au glisser, partagé radar/médias
  components/
    RadarPicker.tsx              # placement interactif des points sur le radar (zoom/pan/plein écran)
    RadarViewer.tsx               # radar en lecture seule : filtre par type, clusters, aperçu au survol
    TagInput.tsx                  # saisie des tags avec suggestions
    LineupCard.tsx                  # vignette d'une lineup (pure présentation)
    LineupDetailModal.tsx            # fenêtre de détail (médias, livres, modifier, supprimer)
    LineupGrid.tsx                    # grille + état "quelle lineup est ouverte" (partageable avec le radar)
    LineupForm.tsx                     # formulaire création/édition (RadarPicker + TagInput + médias)
    BookPicker.tsx                      # choisir/créer un ou plusieurs livres pour une lineup
    BookCard.tsx                         # carte livre (supprimer si le tien, copier sinon)
    BookLineupSelector.tsx                # vue d'un livre d'un autre user : sélection multiple + ajout
    CreateBookInline.tsx                   # mini-formulaire "+ nouveau livre" (map + nom)
    FollowButton.tsx                        # bouton s'abonner/se désabonner
    MediaView.tsx                            # <img> ou <video> selon l'extension de l'URL
    ZoomableMedia.tsx                         # média avec zoom/pan + plein écran (visée/résultat)
    GrenadeIcon.tsx                            # icône par type de grenade
    LogoutButton.tsx                           # déconnexion
  app/
    page.tsx                    # galerie de sélection de map
    map/[map]/page.tsx           # charge les données, délègue l'affichage à MapPoolView
    map/[map]/new/page.tsx        # création de lineup (LineupForm)
    map/[map]/[id]/edit/page.tsx    # édition de lineup (LineupForm pré-rempli)
    map/[map]/actions.ts              # createLineup/updateLineup (useActionState) + deleteLineup
    u/[steamId]/page.tsx                # profil : livres par map, abonnés/abonnements, lineups créées
    u/[steamId]/books/[bookId]/page.tsx   # contenu d'un livre
    u/[steamId]/actions.ts                  # createBook/deleteBook/copyBook/setLineupBooks/
                                              # addLineupsToBooks/toggleFollow/getLineupBookIds
    login/page.tsx                             # connexion Steam
    api/auth/steam/                             # routes OAuth Steam (login, callback, logout)
    error.tsx / global-error.tsx / not-found.tsx # pages d'erreur (voir notes ci-dessous)

public/
  maps/                        # screenshots en jeu (galerie de sélection)
  icons/                       # emblèmes de map (écran de veto CS2)
  radars/                      # vues du dessus (radar) pour le placement des lineups

supabase/
  schema.sql                   # schéma de base
  migrations/                  # évolutions du schéma, à lancer dans l'ordre
```

## Notes d'architecture

- **Pas de Supabase Auth** : l'authentification passe entièrement par Steam OpenID + une session `iron-session` (cookie httpOnly chiffré). Les policies RLS Supabase n'ont donc pas accès à `auth.uid()` — toutes les lectures/écritures passent par les Server Components / Server Actions via `createAdminClient()` (clé `service_role`, contourne la RLS). Le client anon exporté par `src/lib/supabase.ts` n'est volontairement utilisable pour aucune requête utile côté navigateur.
- **Positions des lineups** : `from_x/from_y/to_x/to_y` sont des coordonnées normalisées (0–1) relatives à l'image radar, placées par clic dans `RadarPicker`. `from_pos`/`to_pos` restent des libellés texte lisibles (ex: "T Spawn").
- **Médias** (`media_lineup`, `media_result`, `media_gif`) : uploadés vers le bucket public Supabase Storage `lineup-media` au moment de la création (voir `map/[map]/actions.ts`).
- **Server Actions** : `next.config.ts` relève `experimental.serverActions.bodySizeLimit` à `25mb` pour permettre l'upload de médias (limite par défaut : 1MB).
- **Livres et profils** : chaque livre (`books`) est rattaché à une map précise et appartient à un utilisateur, qui peut en avoir plusieurs par map. `book_lineups` (table de jointure) relie livres et lineups. Les profils (`/u/[steamId]`) affichent les livres groupés par map, les lineups créées, et les compteurs d'abonnés/abonnements (`follows`, à sens unique, sans approbation). Depuis le profil ou le détail d'un livre d'un autre utilisateur, on peut copier tout son livre ou sélectionner des lineups précises à ajouter à ses propres livres.
- **Gestion d'erreur** : `createLineup`/`updateLineup` renvoient `{ error }` (via `useActionState`) plutôt que de lever une exception, pour un message inline dans le formulaire. Les autres mutations (suppression, livres, abonnements) sont appelées depuis des gestionnaires d'événements et restent des exceptions, attrapées côté composant. `error.tsx`/`global-error.tsx`/`not-found.tsx` gèrent les erreurs non prévues.

## Documentation

- [Guide utilisateur](./docs/USER_GUIDE.md)
- [AGENTS.md](./AGENTS.md) — spécificités de cette version de Next.js (à lire avant toute modification du code)
