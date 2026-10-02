[English](README.md) · [Français](README.fr.md)

<div align="center">
  <img src="docs/assets/brand/logo-bruno-pizzaiolo.png" alt="Logo Bruno Pizzaiolo" width="260" />

  # Bruno Pizza — Production

  **Application desktop locale pour transformer un plan de production Excel en parcours de fabrication clair et exploitable en atelier.**

  React · TypeScript · Electron · Express · SQLite
</div>

## Le projet

Bruno Pizza répond à un besoin concret : préparer une production répartie
entre plusieurs distributeurs, puis guider sa fabrication pizza par pizza.
L’application importe un fichier Excel, le rapproche d’un catalogue métier et
propose trois espaces complémentaires :

- un **tableau de production** avec les quantités par variété et distributeur ;
- un **parcours atelier** avec recette, photo, progression et navigation ;
- des **paramètres métier** pour gérer pizzas, ingrédients et distributeurs.

La version 1.1.4 fonctionne entièrement en local. Excel reste l’unique source
de production ; l’intégration Adial n’entre pas encore dans son périmètre.

## V2 en préparation — non publiée

État au **1er octobre 2026** : édition du tableau avec **E**, totaux et repères
de correction ; thème sombre permanent ; exclusion des kits ; pizza suivante
plus visible ; galerie de **20 photos maximum par pizza** avec lecture automatique,
pause et durées de **1 à 15 secondes** parmi huit choix.

64 tests, lint, typage et compilation ont été validés localement. Retour métier
de Corentin, photos officielles et recette Windows restent attendus. Les numéros
de paquets restent ceux de la V1 ; aucun installateur V2 n'est disponible.
Voir [l'état et la recette restante](docs/V2_PREPARATION.md) et
[le journal daté](docs/JOURNAL_V2.md).

## Points forts

- import et validation d’un plan de production `.xlsx` ou `.xls` ;
- contrôle des en-têtes, doublons, quantités et totaux avant affichage ;
- catalogue SQLite modifiable avec recettes ordonnées et photos ;
- interface sombre, pilotable au clavier et zoomable ;
- affichage atelier en plein écran, avec chiffres et libellés principaux
  renforcés pour une lecture à distance ;
- persistance locale séparée des fichiers installés ;
- serveur Express limité à `127.0.0.1` avec port desktop dynamique ;
- origine Electron stable pour préserver la session entre les lancements ;
- tests frontend, backend et desktop exécutés automatiquement par GitHub.

## Aperçu V2 — démonstration locale

![Lecture des étapes et pizza suivante renforcée](docs/assets/screenshots/v2-production-demo.jpg)

![Tableau modifiable avec raccourci E](docs/assets/screenshots/v2-edition-demo.jpg)

Captures des essais locaux du 1er octobre 2026. Les photos de montage sont
fictives, générées pour tester le visuel ; elles ne représentent pas la recette
officielle. Le diaporama démarre désormais automatiquement, même si une capture
montre un état momentanément arrêté.

## Historique visuel V1

Captures de la V1 réalisées avec des données locales de démonstration.
La V2 en préparation utilise uniquement le thème sombre ; les captures claires
sont conservées comme historique de la version livrée.

| Tableau de production | Parcours de fabrication |
| --- | --- |
| ![Tableau de production avec les quantités par distributeur](docs/assets/screenshots/dashboard-dark.png) | ![Parcours de fabrication avec recette et photo de la pizza](docs/assets/screenshots/production-dark.png) |

| Catalogue des pizzas | Gestion des distributeurs |
| --- | --- |
| ![Configuration d'une pizza, de sa recette et de son visuel](docs/assets/screenshots/settings-pizzas-dark.png) | ![Configuration des distributeurs et de leurs couleurs](docs/assets/screenshots/settings-distributors-light.png) |

<details>
  <summary>Voir la galerie complète</summary>

| Import Excel | Tableau clair |
| --- | --- |
| ![État du tableau avant import d'un fichier Excel](docs/assets/screenshots/dashboard-empty-dark.png) | ![Tableau de production en thème clair](docs/assets/screenshots/dashboard-light.png) |

| Import Excel clair | Parcours clair |
| --- | --- |
| ![État du tableau avant import en thème clair](docs/assets/screenshots/dashboard-empty-light.png) | ![Parcours de fabrication en thème clair](docs/assets/screenshots/production-light.png) |

| Production terminée | Production terminée en clair |
| --- | --- |
| ![Bilan d'une production terminée en thème sombre](docs/assets/screenshots/production-complete-dark.png) | ![Bilan d'une production terminée en thème clair](docs/assets/screenshots/production-complete-light.png) |

| Configuration pizza claire | Ingrédients |
| --- | --- |
| ![Configuration d'une pizza en thème clair](docs/assets/screenshots/settings-pizzas-light.png) | ![Gestion des ingrédients en thème sombre](docs/assets/screenshots/settings-ingredients-dark.png) |

| Ingrédients clairs | Distributeurs |
| --- | --- |
| ![Gestion des ingrédients en thème clair](docs/assets/screenshots/settings-ingredients-light.png) | ![Gestion des distributeurs en thème sombre](docs/assets/screenshots/settings-distributors-dark.png) |
</details>

## Architecture

```mermaid
flowchart LR
    Excel["Plan de production Excel"] -->|"lecture et validation locales"| UI["React + TypeScript"]
    UI -->|"API locale"| API["Express"]
    UI --> Session["localStorage : production, corrections, position, vitesse"]
    API --> DB["SQLite"]
    API --> Images["Photos des pizzas"]
    Electron["Fenêtre Electron"] --> UI
    Electron -->|"démarre sur un port libre"| API
```

En développement, Vite et Express fonctionnent séparément. Dans l’application
desktop, Electron démarre le backend local et affiche le frontend compilé via
l’origine interne `bruno-pizza://app`.

## Essayer l’application

La page [Releases](https://github.com/JulienEsbt/bruno-pizza-production/releases)
permet de consulter les livraisons publiées. Référence historique documentée :
la V1 1.1.4 a été validée sur l’écran Windows 43 pouces de production :

- `Appli-Montage-Setup-1.1.4.exe` pour Windows Intel/AMD 64 bits.

La référence historique macOS Apple Silicon est
`Appli-Montage-1.1.3-macOS-Apple-Silicon.zip`.

Ces versions sont actuellement non signées et destinées aux tests. Windows
SmartScreen ou macOS Gatekeeper peut donc demander une confirmation au premier
lancement.

## Installation du projet source

Prérequis : Git, Node.js 22.5 ou supérieur et npm 10 ou supérieur.

```bash
git clone https://github.com/JulienEsbt/bruno-pizza-production.git
cd bruno-pizza-production
npm ci
npm run install:all
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

### Développement web

Lancer le backend et le frontend dans deux terminaux :

```bash
npm run dev:backend
```

```bash
npm run dev:frontend
```

L’interface est accessible sur `http://localhost:5173` et l’API sur
`http://127.0.0.1:3001`.

### Développement desktop

Pour construire puis ouvrir l’application Electron depuis les sources :

```bash
npm run desktop:start
```

## Qualité et construction

| Commande | Rôle |
| --- | --- |
| `npm run check` | Exécute le lint, le typage et les tests |
| `npm run build` | Construit le frontend et le backend |
| `npm run release:check` | Valide intégralement une livraison |
| `npm run desktop:package` | Produit un paquet pour le système courant |
| `npm run make:windows` | Produit l’installateur Windows depuis Windows |
| `npm start` | Sert le frontend compilé et l’API dans un seul processus |

## Données locales

Le dépôt ne contient aucune base utilisateur, photo de production, variable
d’environnement réelle ou feuille Excel importée.

| Mode | Emplacement des données |
| --- | --- |
| Projet source | `backend/data/` |
| Windows | `%APPDATA%\Bruno Pizza\data\` (conservé pour les mises à jour) |
| macOS | `~/Library/Application Support/Bruno Pizza/data/` (conservé pour les mises à jour) |

Une nouvelle base est automatiquement créée depuis le catalogue initial lors
du premier lancement. Une mise à jour du programme réutilise les données déjà
présentes sans les inclure dans l’installateur.

La table ci-dessus concerne SQLite et les photos. La production importée, ses
corrections, la position et la vitesse du diaporama sont dans le stockage du
navigateur, par origine. Une sauvegarde du dossier `data` ne les inclut pas.
Les photos de test locales ne sont pas présentes dans un clone neuf.

## Documentation

- [Guide utilisateur](docs/GUIDE_UTILISATEUR.md)
- [Format du fichier Excel](docs/FORMAT_EXCEL.md)
- [Installation et exploitation](docs/INSTALLATION_ET_EXPLOITATION.md)
- [Architecture technique](docs/ARCHITECTURE_TECHNIQUE.md)
- [Historique des versions](CHANGELOG.md)
- [État actuel et recette V2](docs/V2_PREPARATION.md)
- [Journal V2 : décisions et vérifications](docs/JOURNAL_V2.md)
- [Checklist de recette V2](docs/RECETTE_V2.md)

## Sécurité

Cette application est conçue pour un usage local de confiance. Son serveur ne
doit pas être exposé directement sur Internet ou sur un réseau non maîtrisé
sans authentification, HTTPS et règles réseau supplémentaires.

## Licence

Ce projet est distribué sous licence [MIT](LICENSE).

© 2026 Julien Esterbet
