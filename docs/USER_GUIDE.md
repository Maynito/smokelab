# Guide utilisateur — smokelab

## Connexion

1. Ouvre le site.
2. Clique sur **"Se connecter avec Steam"**.
3. Autorise la connexion sur la page Steam.
4. Tu es redirigé vers smokelab, connecté avec ton pseudo et ton avatar Steam.

## Choisir une map

La page d'accueil affiche une galerie des 10 maps du pool actif (Mirage, Inferno, Dust2, Nuke, Overpass, Ancient, Anubis, Vertigo, Train, Cache). Clique sur une vignette pour ouvrir le pool de lineups de cette map.

## Parcourir le pool d'une map

Sur la page d'une map, tu retrouves :

- le **radar** de la map en haut de page
- des **filtres** par type de grenade (smoke, flash, molotov, HE) et par difficulté (facile / moyen / difficile)
- la **grille des lineups** correspondant aux filtres actifs, chacune affichant : image du setup, map, type, difficulté (pastilles), point de départ → point d'arrivée, et tags

## Ajouter une lineup

Depuis la page d'une map, clique sur **"+ Ajouter une lineup"**.

### 1. Placer les points sur le radar

- Le premier clic sur le radar place le **point de départ** (pastille bleue).
- Le second clic place le **point d'arrivée** (pastille orange).
- **Molette de la souris** : zoome/dézoome, centré sur la position du curseur.
- **Clic maintenu + glisser** : déplace la vue quand tu es zoomé.
- Bouton en haut à droite du radar (icône d'agrandissement) : passe le radar en plein écran pour placer les points plus précisément.
- **"Réinitialiser les points"** : efface les deux points pour recommencer.

### 2. Remplir les informations

- **Type** et **Difficulté** : listes déroulantes.
- **Point de départ / Point d'arrivée** : libellés texte (ex: "T Spawn", "Window").
- **Tags** : tape un mot-clé, des suggestions parmi les tags courants (one-way, jump-throw, pixel-perfect...) apparaissent — appuie sur **Entrée** pour ajouter le tag tapé ou clique une suggestion. Chaque tag est une pastille grise cliquable pour la retirer ; **"Tout effacer"** retire tous les tags d'un coup ; **Retour arrière** sur le champ vide retire le dernier tag ajouté.
- **Médias** : un fichier image ou vidéo pour le setup, la visée, et le résultat (les 3 sont obligatoires).

### 3. Créer

Clique sur **"Créer la lineup"**. Tu es redirigé vers le pool de la map, avec ta nouvelle lineup visible dans la grille.

## Mon livre

*(fonctionnalité à venir)* — sauvegarder des lineups depuis le pool, suivre celles que tu maîtrises, et ajouter des notes personnelles.

## Déconnexion

Utilise la route `/api/auth/logout` (bouton de déconnexion à intégrer dans l'interface).
