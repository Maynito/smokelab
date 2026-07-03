-- Coordonnées normalisées (0-1, relatives à l'image radar) du point de
-- départ et du point d'arrivée, placées par clic sur le radar
alter table lineups
  add column from_x real not null,
  add column from_y real not null,
  add column to_x real not null,
  add column to_y real not null;

-- Bucket public pour les médias des lineups (setup / aim / résultat)
insert into storage.buckets (id, name, public)
values ('lineup-media', 'lineup-media', true)
on conflict (id) do nothing;
