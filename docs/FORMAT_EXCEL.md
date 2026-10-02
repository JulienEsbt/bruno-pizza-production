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
- les lignes nommées « KIT Pizza » (ainsi que les variantes de casse,
  d'espaces, de ponctuation et de pluriel) sont exclues : il s'agit
  d'accessoires, pas de pizzas à fabriquer ;
- la lecture s’arrête à la première ligne dont le nom est `Total`.

Le total affiché est calculé à partir des pizzas retenues, sans les kits.
Un fichier ne contenant que des kits est accepté comme une journée sans pizza
et remplace la production précédente. Les autres recettes, même inconnues du
catalogue, conservent les contrôles habituels.

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

## Corrections locales (V2 en préparation)

Les cellules à zéro des variétés importées sont conservées pour permettre leur
édition. Les totaux nuls de lignes restent exclus lors de l'import initial.
Les corrections se font dans l'application et ne réécrivent pas le fichier.
Un nouvel import valide demande confirmation s'il existe des corrections,
puis remplace toute la production et les repères par les données du nouvel Excel.


Le filtrage porte sur le libellé complet normalisé : `KIT Pizza`, `Kits Pizzas`
ou `kit-pizza` sont exclus ; un nom contenant seulement le mot « kit » n'est
pas supprimé. Le fichier réel de Corentin du 30 septembre a confirmé le libellé
`KIT Pizza` ; le contrôle du 2 octobre retient 192 pizzas sans ce kit. Voir
le [suivi V2](V2_PREPARATION.md).

Une correction vers zéro après import diffère d'une ligne initialement à zéro :
la première reste éditable, la seconde n'est pas ajoutée au tableau. Annuler
l'avertissement d'un nouvel import, ou fournir un fichier invalide, conserve
le tableau corrigé. Les totaux de l'application reflètent les corrections ; le
fichier Excel d'origine ne change pas.
