-- Users (créés automatiquement au premier login Steam)
create table users (
  id uuid primary key default gen_random_uuid(),
  steam_id text unique not null,
  steam_name text not null,
  avatar_url text not null,
  created_at timestamptz default now()
);

-- RLS : aucun accès direct via la clé anon (pas de Supabase Auth ici,
-- toutes les lectures/écritures passent par l'API route + service role)
alter table users enable row level security;

-- Pool global de lineups
create table lineups (
  id uuid primary key default gen_random_uuid(),
  map text not null,
  type text not null check (type in ('smoke', 'flash', 'molotov', 'he')),
  from_pos text not null,
  to_pos text not null,
  tags text[] default '{}',
  difficulty smallint not null check (difficulty between 1 and 3),
  media_setup text not null,
  media_aim text not null,
  media_result text not null,
  created_by uuid references users(id),
  created_at timestamptz default now()
);

-- Livre perso de chaque utilisateur
create table user_lineups (
  user_id uuid references users(id) on delete cascade,
  lineup_id uuid references lineups(id) on delete cascade,
  mastered boolean default false,
  note text,
  added_at timestamptz default now(),
  primary key (user_id, lineup_id)
);

-- RLS : chaque user ne voit que ses propres user_lineups
alter table user_lineups enable row level security;

create policy "user_lineups_select" on user_lineups
  for select using (user_id = auth.uid());

create policy "user_lineups_insert" on user_lineups
  for insert with check (user_id = auth.uid());

create policy "user_lineups_update" on user_lineups
  for update using (user_id = auth.uid());

create policy "user_lineups_delete" on user_lineups
  for delete using (user_id = auth.uid());

-- Les lineups sont lisibles par tous les utilisateurs connectés
alter table lineups enable row level security;

create policy "lineups_select" on lineups
  for select using (true);
