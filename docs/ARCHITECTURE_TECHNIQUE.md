# Architecture technique — V2 en préparation

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
        production
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
importée et la position du parcours restent disponibles au prochain
démarrage.

Le rendu Electron est isolé, sans accès Node, sans `webview` et sans ouverture
de navigation externe. Les permissions navigateur sont refusées par défaut.

## Frontend

Technologies principales : React 19, TypeScript, React Router, Vite, tests Node et
la bibliothèque `xlsx`.

```text
frontend/src/
├── components/              composants transverses (barres, clavier)
├── context/                 catalogue et production partagés
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
6. Le mode production enrichit chaque pizza avec sa recette et sa galerie.

Excel reste la source des quantités ; le catalogue enrichit la présentation
mais ne doit pas masquer une recette inconnue importée. Seuls les libellés
complets de kits et les lignes initialement à zéro sont exclus.

Clés de stockage utilisées :

- `bruno-pizza-production` pour la production importée ;
- une clé `bruno-pizza-position-v2:…` propre à chaque import pour la position
  du parcours ;
- `bruno-pizza-slideshow-seconds` pour la durée des images (défaut 3 s).

Les données relues depuis le navigateur sont validées avant utilisation.
Les kits pizza sont exclus lors de la restauration. Le stockage est écrit en
version 3 ; la lecture accepte aussi la version 2 existante. Chaque cellule
corrigée conserve `originalQuantity`. Les totaux de ligne sont recalculés dans
le domaine d'édition ; les valeurs entières et la cohérence sont contrôlées à
la restauration. Une `revision` invalide la position atelier après correction.
La sauvegarde précède la mise à jour de l'état : en cas d'échec du stockage,
l'ancienne production reste affichée avec un message d'erreur.

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
| `GET /api/catalog/pizzas/:id/image` | Lire la photo finale (compatibilité V1) |
| `PUT /api/catalog/pizzas/:id/image` | Remplacer la finale en conservant les étapes |
| `DELETE /api/catalog/pizzas/:id/image` | Vider les photos (ancien endpoint) |
| `GET /api/catalog/pizzas/:id/images` | Galerie ordonnée, sans nom de stockage interne |
| `POST /api/catalog/pizzas/:id/images` | Ajouter un lot multipart `images` avant la finale |
| `PUT /api/catalog/pizzas/:id/images/order` | Réordonner tous les identifiants `imageIds` |
| `GET /api/catalog/pizzas/:id/images/:imageId` | Lire une image de cette pizza |
| `DELETE /api/catalog/pizzas/:id/images/:imageId` | Retirer une image |

Une route inconnue sous `/api` répond toujours en JSON avec un code 404. Les
autres routes `GET` sont renvoyées vers `index.html` lorsque le frontend a été
construit, afin que les URLs React fonctionnent après actualisation.

## Modèle de données

SQLite contient cinq ensembles principaux :

- `distributors` : identité, correspondance Excel, couleurs, ordre et état ;
- `ingredients` : nom officiel et état ;
- `pizzas` : nom, base, ordre et état ;
- `pizza_ingredients` : relation ordonnée entre pizza et ingrédients ;
- `pizza_images` : une ligne par image, identifiant stable, pizza, position,
  nom original, nom interne unique et métadonnées ; unicité `(pizza_id, display_order)`.

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
- images JPEG, PNG ou WebP limitées à 8 Mio (8 388 608 octets), 20 images par pizza ;
- type réel des images contrôlé par leur signature binaire ;
- validation de tout le lot avant écriture, fichiers uniques puis transaction SQLite ;
- en cas d'échec, suppression des nouveaux fichiers et conservation de l'ancienne galerie ;
- réorganisation refusée en 409 si la liste d'identifiants ne correspond plus à la galerie ;
- détails des erreurs internes non exposés au navigateur ;
- ressources statiques versionnées mises en cache, `index.html` non mis en
  cache.

L’application, y compris le chantier V2, n’intègre ni comptes utilisateurs ni authentification. Le serveur ne
doit donc pas être exposé tel quel sur Internet ou sur un réseau non maîtrisé.

## Qualité et vérification

- lint ESLint du frontend ;
- vérification TypeScript des deux applications ;
- tests unitaires Node du domaine frontend ;
- tests Node du backend et tests d’intégration HTTP ;
- tests du calcul des chemins desktop, du port dynamique et du zoom ;
- builds de production Vite et TypeScript ;
- commandes de préparation du paquet Electron sur le système courant ;
- workflow manuel Windows pour Squirrel.Windows, non exécuté pour la V2 ;
- fabrication macOS Apple Silicon depuis macOS, sans nouvelle livraison V2 ;
- commande agrégée `npm run release:check`.

Le répertoire `dist/`, les dépendances, les variables locales, SQLite et les
photos sont ignorés par Git. Seuls le code, les exemples de configuration, les
tests et la documentation constituent la livraison source.

## Migration des photos et lecteur V2

Au premier démarrage sur un ancien schéma peuplé, `VACUUM INTO` crée une copie
cohérente de la base (WAL inclus) dans un fichier `.before-gallery-v2-<timestamp>.sqlite`.
Son échec bloque la migration. La table est ensuite transformée dans une transaction :
l'ancienne photo devient l'unique étape/finale, avec le même fichier et les mêmes
métadonnées. Le contrôle du schéma évite toute répétition ou résurrection d'images retirées.
La sauvegarde automatique est celle de la base, pas une copie des fichiers photo.

Le catalogue utilise un agrégat des dates d'images par pizza : les galeries n'ajoutent
pas de doublons dans la liste des pizzas. L'ancienne URL `/image` sert la finale.
Le lecteur possède un état local isolé par pizza ; sa temporisation ne démarre
qu'après chargement de l'image et s'annule à la pause ou au démontage. La préférence
`bruno-pizza-slideshow-seconds` conserve une durée validée, avec défaut à 3 secondes.


Le domaine `slideshow.ts` centralise l'état de lecture : première étape et
lecture automatique si plusieurs images, pause/reprise explicite ; précédent,
suivant et finale ne changent pas l'état de lecture. Les durées autorisées sont
1/2/3/5/8/10/12/15 s. Le composant `PizzaVisual` gère le chargement, l'erreur image,
le minuteur et son nettoyage. Revenir à une pizza crée une nouvelle lecture.

## Choix d'architecture et limites

| Choix | Raison et conséquence |
| --- | --- |
| Excel lu dans le navigateur | Le fichier reste local et les erreurs sont contrôlées avant remplacement de la production |
| SQLite pour le catalogue, fichiers pour les images | Utilisation autonome sur un poste, données séparées de l'installation ; sauvegarder les deux ensembles |
| Production dans localStorage | Reprise locale sans serveur de session ; pas de partage entre postes/origines ni export des corrections |
| Origine Electron stable et port dynamique | Éviter les collisions tout en conservant le stockage navigateur |
| Domaine d'édition et lecteur isolés | Tester les invariants et transitions sans dépendre du rendu React |
| Photos ordonnées plutôt qu'un GIF | Permettre pause, navigation, remplacement et réorganisation de chaque étape |
| Limites d'images et écriture transactionnelle | Maîtriser les entrées et éviter une galerie partiellement enregistrée |

Aucune synchronisation cloud, API Adial, récupération Excel automatique ou
authentification n'est implémentée. L'éventuel script externe de récupération
n'appartient pas à ce dépôt. Le compteur suit un parcours, pas un journal de
validation unitaire de fabrication. Le chantier V2 est testé localement ; la
recette Windows et les choix métier restants sont suivis dans
[V2_PREPARATION.md](V2_PREPARATION.md).
