# Historique des versions

Toutes les évolutions significatives de Bruno Pizza sont consignées ici.

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

- l’en-tête du tableau est conservé ; sa réorganisation reste une piste de
  secours si la recette d’affichage doit encore évoluer après essai sur le
  téléviseur 43 pouces ;
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
