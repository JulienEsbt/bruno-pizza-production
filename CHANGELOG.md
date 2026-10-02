# Historique des versions

## 1.2.0 — build de recette V2 — 2026-10-02

- Ajout : photos de démonstration de la Reine, embarquées uniquement dans les builds de test sur option, installation unique sans remplacement des photos existantes.
- Correction : valeur Excel initiale affichée explicitement au survol et au focus des cases modifiées.
- Validation : 67 tests automatiques, packaging macOS et contrôle dans l’application. Windows reste à fabriquer et recetter.

Toutes les évolutions significatives de Bruno Pizza sont consignées ici.

## V2 en préparation — non publiée — état au 1er octobre 2026

### Production et corrections

- Exclusion des libellés complets « Kit Pizza » et variantes normalisées de
  l'import et des productions sauvegardées ; les autres recettes restent visibles.
- Un fichier valide contenant uniquement des kits remplace la journée par une
  production vide, avec sa date.
- Édition des quantités par − / + ou saisie entière positive ou nulle ; bouton
  aligné sur les autres actions, raccourci `E` et état pressé accessible.
- Recalcul des totaux par variété, emplacement et base ; repères jaunes avec
  valeur Excel d'origine, retirés en revenant à cette valeur.
- Corrections conservées localement ; rétablissement confirmé des valeurs Excel
  et avertissement avant remplacement par un nouvel import valide.
- Lignes corrigées à zéro conservées dans le tableau et ignorées en atelier ;
  reprise à la première pizza après une correction.
- Stockage navigateur version 3, reprise de la version 2 et validation des données
  relues ; sauvegarde avant d'accepter la modification dans l'interface.

### Photos et lecture des étapes

- Galerie ordonnée de 20 images maximum par pizza, JPEG/PNG/WebP, 8 Mio par image.
- Envoi multiple, tri naturel des noms, insertion avant la finale existante,
  réorganisation par flèches et retrait confirmé ; la dernière image est la finale.
- Lecture automatique depuis la première étape si plusieurs images, en boucle ;
  une image seule reste fixe. Pause explicite, reprise depuis l'image courante.
- Les flèches d'image et le bouton Image finale conservent l'état lecture/pause.
  Changer de pizza ou revenir à l'atelier relance la lecture à la première étape.
- Durées de 1, 2, 3, 5, 8, 10, 12 ou 15 secondes, défaut 3 s, préférence mémorisée.
  Le délai commence après chargement ; une image indisponible suspend la lecture.
- Reprise transactionnelle des anciennes photos sans réécriture des fichiers,
  avec sauvegarde SQLite cohérente avant migration d'une ancienne base peuplée.
- Validation de tout le lot avant écriture, protection contre les ordres périmés
  et nettoyage des nouveaux fichiers en cas d'échec.

### Présentation

- Thème sombre permanent ; suppression de la bascule clair/sombre et de `T`.
- Pizza suivante intégrée au bas du panneau : libellé orange, nom renforcé,
  grande quantité ; contrôles navigateur à 1366 × 768 et avec un nom long.
- Photos entières, coins arrondis sur l'image et encadrement plus discret.
- Compteurs d'emplacement à trois chiffres sans troncature ; explication des
  quantités hors bases tomate/crème ; fond opaque sous les cellules de total fixes.

### État de validation

64 tests automatiques réussis (10 desktop, 32 frontend, 22 backend), lint,
typage et compilation validés ; parcours navigateur vérifiés. Les dernières
retouches de taille de la pizza suivante ont aussi été compilées et contrôlées
visuellement. Voir le [suivi actuel](docs/V2_PREPARATION.md) et le
[journal daté](docs/JOURNAL_V2.md) pour la portée et les limites de ces contrôles.

Quatre photos fictives de test ont été ajoutées à la Reine dans la base de
développement de Julien, sur sa demande. Elles ne sont ni la recette officielle,
ni des données incluses dans le dépôt ou un installateur.

Retour de Corentin et recette Windows encore attendus. Le démarrage automatique
choisi par Julien remplace la finale fixe du document initial et doit être validé
sur le terrain. Aucun numéro de livraison V2 n'est encore attribué.

## 1.1.4 — 17 août 2026

### Affichage atelier

- ouverture de l’application en plein écran sans bordure afin de masquer la
  barre de titre et la barre des tâches sur l’écran de production ;
- zoom initial adapté à l’écran : 100 % en affichage classique et 80 % lorsque
  Windows utilise une très forte mise à l’échelle, avec une plage de 70 % à
  130 % ;
- remise à zéro du zoom compatible avec la touche `0` des claviers AZERTY ;
- lignes du tableau compactées pour afficher davantage de pizzas sans défilement
  vertical sur un écran Full HD ;
- agrandissement ciblé des noms de pizzas, quantités, totaux et intitulés des
  distributeurs, sans grossir toute l’interface ;
- affichage complet des photos de pizzas dans le parcours de fabrication, sans
  rognage automatique.

### Périmètre

- validation terrain sur l’écran Windows 43 pouces de production : tableau
  complet lisible sans défilement au zoom initial et parcours de fabrication
  fonctionnel ;
- l’en-tête du tableau est conservé, sans la réorganisation envisagée pendant
  les premiers essais ;
- l’automatisation de la récupération du fichier de production reste une piste
  future et n’entre pas dans cette version.

## 1.1.3 — 3 août 2026

### Identité produit

- l’application desktop, les installateurs Windows et macOS prennent le nom
  **Appli Montage** ;
- ajout de l’identité visuelle Bruno Pizzaiolo ;
- conservation volontaire du dossier de données historique afin qu’une mise à
  jour ne réinitialise ni le catalogue ni les photos existants.

## 1.1.2 — 3 août 2026

### Correctif

- les photos ajoutées aux pizzas restent affichées après un changement
  d’onglet, de page ou de mode de production.

## 1.1.1 — 3 août 2026

### Correctifs et ergonomie

- correction des enregistrements `POST`, `PATCH`, `PUT` et `DELETE` dans les
  applications Electron Windows et macOS ;
- réorganisation des pizzas par glisser-déposer, avec flèches haut et bas au
  clavier comme pour les distributeurs.

## 1.1.0 — 3 août 2026

### Évolutions

- catalogue initial aligné sur les 11 pizzas actives et leur ordre métier ;
- migration prudente de l’ancien catalogue intact sans écraser les
  personnalisations existantes ;
- centrage amélioré du tableau de production ;
- distributeurs plus lisibles dans le parcours de fabrication ;
- zoom desktop par raccourcis clavier et molette ;
- livraison Windows x64 et macOS Apple Silicon réunies dans une Release privée.

## 1.0.1 — 3 août 2026

### Correctif

- restauration du chargement de l’interface dans l’application Windows
  empaquetée grâce à une origine desktop stable.

## 1.0.0 — 31 juillet 2026

Première version stable destinée aux essais en conditions réelles.

### Fonctionnalités

- import sécurisé d’une production Excel dans le navigateur ;
- tableau de répartition par variété et distributeur ;
- parcours de fabrication avec recette, photo et progression ;
- catalogue SQLite des pizzas, ingrédients et distributeurs ;
- réorganisation par glisser-déposer des recettes et distributeurs ;
- thèmes clair et sombre et navigation complète au clavier ;
- gestion locale des photos de production.

### Qualité et sécurité

- architecture frontend organisée par fonctionnalité ;
- backend en couches HTTP, services, dépôts et SQLite ;
- validations métier avant écriture ;
- limites de taille sur les fichiers Excel, JSON et images ;
- contrôle de la signature binaire des images ;
- tests unitaires frontend et tests d’intégration backend ;
- serveur de production unique pour l’interface et l’API.

### Périmètre

- Excel est l’unique source de production ;
- l’intégration Adial n’est pas incluse dans cette version.
