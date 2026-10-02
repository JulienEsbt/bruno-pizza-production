# Photos de démonstration — build de recette V2

Les quatre PNG de `desktop/demo-images/` sont des illustrations de test générées, pas la recette officielle de la Reine. Ils portent le préfixe `DEMO-V2-` pour être identifiables dans le catalogue.

## Fabriquer un build de test

- macOS : `BRUNO_DEMO_PHOTOS=1 npm run desktop:package`.
- GitHub Actions, workflow « Fabriquer l’installateur Windows » : activer l’entrée `demo_photos`.
- Builds ordinaires : option désactivée par défaut ; les images ne sont pas embarquées.

Au premier lancement du build de test, les quatre images sont ajoutées à la Reine. Les photos déjà présentes sont conservées, avec la dernière photo existante toujours en position finale. Une galerie comportant plus de 16 photos non démo est laissée intacte pour respecter la limite de 20.

Le fichier `data/demo-reine-v2.json` dans les données utilisateur mémorise cette initialisation. Les suppressions et remplacements effectués ensuite dans Paramètres sont respectés : les images ne reviennent pas au redémarrage. En cas d’interruption avant l’écriture du marqueur, les noms des photos empêchent leur duplication. Ce mécanisme ne copie aucune base de développement et ne change aucune quantité de production.

## Vérifications du 2 octobre 2026

- 67 tests automatiques réussis (13 desktop, 32 frontend, 22 backend), contrôle de types, lint et compilation réussis.
- Build macOS Apple Silicon installé et ouvert ; Reine : quatre photos de démonstration plus ancienne photo finale, lecture automatique affichée.
- Deux corrections utilisateur et total de 195 pizzas conservés après fermeture et réouverture.
- Valeur initiale visible dans la case modifiée au focus : « Excel : 4 → 6 ». Même règle CSS au survol, affichage aussi en édition.
- Vérification du paquet : quatre PNG présents avec l’option ; exclusion du dossier confirmée dans la configuration normale.
- Le workflow Windows est préparé ; aucun build Windows déclenché ni testé à cette étape.

Le paquet Windows de recette est préparé en version 1.2.0, supérieure à la 1.1.4. Le workflow déduit le nom de l’installateur de cette version. La recette Windows reste à effectuer.
