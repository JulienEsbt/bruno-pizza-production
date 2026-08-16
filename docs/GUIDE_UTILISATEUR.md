# Guide utilisateur — Appli Montage 1.1.4

Ce guide s’adresse aux personnes qui préparent les productions et fabriquent
les pizzas. L’application comporte trois écrans : le tableau de production, le
mode production et les paramètres.

## 1. Charger une production

Depuis le **Tableau de production** :

1. Cliquez sur **Importer un Excel**, ou cliquez directement dans la grande
   zone centrale lorsqu’aucune production n’est chargée.
2. Sélectionnez le fichier `.xlsx` ou `.xls`. Vous pouvez aussi le déposer par
   glisser-déposer dans la zone centrale.
3. Vérifiez la date, l’heure, les totaux et la répartition affichés.
4. Corrigez le fichier si l’application signale une incohérence, puis
   importez-le à nouveau.

L’ancien tableau est remplacé uniquement après la validation complète du
nouveau fichier. Le fichier Excel reste dans l’ordinateur : il est lu par le
navigateur et n’est pas envoyé au serveur.

Le format attendu est détaillé dans [FORMAT_EXCEL.md](FORMAT_EXCEL.md).

## 2. Lire le tableau

- Chaque ligne correspond à une variété de pizza.
- Chaque colonne colorée correspond à un distributeur.
- La colonne **Total** indique la quantité totale de la variété.
- La ligne **Total général** récapitule toute la production.
- Le survol d’une cellule met en évidence sa ligne et sa colonne.

Les couleurs, abréviations et l’ordre des distributeurs proviennent du
catalogue des paramètres.

## 3. Fabriquer les pizzas

Cliquez sur **Production** ou appuyez sur `Entrée`.

L’écran de production affiche :

- à gauche, la pizza précédente, la pizza en cours et la suivante ;
- au centre, les ingrédients dans leur ordre de montage ;
- à droite, la photo de référence si elle a été configurée ;
- en haut, la progression générale et la répartition par distributeur.

Utilisez **Précédente** et **Suivante**, ou les flèches gauche et droite du
clavier. La position courante est mémorisée dans ce navigateur pour la
production chargée.

À la fin, une synthèse récapitule les quantités prévues. Cette version suit le
parcours de fabrication mais n’enregistre pas une validation individuelle de
chaque pizza.

## 4. Gérer le catalogue

Ouvrez **Paramètres**. Le catalogue comporte trois onglets.

### Pizzas

- Sélectionnez une pizza à gauche.
- Modifiez son nom, sa base et son état actif.
- Réorganisez les pizzas directement dans la liste par glisser-déposer. Les
  flèches haut et bas restent disponibles au clavier.
- Ajoutez une photo si elle doit apparaître pendant la fabrication.
- Réorganisez les ingrédients par glisser-déposer.
- Ajoutez ou retirez un ingrédient dans la recette.

Une pizza inactive reste dans le catalogue mais n’est pas proposée pour la
production. La suppression d’une pizza demande une confirmation.

### Ingrédients

- Modifiez le nom officiel ou l’état actif.
- Ajoutez un ingrédient avec **Nouvel ingrédient**.
- Un ingrédient encore utilisé par une pizza ne peut pas être supprimé.
- Une suppression autorisée demande une confirmation.

### Distributeurs

- **Nom affiché** : nom lisible dans l’application.
- **Nom Excel** : valeur recherchée lors de l’import.
- **Abréviation** : texte court affiché dans le tableau.
- **Couleurs** : fond, texte et accent visuel.
- **Ordre** : réorganisez les lignes par glisser-déposer.
- **Actif** : permet de conserver un distributeur sans l’utiliser.

La suppression d’un distributeur demande toujours une confirmation.

### Actualiser le catalogue

**Actualiser le catalogue** relit les données enregistrées dans SQLite. Cette
action ne réinitialise pas le catalogue et ne supprime rien. Elle est utile si
une modification externe vient d’être effectuée ou si l’affichage semble en
retard.

## 5. Raccourcis clavier

Le raccourci `T` change le thème clair ou sombre sur tous les écrans. Les
raccourcis sont ignorés pendant la saisie dans un champ.

Dans l’application desktop, `Ctrl` + `+` agrandit l’affichage, `Ctrl` + `-`
le réduit et `Ctrl` + `0` restaure le niveau conseillé. Sur macOS, utilisez
`Cmd` à la place de `Ctrl`. La molette avec cette même touche permet également
de zoomer.

L’application s’ouvre directement en plein écran sans bordure. Le niveau
conseillé correspond à 100 % ; six paliers restent disponibles de 70 % à 130 %.
Les chiffres et libellés essentiels du tableau sont volontairement plus grands
que les commandes secondaires pour rester lisibles à distance.

### Tableau de production

| Touche | Action |
| --- | --- |
| `I` | Importer un fichier Excel |
| `Suppr` | Vider la production après confirmation |
| `P` | Ouvrir les paramètres |
| `Entrée` | Commencer la production |
| `T` | Changer de thème |

### Mode production

| Touche | Action |
| --- | --- |
| `←` / `→` | Pizza précédente / suivante |
| `P` | Ouvrir les paramètres |
| `Échap` ou `Espace` | Retour au tableau |
| `T` | Changer de thème |

Dans la fenêtre de fin : `R` ou `Retour arrière` recommence le parcours,
`Entrée` revient au tableau et `Échap` ferme la fenêtre.

### Paramètres

| Touche | Action |
| --- | --- |
| `1`, `2`, `3` | Onglets Pizzas, Ingrédients, Distributeurs |
| `F` ou `/` | Placer le curseur dans la recherche |
| `N` | Créer un élément dans l’onglet courant |
| `R` | Actualiser le catalogue |
| `Entrée` | Reprendre la production si elle existe |
| `Échap` | Retour au tableau |
| `T` | Changer de thème |

Sur la poignée d’un distributeur, `↑` et `↓` permettent aussi de modifier son
ordre sans souris.

## 6. Conseils d’utilisation

- Contrôlez les totaux avant de lancer la fabrication.
- Ne fermez pas l’onglet pendant une modification du catalogue.
- Sauvegardez régulièrement le dossier de données indiqué dans le guide
  d’installation selon votre mode d’utilisation.
- Utilisez le bouton **Vider la production** uniquement lorsque le tableau
  chargé n’est plus nécessaire.
- En cas de message d’erreur, conservez le texte exact pour faciliter le
  diagnostic.
