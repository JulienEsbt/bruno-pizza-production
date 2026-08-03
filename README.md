# Bruno Pizza — Production 1.0.0

Application locale d’aide à la fabrication des pizzas. Une production est
importée depuis Excel, rapprochée du catalogue métier SQLite, puis présentée
sous forme de tableau de répartition et de parcours atelier.

La version 1.0.0 utilise **Excel comme unique source de production**.
L’intégration Adial est volontairement hors périmètre.

## Démarrage rapide

Prérequis : Node.js 22.5 ou supérieur et npm 10 ou supérieur.

```bash
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
| `npm run install:all` | Installe exactement les dépendances verrouillées |
| `npm run dev:backend` | Lance l’API locale avec rechargement automatique |
| `npm run dev:frontend` | Lance l’interface de développement |
| `npm run check` | Exécute lint, typage et tests |
| `npm run build` | Construit le frontend et le backend |
| `npm run release:check` | Valide entièrement une livraison |
| `npm start` | Sert la version préalablement construite |

## Données et sécurité

- Le fichier Excel est lu localement par le navigateur et n’est jamais envoyé
  au backend.
- Le catalogue et les recettes sont stockés dans
  `backend/data/bruno-pizza.sqlite`.
- Les photos sont stockées dans `backend/data/pizza-images/`.
- Le serveur écoute uniquement sur `127.0.0.1` par défaut.
- Le dossier `backend/data/` doit être sauvegardé avant toute mise à jour.

Cette version est conçue pour un usage local de confiance. Une exposition sur
un réseau nécessite une couche d’authentification, un proxy HTTPS et des règles
réseau supplémentaires.
