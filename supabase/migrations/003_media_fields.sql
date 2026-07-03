-- Les 3 médias d'une lineup deviennent : visée/lineup, résultat, gif
-- (remplace l'ancien trio setup/aim/result)
alter table lineups rename column media_aim to media_lineup;
alter table lineups drop column media_setup;
alter table lineups add column media_gif text not null;
