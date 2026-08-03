# Historique des versions

Toutes les évolutions significatives de Bruno Pizza sont consignées ici.

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
