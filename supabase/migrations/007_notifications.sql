-- Notifications envoyées à un utilisateur (ex: sa lineup a été acceptée/refusée
-- dans le pool d'une map). Lues via createAdminClient() côté serveur uniquement.
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  type text not null check (type in ('lineup_approved', 'lineup_rejected')),
  message text not null,
  link text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index notifications_user_id_created_at_idx on notifications (user_id, created_at desc);

-- RLS activée sans policy, comme `users` : la clé anon est publique dans le
-- bundle JS, tout accès passe par createAdminClient() (service role) côté
-- Server Components/Actions — voir 001_initial_schema.sql.
alter table notifications enable row level security;
