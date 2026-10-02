# Guide utilisateur — Appli Montage

État du code V2 au 1er octobre 2026, non publié. Les installateurs V1 ne
contiennent pas encore les évolutions décrites ici. Voir le [suivi V2](V2_PREPARATION.md).

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

### Corriger les quantités (V2 en préparation)

Cliquez sur **Modifier le tableau**, en haut à droite, ou appuyez sur **E**.
La même touche termine l’édition ; elle est ignorée pendant la saisie d’une quantité. Utilisez **− / +**
ou saisissez une quantité entière positive ou nulle. Les totaux sont recalculés
immédiatement. Chaque correction est enregistrée sur cet appareil ; **Terminer
l’édition** ferme les commandes, sans annuler les corrections.

Les cases modifiées sont encadrées en jaune avec un point. Le survol indique
la quantité de l'Excel d'origine. Revenir exactement à cette quantité retire
le repère. **Rétablir l’Excel** annule toutes les corrections après confirmation.
Le fichier Excel d'origine n'est jamais modifié.

Les lignes mises à zéro restent modifiables dans le tableau et sont ignorées
en atelier. Si tout est à zéro, le bouton Production est désactivé. Après une
correction, l'atelier reprend à la première pizza. Sur un écran moins haut,
faites défiler le tableau pour accéder aux dernières lignes.

Les corrections sont conservées à la fermeture de l'application. Un nouvel
import valide avertit avant de les remplacer par les valeurs du nouveau fichier.
Annuler cet avertissement ou importer un fichier invalide conserve la production
actuelle. Si l'enregistrement local échoue, un message s'affiche et la dernière
modification n'est pas appliquée.

Ce lot modifie les variétés importées et les emplacements du fichier. Il
n'ajoute pas de variété absente ou dont le total était déjà nul à l'import.

## 3. Fabriquer les pizzas

Cliquez sur **Production** ou appuyez sur `Entrée`.

L’écran de production affiche :

- à gauche, la pizza précédente, la pizza en cours et la suivante ;
- au centre, les ingrédients dans leur ordre de montage ;
- à droite, la photo ou le diaporama des étapes si des images sont configurées ;
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
- Ajoutez les photos des étapes dans **Visuel de production**.
- Réorganisez les ingrédients par glisser-déposer.
- Ajoutez ou retirez un ingrédient dans la recette.

Une pizza inactive reste dans le catalogue. L’import conserve les lignes
non-kit du fichier, même si leur recette est inconnue ou inactive : contrôlez
leur correspondance et leur recette avant de fabriquer. La suppression d’une
pizza demande une confirmation.

### Photos et diaporama (V2 en préparation)

Dans les paramètres de la pizza, **Ajouter des images** accepte plusieurs fichiers
JPEG, PNG ou WebP, jusqu'à 20 images par pizza, finale comprise, et 8 Mio par image
(8 388 608 octets). Les GIF et les vidéos ne sont pas acceptés : l'effet animé
est produit par le défilement des photos. Les nouveaux
fichiers sont triés par leur nom, avec les nombres dans l'ordre naturel :
`1-base`, `2-garniture`, `10-pizza-terminee`.

L'image en dernière position, signalée **Pizza terminée**, clôt le montage. Lorsqu'une photo finale existe déjà, les nouvelles étapes sont insérées
avant elle. Utilisez les flèches **↑ / ↓** pour corriger l'ordre ou placer une nouvelle
photo en dernière position. **Retirer** demande confirmation ; retirer la dernière
image désigne la précédente comme nouvelle finale. Retirer la seule image laisse
la pizza sans photo. L'ajout et la réorganisation sont enregistrés immédiatement.

En atelier :

- la lecture démarre automatiquement à la première image et boucle après la finale ;
- **Pause** conserve l'étape affichée et **Lire les étapes** reprend depuis celle-ci ;
- **Vitesse** propose 1, 2, 3, 5, 8, 10, 12 et 15 secondes, défaut 3 s, choix mémorisé ;
- les flèches **‹ / ›** changent d'image sans changer l'état lecture/pause ;
- **Image finale** affiche la pizza terminée sans changer l'état lecture/pause ;
- changer de pizza ou revenir à l'atelier relance la lecture à la première étape.

Une pizza avec une seule image conserve un affichage fixe. Une image absente
arrête la lecture et affiche une explication ; les autres images restent consultables.
La durée de chaque étape commence une fois son image chargée. Les flèches
**‹ / ›** du visuel changent de photo ; les flèches gauche/droite du clavier
changent de pizza. La photo est affichée entière, avec des coins arrondis.

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

Le thème sombre est permanent. Le bouton de thème et le raccourci `T` ont été retirés. Les
raccourcis sont ignorés pendant la saisie dans un champ.

Dans l’application desktop, `Ctrl` + `+` agrandit l’affichage, `Ctrl` + `-`
le réduit et `Ctrl` + `0` restaure le niveau conseillé pour l’écran. Sur macOS,
utilisez `Cmd` à la place de `Ctrl`. La molette avec cette même touche permet
également de zoomer.

L’application s’ouvre directement en plein écran sans bordure. Le niveau
conseillé correspond à 100 % sur un affichage classique. Lorsque Windows
utilise une très forte mise à l’échelle, par exemple 300 % sur un écran 4K,
l’application choisit automatiquement 80 % pour conserver toute la hauteur du
tableau. Les paliers de 70 % à 130 % restent disponibles.
Les chiffres et libellés essentiels du tableau sont volontairement plus grands
que les commandes secondaires pour rester lisibles à distance.

### Tableau de production

| Touche | Action |
| --- | --- |
| `I` | Importer un fichier Excel |
| `E` | Activer ou terminer l’édition du tableau |
| `Suppr` | Vider la production après confirmation |
| `P` | Ouvrir les paramètres |
| `Entrée` | Commencer la production |

### Mode production

| Touche | Action |
| --- | --- |
| `←` / `→` | Pizza précédente / suivante |
| `P` | Ouvrir les paramètres |
| `Échap` ou `Espace` | Retour au tableau |

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

Les corrections, la position et la vitesse sont propres à la session locale de
l’application ou à l’origine du navigateur. Effacer ses données de navigation
peut les supprimer. Elles ne sont pas incluses dans la sauvegarde SQLite/photos.
