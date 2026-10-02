# Journal V2 — décisions et vérifications

Ce journal conserve l'état de chaque lot au moment de sa réalisation. Les règles
de lecture ont changé le 1er octobre : les mentions de finale fixe et de quatre
vitesses ci-dessous sont historiques. Pour le comportement actuel et les actions
restantes, lire [V2_PREPARATION.md](V2_PREPARATION.md).
Les validations navigateur ne remplacent pas la recette sur le poste Windows.

## Premier lot du 30 septembre 2026

Ce lot implémente trois demandes de Corentin : exclusion des kits accessoires,
thème sombre permanent et agrandissement de la pizza suivante. Il n'est pas
publié et n'inclut pas encore l'édition de la matrice ou le diaporama.

### Vérifications

- `npm run release:check` : 10 tests desktop, 21 frontend et 11 backend ; lint,
  typage et compilation réussis.
- Reprise d'une session créée par la V1, avec « KIT Pizza » = 1 et trois
  recettes totalisant 124 : passage du total 125 à 124, recettes et date
  conservées, kit absent du tableau, de la production et du récapitulatif.
- Ancienne préférence claire : démarrage sombre dès le chargement de la V2.
  Bouton et légendes de thème absents ; `T` sans effet dans le tableau,
  les paramètres et le récapitulatif.
- Import d'un fichier avec seulement des kits : ancienne production remplacée,
  total zéro, démarrage de production désactivé, résultat conservé après
  rechargement.
- Affichage de la pizza suivante : nom long « FRANC-COMTOISE » et quantités
  à deux/trois chiffres contrôlés dans le navigateur ; quantité à 76 px
  en 1920 × 1080 et environ 59 px en 1366 × 768. Recette défilable lorsque
  l'écran est plus petit ; la lisibilité à distance reste à vérifier en cuisine.
- Aucun avertissement ni erreur de console relevé sur le parcours de test.

Les scénarios utilisent des fichiers Excel de test et une base distincte.
La validation navigateur ne remplace pas la recette Windows sur l'écran réel.
Le catalogue et les photos de l'installation existante ne sont pas modifiés.

### Règle d'exclusion

Seuls les libellés complets « Kit Pizza », avec variantes de casse, espaces,
ponctuation et pluriel, sont exclus. Une recette inconnue n'est pas supprimée.
Un Excel récent de Corentin reste nécessaire pour vérifier les libellés réels
et comprendre le déclencheur observé sur son poste.

## Suite du chantier

1. Retour de Corentin sur l'Excel avec kits et le devenir des corrections.
2. Chargement des vraies photos d'étapes lorsqu'elles seront fournies.
3. Version de livraison, paquet Windows et recette atelier sur copie des données.

Le code couvre les cinq demandes du document. Le devenir des corrections lors
d'un nouvel import, l'ajout éventuel de variétés absentes de l'Excel et les choix
de lecture peuvent encore être ajustés au retour de Corentin. Le démarrage est maintenant
automatique, à la demande de Julien le 1er octobre ; ce choix remplace la finale
fixe du document initial et reste à faire valider à Corentin.

## Deuxième lot du 30 septembre 2026 — édition

Réalisé localement : bascule d'édition, − / + et saisie, totaux dérivés,
marqueurs de correction avec quantité initiale, rétablissement confirmé,
sauvegarde immédiate, reprise des sessions version 2, zéro conservé dans le
tableau mais ignoré en atelier. Le compteur d'emplacement accepte maintenant
100 sans tronquer le dernier chiffre.

Hypothèses provisoires annoncées à Julien : corrections conservées après
fermeture, remplacées au prochain import valide après avertissement ; atelier
repris au début après toute correction. Pas d'ajout de variété absente/initialement
à zéro. Ces choix sont ajustables au retour de Corentin.

### Vérifications du deuxième lot

- Contrôle complet : 10 tests desktop, 28 frontend (7 nouveaux), 11 backend ;
  lint, typage et compilations réussis.
- Tests des corrections successives et de l'origine immuable, retour à l'origine,
  zéro complet, restauration version 3, anciennes cases implicitement nulles,
  quantités invalides/débordements, sauvegardes incohérentes et nouvel import.
- Navigateur, base et Excel de test : 124 → 123 après modifications des bases
  tomate/crème ; conservation après rechargement ; Reine à zéro ignorée en
  atelier ; production entièrement à zéro désactivée ; rétablissement à 124.
- Import invalide conservant les 125 pizzas et la correction ; avertissement
  natif observé pour l'import valide, puis nouvelles valeurs et marqueurs remis
  à zéro. L'annulation de la boîte native n'a pas pu être pilotée : elle s'est
  refermée avant l'action suivante. La branche de refus est relue dans le code ;
  une annulation manuelle reste à vérifier en recette Windows.
- Matrice de 12 variétés et 7 emplacements : commandes sans débordement horizontal
  en 1920 × 1080 et 1366 × 768 ; défilement vertical et édition de la dernière
  ligne contrôlés sur le petit format ; corrections conservées au rechargement.
- Aucune erreur ni aucun avertissement dans la console navigateur.

Pas de paquet Windows, publication, commit ou push. Le diaporama reste le
prochain lot. La recette sur le poste de cuisine reste nécessaire.

## Troisième lot du 30 septembre 2026 — galerie et diaporama

- Galerie de 20 images maximum par pizza, 8 Mo par fichier JPEG/PNG/WebP.
- Envoi multiple, tri naturel des nouveaux noms (1, 2, 10), insertion avant la
  finale existante et réorganisation par flèches. Retrait confirmé par image.
- Finale fixe par défaut ; lecture/pause, boucle, précédent/suivant, bouton finale ;
  durée 2/3/5/8 secondes mémorisée sur l'appareil. Changer de pizza arrête la lecture.
- Anciennes photos reprises sans réécriture de fichier, après sauvegarde cohérente
  de la base peuplée. Migration et ordre transactionnels. Un lot invalide ou un
  échec SQLite conserve la galerie précédente. Une image manquante arrête le lecteur.

### Vérifications du troisième lot

- 64 tests automatiques : 10 desktop, 32 frontend, 22 backend ; lint, types et
  compilation réussis. Migration avec sauvegarde, échec/rollback, non-résurrection,
  tri numérique, lots invalides, échec de transaction, ordre périmé, suppression,
  compatibilité des endpoints et nettoyage d'une pizza couverts.
- Navigateur sur une copie de base V1 avec photo de test : ancienne photo retrouvée
  à l'arrêt (1/1), fichiers ajoutés dans le désordre remis à 1/2/finale, déplacement
  d'image conservé après rechargement, annulation du retrait conservant les 3 images.
- Lecture à 2 s : passage effectif à l'étape 2, pause stable, reprise, finale puis
  retour à l'étape 1 ; bouton finale arrêtant la lecture ; changement de pizza
  sans photo puis retour à la Reine réouvrant la finale. Durée 5 s conservée au
  rechargement.
- Image de test volontairement rendue indisponible : message clair, lecture arrêtée,
  accès à l'étape suivante conservé ; fichier ensuite restauré.
- Image complète en 1920×1080 et 1366×768 après correction de sa contrainte de grille.
  Photo V1 de test conservée octet pour octet ; copie pré-migration présente.
- Pas d'erreur JavaScript ni d'avertissement de console relevé sur le parcours.
  Le retrait confirmé est couvert par les tests HTTP ; l'annulation est vérifiée en UI.

Les images de démonstration sont des schémas de test, pas les recettes de Corentin.
Aucune modification de la base ni des photos de l'installation réelle. Aucun
commit, push, lancement GitHub Actions, publication ou paquet Windows réalisé.
La fabrication Windows existante est manuelle sur GitHub ; son nom de version et
le numéro du paquet sont encore ceux de la V1 (1.1.4), à préparer avant livraison.

### Ce qui dépend du retour terrain

- Excel récent pour valider les libellés exacts des kits et le cas observé.
- Confirmation du remplacement des corrections au nouvel import et de la reprise
  atelier au début après correction (hypothèses annoncées à Julien).
- Photos des vraies étapes, leur ordre et la validation visuelle en cuisine.
- Chiffrage final en heures, puis recette Windows et accord de livraison.


## Quatrième lot du 1er octobre 2026 — photos de test et finitions

- Quatre photos générées, cohérentes et numérotées (tomate, fromage, jambon,
  champignons), chargées uniquement dans une base de test séparée. Recette fictive,
  pas la recette officielle de la Reine. Pack et captures dans les livrables locaux.
- Bouton d’édition réutilisant l’action commune : 64 px, icône, badge E,
  état pressé et `aria-keyshortcuts`. E active/termine l’édition, y compris avec
  focus sur un bouton ; ignoré dans les champs, avec modificateurs, dans un
  dialogue, à répétition, sans lignes ou pendant l’import.
- Indication explicite des quantités hors bases tomate/crème mais incluses dans
  le total général, afin de rendre l’écart compréhensible.
- Guide utilisateur mis à jour pour E.

Vérifié : 64 tests, lint, typage et compilation ; import des quatre photos dans
le désordre puis tri correct ; finale initiale 4/4, lecture 2 s, pause stable,
retour finale, changement de pizza et retour à l’arrêt. Contrôle à 1366×768 et
1920×1080, photos entières, boutons à 64 px et aucun débordement horizontal.
E ne quitte pas l’édition pendant une saisie ; E sur le bouton fonctionne dans
les deux sens. Correction d’une quantité hors bases 12→13, total 165→166,
puis retour aux valeurs de départ. Pas d’erreur ni avertissement navigateur.

Document original de Corentin relu : aucune demande supplémentaire non traitée.
Restent ses données et confirmations métier, les photos officielles et la recette
Windows, dont l’annulation des boîtes natives. Versions, commits, push et paquets
Windows sont reportés à la demande de Julien.

Dernière correction visuelle : le dégradé du total général et de son en-tête
laissait apparaître les chiffres des lignes passant derrière les cellules fixes.
Un fond opaque conserve le dégradé et supprime ce chevauchement, vérifié en
1366×768, en lecture et en édition. Compilation frontend validée après ce CSS.


## Ajustements demandés par Julien — 1er octobre 2026

Cette décision remplace la finale fixe initialement demandée par Corentin :
lecture automatique depuis la première étape dès l'ouverture d'une galerie de
plusieurs images. Une photo seule reste fixe. Les flèches et Image finale
conservent l'état lecture/pause ; reprise sur l'image courante, même la finale.
Vitesses 1/2/3/5/8/10/12/15 s. Arrêt de protection conservé sur image introuvable.

Coins arrondis sur la photo elle-même, sans recadrage ; encadrement plus sobre.
Bloc suivante intégré au bas du panneau : libellé et nom à gauche, grande quantité
à droite sur les deux lignes. Tailles du nom et de la quantité conservées.
Les 4 photos de test sont présentes sur la Reine de la base locale habituelle
(localhost:5173, backend:3001), depuis la demande explicite de Julien.
Ces choix restent à faire valider à Corentin avant commit/push/livraison.

Vérifications de ces ajustements : 64 tests réussis, lint, types et compilation.
Dans localhost:5173, lecture initiale et au retour sur Reine, navigation en lecture
et en pause, boucle effective à 1 seconde, préférence 12 secondes conservée au
rechargement. Photo entière et rayon de 12 px contrôlés dans le navigateur.

## Lisibilité renforcée et documentation — 1er octobre 2026

- Libellé « Suivante » orange et agrandi, nom plus grand et plus épais, quantité
  renforcée ; disposition intégrée conservée. Contrôle à 1366 × 768 avec
  FRANC-COMTOISE et compilation frontend réussie après cette retouche CSS.
- Limite confirmée dans le code : 20 images par pizza, 8 Mio par image.
- Documentation française et anglaise harmonisée avec les choix actuels ;
  historique V1 conservé, captures V2 de démonstration ajoutées, procédure de
  sauvegarde précisée (SQLite/photos distincts du stockage navigateur).
- Documents de référence du client conservés comme sources historiques ; aucun
  changement du code, des données ou des versions dans ce lot documentaire.
- Aucune fabrication Windows, publication, création de commit ou push pour la V2.
  Le suivi Notion/Taskade constitue un état daté, sans synchronisation automatique.

## Retour client et préparation de recette — 2 octobre 2026

- Fichier réel de Corentin vérifié avec `parseProductionExcelFile` : 192 pizzas,
  10 variétés et 7 distributeurs ; la ligne KIT Pizza est exclue. Le fichier
  original reste intact et n'est pas ajouté au dépôt.
- Vérification programmatique sur cet import : correction +1, totaux recalculés,
  marqueur, conservation à la restauration, rétablissement et nouvel import.
- Corentin confirme l'usage quotidien des corrections et les repères visuels ;
  l'avertissement n'est pas obligatoire pour lui. La fermeture/réouverture,
  le nouvel import et l'usage en cuisine restent des points de recette manuelle.
- Nouveau `npm run release:check` réussi : 10 tests desktop, 32 frontend,
  22 backend, lint, typage et builds frontend/backend.
- Checklist [RECETTE_V2.md](RECETTE_V2.md) ajoutée, entièrement à cocher par
  l'utilisateur. Aucun nouvel essai UI ou Windows n'est revendiqué par ce lot.
- Julien autorise les commits locaux par fonctionnalité ; push, nouvelle version,
  fabrication Windows et portfolio restent des étapes ultérieures.
