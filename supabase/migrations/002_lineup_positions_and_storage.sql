-- Coordonnées normalisées (0-1, relatives à l'image radar) du point de
-- départ et du point d'arrivée, placées par clic sur le radar
alter table lineups
  add column from_x real not null,
  add column from_y real not null,
  add column to_x real not null,
  add column to_y real not null;

-- Bucket public pour les médias des lineups (visée/lineup, résultat, gif).
--
-- ⚠️ Un `insert into storage.buckets` via le SQL Editor ne suffit pas sur
-- Supabase hosted (l'écriture directe sur le schéma storage est bloquée) :
-- le bucket doit être créé soit depuis le Dashboard (Storage → New bucket,
-- coche "Public"), soit via l'API Storage Management :
--
--   curl -X POST "$NEXT_PUBLIC_SUPABASE_URL/storage/v1/bucket" \
--     -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
--     -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
--     -H "Content-Type: application/json" \
--     -d '{"id":"lineup-media","name":"lineup-media","public":true}'
