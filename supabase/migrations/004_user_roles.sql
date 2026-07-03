-- Rôle admin : peut supprimer n'importe quelle lineup (pas seulement les siennes)
alter table users add column is_admin boolean not null default false;

-- Compte Mayne (steam_id 76561198164552246) passé admin
update users set is_admin = true where steam_id = '76561198164552246';
