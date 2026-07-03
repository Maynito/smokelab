-- Livres nommés, rattachés à une map (un utilisateur peut en avoir
-- plusieurs par map, ex: "Mirage - executes CT" et "Mirage - safe smokes")
create table books (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  map text not null check (map in ('mirage', 'inferno', 'dust2', 'nuke', 'overpass', 'ancient', 'anubis', 'vertigo', 'train', 'cache')),
  name text not null,
  created_at timestamptz default now()
);

alter table books enable row level security;

-- Abonnements (suivre d'autres utilisateurs)
create table follows (
  follower_id uuid not null references users(id) on delete cascade,
  followed_id uuid not null references users(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (follower_id, followed_id),
  check (follower_id <> followed_id)
);

alter table follows enable row level security;

-- user_lineups devient book_lineups : une lineup appartient à un livre
-- (et non plus directement à un utilisateur), pour permettre plusieurs
-- livres par personne et une même lineup dans plusieurs livres.
-- Table vide au moment de cette migration, pas de données à préserver.
alter table user_lineups rename to book_lineups;
alter table book_lineups add column book_id uuid not null references books(id) on delete cascade;

-- Les anciennes policies (schema.sql) référencent user_id et bloquent
-- le drop de cette colonne — plus besoin d'elles, book_lineups suit la
-- même posture que books/follows (RLS activée, sans policy anon).
drop policy if exists user_lineups_select on book_lineups;
drop policy if exists user_lineups_insert on book_lineups;
drop policy if exists user_lineups_update on book_lineups;
drop policy if exists user_lineups_delete on book_lineups;

alter table book_lineups drop constraint user_lineups_pkey;
alter table book_lineups drop column user_id;
alter table book_lineups add primary key (book_id, lineup_id);
