# Architecture technique — Appli Montage 1.1.4

## Vue d’ensemble

Appli Montage est l’application locale livrée pour Bruno Pizzaiolo. Elle est
composée d’un frontend React et d’une API Express persistée dans SQLite.

```text
Fichier Excel
    │ lecture locale, jamais d’envoi HTTP
    ▼
Fenêtre Electron ─ Frontend React ─ API HTTP Express ─ SQLite
    │                          │                           │
    │ tableau et parcours      │ catalogue et photos      │ données métier
    └── localStorage           └── stockage des images ───┘
        production, thème
        et position courante
```

En développement, Vite et Express sont deux processus séparés. Dans
l’application desktop, le processus principal Electron démarre Express sur
`127.0.0.1` avec un port libre attribué par le système. Express sert le build
statique du frontend et l’API depuis ce même port. Cette configuration évite
une dépendance à une URL d’API codée en dur et les collisions de port.

La fenêtre utilise toujours l’origine `bruno-pizza://app`. Un gestionnaire de
protocole interne relaie ses requêtes vers le port Express courant. Le port peut
donc changer sans changer l’origine du stockage navigateur : la production
importée, le thème et la position du parcours restent disponibles au prochain
démarrage.

Le rendu Electron est isolé, sans accès Node, sans `webview` et sans ouverture
de navigation externe. Les permissions navigateur sont refusées par défaut.

## Frontend

Technologies principales : React 19, TypeScript, React Router, Vite, Vitest et
la bibliothèque `xlsx`.

```text
frontend/src/
├── components/              composants transverses (barres, thème, clavier)
├── context/                 catalogue, production et thème partagés
├── features/
│   ├── dashboard/           import et matrice de répartition
│   ├── production/          parcours atelier et lecture Excel
│   └── settings/            catalogue, recettes et distributeurs
├── hooks/                   accès typé aux contextes
├── shared/                  client HTTP et utilitaires clavier
├── types/                   contrats du frontend
├── utils/                   formatage et présentation des données
└── App.tsx                  routes de l’application
```

### Flux de production

1. Le navigateur valide l’extension et la taille du fichier.
2. `xlsx` lit uniquement la feuille attendue.
3. Le parseur contrôle la date, les en-têtes, les doublons, les quantités et
   les totaux.
4. Les noms de pizzas et distributeurs sont rapprochés du catalogue.
5. La production validée est enregistrée dans `localStorage` et rendue par le
   dashboard.
6. Le mode production enrichit chaque pizza avec sa recette et sa photo.

Clés de stockage utilisées :

- `bruno-pizza-production` pour la production importée ;
- `bruno-pizza-production-theme` pour le thème ;
- une clé `bruno-pizza-position-v2:…` propre à chaque import pour la position
  du parcours.

Les données relues depuis le navigateur sont validées avant utilisation.

## Backend

Technologies principales : Express 5, TypeScript, `node:sqlite` et Multer.

```text
backend/src/
├── routes/                  routage HTTP et adaptation des requêtes
├── services/                validations et règles métier
├── repositories/            requêtes et transactions SQLite
├── database/                connexion, schéma, migrations et amorçage
├── data/seed/               catalogue initial
├── types/                   contrats du catalogue
├── app.ts                   middleware, API et frontend statique
├── config.ts                configuration d’environnement
├── httpServer.ts            cycle de vie et port HTTP dynamique
└── server.ts                point d’entrée du mode source
```

La séparation est volontaire : une route ne contient pas de SQL et un dépôt
ne prend pas de décision d’interface. Les règles de suppression, d’unicité,
d’ordre et de relation entre pizzas et ingrédients restent dans les services
et les transactions.

## API

Préfixe : `/api`.

| Méthode et route | Rôle |
| --- | --- |
| `GET /api/health` | État du service |
| `GET /api/catalog` | Catalogue complet |
| `POST /api/catalog/distributors` | Créer un distributeur |
| `PATCH /api/catalog/distributors/:id` | Modifier un distributeur |
| `DELETE /api/catalog/distributors/:id` | Supprimer un distributeur |
| `POST /api/catalog/ingredients` | Créer un ingrédient |
| `PATCH /api/catalog/ingredients/:id` | Modifier un ingrédient |
| `DELETE /api/catalog/ingredients/:id` | Supprimer un ingrédient |
| `POST /api/catalog/pizzas` | Créer une pizza |
| `PATCH /api/catalog/pizzas/:id` | Modifier une pizza ou sa recette |
| `DELETE /api/catalog/pizzas/:id` | Supprimer une pizza |
| `GET /api/catalog/pizzas/:id/image` | Lire sa photo |
| `PUT /api/catalog/pizzas/:id/image` | Ajouter ou remplacer sa photo |
| `DELETE /api/catalog/pizzas/:id/image` | Supprimer sa photo |

Une route inconnue sous `/api` répond toujours en JSON avec un code 404. Les
autres routes `GET` sont renvoyées vers `index.html` lorsque le frontend a été
construit, afin que les URLs React fonctionnent après actualisation.

## Modèle de données

SQLite contient cinq ensembles principaux :

- `distributors` : identité, correspondance Excel, couleurs, ordre et état ;
- `ingredients` : nom officiel et état ;
- `pizzas` : nom, base, ordre et état ;
- `pizza_ingredients` : relation ordonnée entre pizza et ingrédients ;
- `pizza_images` : métadonnées de la photo stockée sur disque.

La base active le mode WAL, les clés étrangères et un délai d’attente en cas
de verrouillage. Les données initiales ne sont insérées que si le catalogue est
vide. Les migrations sont appliquées au démarrage.

En mode desktop, SQLite et les photos résident dans
`%APPDATA%\Bruno Pizza\data\` sous Windows et dans
`~/Library/Application Support/Bruno Pizza/data/` sous macOS. Le code installé
et les données utilisateur sont donc séparés ; le paquet ne contient pas la
base locale de développement.

## Sécurité et intégrité

- écoute sur l’interface locale `127.0.0.1` par défaut ;
- origine CORS explicite en développement ;
- en-têtes de sécurité HTTP ;
- corps JSON limités à 32 Ko ;
- paramètres et données métier contrôlés avant écriture ;
- opérations liées exécutées dans des transactions SQLite ;
- images JPEG, PNG ou WebP limitées à 8 Mo ;
- type réel des images contrôlé par leur signature binaire ;
- écritures d’images temporaires avant remplacement atomique ;
- détails des erreurs internes non exposés au navigateur ;
- ressources statiques versionnées mises en cache, `index.html` non mis en
  cache.

La 1.1.4 n’intègre ni comptes utilisateurs ni authentification. Le serveur ne
doit donc pas être exposé tel quel sur Internet ou sur un réseau non maîtrisé.

## Qualité et vérification

- lint ESLint du frontend ;
- vérification TypeScript des deux applications ;
- tests unitaires Node du domaine frontend ;
- tests Node du backend et tests d’intégration HTTP ;
- tests du calcul des chemins desktop, du port dynamique et du zoom ;
- builds de production Vite et TypeScript ;
- paquet Electron contrôlé sur le système courant ;
- installateur Squirrel.Windows fabriqué par un workflow Windows manuel ;
- paquet macOS Apple Silicon fabriqué sur macOS ;
- commande agrégée `npm run release:check`.

Le répertoire `dist/`, les dépendances, les variables locales, SQLite et les
photos sont ignorés par Git. Seuls le code, les exemples de configuration, les
tests et la documentation constituent la livraison source.
