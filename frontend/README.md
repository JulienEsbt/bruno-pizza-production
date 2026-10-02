# Frontend Appli Montage

Interface React et TypeScript, organisée par fonctionnalité. État V2 au
1er octobre 2026, non publié ; le numéro de sous-paquet 1.1.2 n'a pas été modifié.

## Démarrer et vérifier

Depuis la racine du dépôt, installer les dépendances puis lancer
`npm run dev:backend` et `npm run dev:frontend` dans deux terminaux.
Ouvrir `http://localhost:5173` ; Vite relaie `/api` vers `127.0.0.1:3001`.

- `npm --prefix frontend run check` : ESLint, TypeScript et tests Node.
- `npm --prefix frontend run build` : TypeScript et compilation Vite.
- `npm run release:check` : validation agrégée de l'application depuis la racine.

## Repères dans le code

- `features/dashboard` : import, tableau éditable, totaux et raccourci E.
- `features/production/domain` : exclusion des kits, édition, restauration du
  stockage et transitions du lecteur de photos.
- `features/production/components/PizzaVisual.tsx` : chargement et lecture des
  images, délai après chargement, pause et gestion des erreurs.
- `features/settings` : catalogue et gestion des galeries ordonnées.
- `context/ProductionContext.tsx` : sauvegarde avant acceptation des corrections.
- `shared/keyboard` : règles des raccourcis, sans interférer avec les saisies.

Le frontend lit les fichiers Excel localement. Il communique avec le backend
pour le catalogue, les recettes et les photos. La production et ses corrections,
la position et la durée des images sont dans le stockage du navigateur, propre
à son origine. Une autre URL ou Electron ne partage pas automatiquement cette
session. Les photos de test de la Reine ne font pas partie du dépôt.

## Documentation de référence

- [Démarrage et commandes](../README.fr.md)
- [Guide utilisateur](../docs/GUIDE_UTILISATEUR.md)
- [Format Excel](../docs/FORMAT_EXCEL.md)
- [Architecture et décisions](../docs/ARCHITECTURE_TECHNIQUE.md)
- [État actuel et recette V2](../docs/V2_PREPARATION.md)
- [Journal des vérifications](../docs/JOURNAL_V2.md)
