-- Nouveau type de notification : un admin est notifié quand un utilisateur
-- propose une de ses lineups perso au pool d'une map (voir proposeLineup).
alter table notifications drop constraint notifications_type_check;
alter table notifications add constraint notifications_type_check
  check (type in ('lineup_proposed', 'lineup_approved', 'lineup_rejected'));
