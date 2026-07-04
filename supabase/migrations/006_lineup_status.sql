-- Statut d'une lineup :
--   personal -> créée par un utilisateur normal, visible sur son profil et
--               dans ses livres uniquement (pas dans le pool de la map)
--   pending  -> proposée à la validation d'un admin (flux à venir)
--   approved -> validée, visible dans le pool de la map
--   rejected -> refusée, avec motif dans rejection_reason (flux à venir)
-- Pour l'instant : création admin -> approved, création utilisateur -> personal.
alter table lineups add column status text not null default 'personal'
  check (status in ('personal', 'pending', 'approved', 'rejected'));
alter table lineups add column rejection_reason text;

-- Les lineups existantes ont été créées par un admin : elles restent dans le pool
update lineups set status = 'approved';
