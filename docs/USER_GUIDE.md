# Guide utilisateur — smokelab

## Connexion

1. Ouvre le site.
2. Clique sur **"Se connecter avec Steam"**.
3. Autorise la connexion sur la page Steam.
4. Tu es redirigé vers smokelab, connecté avec ton pseudo et ton avatar Steam.

## Choisir une map

La page d'accueil affiche une galerie des 10 maps du pool actif (Mirage, Inferno, Dust2, Nuke, Overpass, Ancient, Anubis, Vertigo, Train, Cache). Clique sur une vignette pour ouvrir le pool de lineups de cette map.

## Le radar d'une map

En haut de la page d'une map se trouve le radar (vue du dessus), avec 4 boutons de type de grenade (smoke, flash, molotov, HE) — **smoke est sélectionné par défaut**. Le type choisi ici filtre à la fois le radar et la grille de lineups en dessous.

- **Molette de la souris** : zoome/dézoome, centré sur la position du curseur.
- **Clic maintenu + glisser** : déplace la vue quand tu es zoomé.
- Chaque point de lancement s'affiche avec l'icône du type de grenade. Si plusieurs lineups partent du même endroit, elles sont regroupées en un seul point avec un chiffre indiquant le nombre.
- **Survole** un point pour voir un aperçu (vidéo + infos) de la lineup, quand le point n'est pas ambigu.
- **Clique** sur un point de départ pour révéler, en pointillés, où atterrissent la ou les lineups associées. Si plusieurs lineups atterrissent au même endroit, survole le point d'atterrissage pour faire apparaître un petit rond par lineup ; clique sur l'un d'eux pour ouvrir la lineup correspondante.

## Parcourir le pool d'une map

La grille sous le radar affiche les lineups du type sélectionné, chacune avec : aperçu animé (gif), type, difficulté (pastilles), point de départ → point d'arrivée, et tags. Clique sur une vignette pour ouvrir le détail.

## Le détail d'une lineup

En cliquant sur une vignette (ou un point du radar), une fenêtre s'ouvre avec :

- **Gif** : l'aperçu animé en grand, avec les contrôles vidéo (lecture, retour arrière, son) si c'est une vidéo.
- **Visée & résultat** : les deux images/vidéos côte à côte. Clique sur l'une d'elles pour l'agrandir en plein écran (avec zoom molette et déplacement par glisser) ; **Échap** referme d'abord l'image agrandie, puis la fenêtre.
- **Mes livres** : ouvre la liste de tes livres pour la map de cette lineup (coche/décoche pour l'ajouter ou la retirer d'un ou plusieurs livres), avec un champ pour en créer un nouveau à la volée.
- **Modifier** et **Supprimer** : visibles uniquement si tu es le créateur de la lineup, ou administrateur.
- **Échap** ou clic en dehors de la fenêtre pour la fermer.

## Ajouter une lineup

Depuis la page d'une map, clique sur **"+ Ajouter une lineup"** (ou **"Modifier"** depuis le détail d'une lineup existante — même formulaire, pré-rempli).

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
- **Tags** : tape un mot-clé, des suggestions parmi les tags courants (one-way, jump-throw, pixel-perfect...) apparaissent — appuie sur **Entrée** pour ajouter le tag tapé ou clique une suggestion. Chaque pastille de tag est cliquable pour la retirer ; **"Tout effacer"** retire tous les tags d'un coup ; **Retour arrière** sur le champ vide retire le dernier tag ajouté.
- **Médias** : un fichier image ou vidéo pour la visée/lineup, le résultat, et un gif. En modification, laisser un champ média vide conserve le fichier déjà en place.

### 3. Valider

Clique sur **"Créer la lineup"** (ou **"Enregistrer les modifications"**). En cas d'erreur (positions non placées, média manquant...), un message s'affiche directement dans le formulaire — rien n'est perdu, corrige et renvoie.

## Mon profil

Accessible via le lien **"Mon profil"** (accueil ou page de map). Affiche ton pseudo, ton avatar, tes abonnés/abonnements, tes **livres** (groupés par map, chacun avec son nombre de lineups), et les **lineups que tu as créées**. Depuis ici tu peux créer un nouveau livre (bouton **"+ Nouveau livre"**, choix de la map + nom) ou supprimer un livre existant (croix sur sa vignette).

Clique sur un livre pour voir son contenu (mêmes vignettes et fenêtre de détail que le pool).

## Le profil d'un autre joueur

En visitant `/u/<son-pseudo-steam>` (ou en cliquant sur son profil quand ce sera lié depuis une lineup), tu vois les mêmes informations, avec en plus :

- **Suivre** / **Abonné ✓** : t'abonne ou te désabonne de cette personne (aucune approbation nécessaire).
- Sur chacun de ses livres : bouton **"Copier"** — crée une copie complète du livre dans ton propre compte, sur la même map.
- En ouvrant un de ses livres : une case à cocher apparaît sur chaque vignette pour en sélectionner plusieurs, puis **"Ajouter à mes livres"** en bas de l'écran ouvre le même sélecteur de livres que partout ailleurs, pour choisir où les ranger chez toi.

## Déconnexion

Bouton **"Déconnexion"** présent sur la galerie, la page de map, et ton profil.
