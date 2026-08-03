# Bruno Pizza — Production 1.1.0

Application locale d’aide à la fabrication des pizzas. Une production est
importée depuis Excel, rapprochée du catalogue métier SQLite, puis présentée
sous forme de tableau de répartition et de parcours atelier.

La version 1.1.0 utilise **Excel comme unique source de production**.
L’intégration Adial est volontairement hors périmètre.

## Livraisons desktop

La [Release privée 1.1.0](https://github.com/JulienEsbt/bruno-pizza-production/releases/tag/v1.1.0)
contient les deux livraisons :

```text
Bruno-Pizza-Setup-1.1.0.exe
Bruno-Pizza-1.1.0-macOS-Apple-Silicon.zip
```

La première cible Windows est prévue pour les PC Intel/AMD 64 bits. La cible
macOS fonctionne sur les Mac Apple Silicon (M1 et générations suivantes). Les
deux versions sont actuellement non signées et réservées aux tests internes.
Elles ne demandent ni Node.js ni terminal à l’utilisateur.

Les données ne sont jamais placées dans le dossier de l’application. Elles
restent dans le profil de l’utilisateur, ce qui permet de remplacer ou de
réinstaller l’application sans écraser le catalogue ni les photos.

## Cloner et développer le projet

Le packaging desktop ne change pas le fonctionnement du projet source. Après
un clonage, il est toujours possible de lancer séparément le backend et le
frontend, de modifier le code dans un IDE et d’utiliser l’application Electron.

Prérequis : Git, Node.js 22.5 ou supérieur et npm 10 ou supérieur.

```bash
git clone https://github.com/JulienEsbt/bruno-pizza-production.git
cd bruno-pizza-production
npm ci
npm run install:all
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

En développement, lancer les deux commandes dans deux terminaux :

```bash
npm run dev:backend
npm run dev:frontend
```

L’interface est alors accessible sur `http://localhost:5173`.

Pour construire puis ouvrir l’application Electron depuis les sources :

```bash
npm run desktop:start
```

Pour vérifier et lancer la version de production :

```bash
npm run release:check
npm start
```

Le backend sert alors l’API et l’interface sur `http://127.0.0.1:3001`.

## Documentation

- [Guide utilisateur](docs/GUIDE_UTILISATEUR.md)
- [Format du fichier Excel](docs/FORMAT_EXCEL.md)
- [Installation et exploitation](docs/INSTALLATION_ET_EXPLOITATION.md)
- [Architecture technique](docs/ARCHITECTURE_TECHNIQUE.md)
- [Historique des versions](CHANGELOG.md)

## Commandes du projet

| Commande | Rôle |
| --- | --- |
| `npm ci` | Installe les dépendances Electron et de packaging |
| `npm run install:all` | Installe les dépendances frontend et backend verrouillées |
| `npm run dev:backend` | Lance l’API locale avec rechargement automatique |
| `npm run dev:frontend` | Lance l’interface de développement |
| `npm run check` | Exécute lint, typage et tests |
| `npm run build` | Construit le frontend et le backend |
| `npm run release:check` | Valide entièrement une livraison |
| `npm run desktop:start` | Construit et ouvre l’application Electron locale |
| `npm run desktop:package` | Construit un paquet desktop pour le système courant |
| `npm run make:windows` | Produit l’installateur Windows depuis Windows |
| `npm start` | Sert la version préalablement construite |

## Données et sécurité

- Le fichier Excel est lu localement par le navigateur et n’est jamais envoyé
  au backend.
- Dans l’application Windows, les données sont stockées dans
  `%APPDATA%\Bruno Pizza\data\`.
- Dans l’application macOS, elles sont stockées dans
  `~/Library/Application Support/Bruno Pizza/data/`.
- En mode source, ils restent dans `backend/data/`.
- Le serveur écoute uniquement sur `127.0.0.1` par défaut.
- Le dossier `backend/data/` doit être sauvegardé avant toute mise à jour.

Cette version est conçue pour un usage local de confiance. Une exposition sur
un réseau nécessite une couche d’authentification, un proxy HTTPS et des règles
réseau supplémentaires.
