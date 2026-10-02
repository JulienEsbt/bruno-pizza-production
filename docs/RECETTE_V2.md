# Recette V2 — Bruno Pizza

Préparée le 2 octobre 2026. Cases à cocher par Julien ; aucune case ne constitue
une validation déjà effectuée. Prévoir environ 30–45 minutes, puis la recette
Windows sur le poste de cuisine après fabrication de l'installateur.

## Préparer le test

- [ ] Ouvrir l’application desktop de test. Pour la variante navigateur seulement,
  ouvrir http://localhost:5173. Si nécessaire,
  lancer `npm run dev:backend` et `npm run dev:frontend` depuis la racine du dépôt.
- [ ] Utiliser le fichier de Corentin « Tableau de production - 2026-09-30.xlsx ».
  L'import remplace le tableau actuel : relever auparavant les corrections à garder.
- [ ] Pour conserver une session existante, utiliser un autre profil de navigateur.
  Attention : celui-ci isole le tableau, mais partage le catalogue et les photos
  s'il pointe vers le même backend. Faire les essais de retrait sur une pizza de test.
- [ ] Les quatre photos fictives sont sur la Reine de la base de développement.
  Elles ne sont pas la recette officielle. Elles sont versionnées et intégrées
  uniquement aux builds de test lorsque l’option de démonstration est activée.

## 1. Import réel et kits

- [ ] Importer le fichier. Attendu : 30 septembre 2026, 05:33, **192 pizzas**, **10 variétés**,
  **7 distributeurs**. Aucune ligne KIT Pizza, ni kit dans l'atelier ou le bilan.
- [ ] Totaux par distributeur, indépendamment de leur ordre d'affichage :
  Turenne 19 ; CHAL 27 ; VAUX 31 ; FAYL 32 ; INTER 34 ; Longeau 21 ; Montigny 28.
- [ ] Vérifier quelques variétés : Reine 13, Burger 20, Kebab 27, Poulet Curry 28.
- [ ] Réimporter le même fichier sans correction : mêmes résultats, aucun doublon.
- [ ] Essayer un fichier invalide (un simple fichier texte suffit) : message
  compréhensible et production actuelle intacte.

## 2. Édition et calculs

- [ ] Cliquer Modifier le tableau : commandes − / + et saisie visibles ; bouton
  de même hauteur que les autres actions. Terminer l'édition conserve les valeurs.
- [ ] Appuyer E : activer puis terminer. Cliquer dans un champ et appuyer E :
  pas de bascule ; les lettres ne deviennent pas une quantité.
- [ ] Sur **Reine / Turenne**, passer **1 à 2** avec +. Attendu : Reine **14**,
  Turenne **20**, total général **193**, total de sa base augmenté de 1, repère jaune.
  Le survol rappelle la valeur d'origine **1**.
- [ ] Revenir à 1 : 13 / 19 / 192 ; disparition du repère si aucune autre correction.
- [ ] Saisir directement 10, puis revenir à 1 : tous les totaux suivent. Essayer
  lettre, nombre négatif et décimal : aucune quantité invalide ne doit être acceptée.
- [ ] Vider temporairement la saisie puis quitter le champ : dernière quantité valide conservée.
- [ ] Sur une case à zéro, − est désactivé ; + permet de passer à 1 et de revenir à zéro.
- [ ] Mettre toutes les cases de la Reine à zéro : sa ligne reste éditable, mais
  elle disparaît du parcours atelier ; la remettre ensuite avec Rétablir l'Excel.
- [ ] Annuler Rétablir l'Excel : corrections conservées. Accepter : valeurs initiales
  et repères réinitialisés. Le fichier Excel original n'est jamais réécrit.
- [ ] Sur une production de test entièrement mise à zéro : accès Production désactivé,
  édition et rétablissement encore possibles.

## 3. Conservation et réimport

- [ ] Refaire Reine / Turenne 1 → 2, quitter l'édition et actualiser : 193 et repère conservés.
- [ ] Fermer/réouvrir le même navigateur/profil à la même adresse : même tableau corrigé.
- [ ] Avec cette correction, importer à nouveau l'Excel : avertissement.
  **Annuler** : 193 et repère conservés. Recommencer et **accepter** : 192, sans repère.
- [ ] Import invalide après une correction : correction et production toujours présentes.
- [ ] Commencer le parcours, avancer de deux pizzas, revenir au tableau et modifier
  une quantité : l'atelier doit reprendre à la première pizza avec les nouvelles valeurs.
- [ ] Sans correction entre-temps, revenir à l'atelier : position du parcours retrouvée.

## 4. Atelier et lisibilité

- [ ] Quantité courante et répartition par distributeur cohérentes avec le tableau corrigé.
- [ ] Précédente / suivante, progression et bilan de fin cohérents ; aucun kit.
- [ ] « Suivante », nom et quantité lisibles d'un coup d'œil ; vérifier FRANC-COMTOISE
  et une quantité à trois chiffres sur une donnée de test.
- [ ] Recette lisible dans son ordre, images entières et coins arrondis, aucun
  bouton essentiel masqué. Sur petite hauteur, le défilement reste accessible.
- [ ] Faire défiler le tableau : aucun chiffre ne transparaît derrière les totaux fixes.
- [ ] Thème sombre au démarrage, dans chaque écran et dans le bilan ; T ne change rien.
- [ ] Raccourcis I, E, P, Entrée, flèches et Échap dans les écrans concernés ;
  ils n'interrompent pas la saisie dans un champ. Les flèches du clavier changent
  de pizza ; les boutons ‹ / › du visuel changent de photo.

## 5. Lecture des photos — Reine

- [ ] Ouvrir la Reine : départ automatique à la première photo, étapes successives,
  puis retour au début après la finale.
- [ ] Pendant la lecture, cliquer ‹ / › puis Image finale : la lecture reste active.
- [ ] Pause : image stable au-delà de la durée choisie. En pause, ‹ / › et Image
  finale changent l'image sans relancer. Lire les étapes reprend depuis l'image affichée.
- [ ] Les huit choix sont présents : **1, 2, 3, 5, 8, 10, 12, 15 secondes**.
  Tester le défilement à 1 s puis à 15 s. Choisir 12 s, actualiser : choix conservé.
- [ ] Passer à une autre pizza puis revenir : première étape, lecture automatique.
- [ ] Pizza à une seule photo : image fixe. Pizza sans photo : indication claire,
  aucune image provenant de la pizza précédente.

## 6. Gestion des photos — pizza de test uniquement

- [ ] Dans Paramètres, ajouter plusieurs JPEG/PNG/WebP en une fois. Avec des noms
  1, 2 et 10 sélectionnés dans le désordre, vérifier le tri naturel.
- [ ] La dernière photo est Pizza terminée. Si une finale existait, les nouvelles
  étapes sont insérées avant elle. Les flèches permettent de changer cet ordre.
- [ ] Réordonner, changer de page et actualiser : ordre conservé en paramètres et en atelier.
- [ ] Retirer une photo puis annuler : galerie intacte. Confirmer sur une photo de
  test : une seule photo retirée. Retirer la finale : la précédente devient finale.
- [ ] Retirer la seule image d'une pizza de test : état sans photo correct.
- [ ] Limites sur données de test : 20 images acceptées, 21e refusée ; fichier
  supérieur à 8 Mio, GIF ou fichier non-image refusé, galerie existante conservée.
- [ ] Après les essais, retirer uniquement la pizza/les images créées pour le test,
  et remettre la durée de lecture souhaitée. Ne pas supprimer une recette officielle.

## 7. Contrôles techniques / Windows avant livraison

À faire sur une copie des données et sur le futur paquet, pas sur la seule base de cuisine.

- [ ] Sauvegarder le dossier data complet application arrêtée ; vérifier la possibilité
  de restauration. La production corrigée du navigateur n'est pas dans SQLite.
- [ ] Démarrage V2 sur copie V1 : catalogue intact, ancienne photo conservée,
  sauvegarde SQLite pré-migration créée ; second démarrage sans migration répétée.
- [ ] Simuler une image manquante : message, pause de protection, autres photos accessibles.
- [ ] Si le backend est indisponible : message clair ; son retour permet de réessayer.
- [ ] Installateur Windows : ouverture, mise à jour, raccourci, données préservées,
  fermeture/réouverture et annulation/acceptation des boîtes de confirmation.
- [ ] Écran de cuisine : lisibilité à distance, plein écran, zoom Windows réel,
  Ctrl +/−/0, boutons accessibles et absence de débordement gênant.
- [ ] Corentin valide les vraies photos, leur ordre, la lecture automatique et l'usage
  quotidien des corrections. Accord commercial à confirmer séparément.

## Remonter un résultat

Pour chaque problème : numéro du test, écran/pizza, action faite, résultat obtenu,
résultat attendu et capture. Indiquer navigateur ou application Windows, taille
d'écran et zoom. Un simple « blocs 1 à 5 OK, souci au 6 sur … » suffit pour reprendre.

**Statut : recette manuelle à réaliser.** Les tests automatiques et l'import
programmatique ne remplacent pas cette validation ni celle du poste de cuisine.

## Complément — application de test avec photos intégrées (2 octobre 2026)

Le build macOS de démonstration ajoute automatiquement les quatre images à la Reine. Si une photo existait déjà, elle est conservée en dernière position : cinq images dans la session macOS vérifiée. Voir [Photos de démonstration](PHOTOS_DEMO_V2.md) pour l’option Windows et le contrôle de non-réapparition après suppression. Sur une case corrigée, le survol ou le focus clavier montre explicitement `Excel : valeur initiale → valeur actuelle`.
