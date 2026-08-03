# Format du fichier Excel

L’import accepte les fichiers `.xlsx` et `.xls` de 5 Mo maximum. Le fichier
est analysé localement dans le navigateur et n’est jamais envoyé au backend.

## Feuille obligatoire

Le classeur doit contenir une feuille nommée exactement :

```text
Répartition générale par distri
```

La feuille peut contenir des informations avant le tableau. L’application
recherche la première ligne dont la première cellule contient `Pizza`.

## Structure

La cellule située juste au-dessus de `Pizza`, dans la première colonne, doit
contenir la date de production.

Exemple :

| Colonne A | Colonne B | Colonne C | Colonne D |
| --- | --- | --- | --- |
| 31 juillet 2026 08:30 |  |  |  |
| Pizza | Turenne 393 | CHAL 1030 | Total |
| REINE | 2 | 1 | 3 |
| ROYALE | 0 | 4 | 4 |
| Total | 2 | 5 | 7 |

Règles :

- la première colonne est `Pizza` ;
- au moins une colonne de distributeur se trouve ensuite ;
- la colonne `Total` termine la zone utile ;
- les noms des pizzas sont uniques ;
- les noms des distributeurs sont uniques et non vides ;
- chaque quantité est un entier positif ou zéro ;
- une cellule de quantité vide vaut zéro ;
- le total de chaque pizza est exactement égal à la somme de ses
  distributeurs ;
- une pizza dont le total vaut zéro n’est pas importée ;
- la lecture s’arrête à la première ligne dont le nom est `Total`.

Les comparaisons de noms ignorent les accents, la casse et les espaces
superflus. Le distributeur est rapproché de son nom affiché, de son **Nom
Excel** ou de son abréviation configurée dans les paramètres.

## Date acceptée

La date peut être une vraie cellule de date Excel ou du texte dans l’un des
formats suivants :

- `31 juillet 2026 08:30` ;
- `31 juillet 2026 08:30:15` ;
- `31/07/2026 08:30` ;
- `31-07-2026 08:30` ;
- `31/07/2026` — l’heure sera indiquée comme inconnue.

## Limites de sécurité

| Élément | Limite |
| --- | ---: |
| Taille du fichier | 5 Mo |
| Lignes de la feuille | 600 |
| Colonnes de l’en-tête | 80 |
| Variétés avec une quantité positive | 200 |

Un dépassement ou une incohérence annule entièrement l’import. La production
précédente reste disponible tant que le nouveau fichier n’a pas été validé.

## Erreurs fréquentes

- nom de feuille différent, même légèrement ;
- date absente au-dessus de l’en-tête ;
- colonne `Total` absente ;
- doublon de pizza ou de distributeur ;
- nombre décimal, négatif ou texte dans une quantité ;
- total de ligne différent de la somme des distributeurs ;
- nom Excel d’un distributeur non configuré dans le catalogue.
