# V2 — état actuel et recette restante

**Mise à jour : 2 octobre 2026. V2 développée localement, non publiée.**
La V2 désigne le chantier fonctionnel demandé après la V1 ; aucun nouveau numéro
de paquet n'a été choisi. La racine reste en 1.1.4, les sous-paquets frontend et
backend en 1.1.2. Ne pas interpréter ces numéros comme une livraison de la V2.

## Fonctionnalités en place

| Demande | Comportement actuel |
| --- | --- |
| Retirer les kits | Libellés complets Kit Pizza/Kits Pizzas normalisés, à l'import et à la restauration ; aucune suppression des autres recettes inconnues |
| Simplifier le thème | Sombre permanent ; commande de thème et raccourci T retirés |
| Corriger le tableau | Bouton commun de 64 px, E, − / + et saisie ; totaux recalculés, repères jaunes et valeur initiale ; sauvegarde locale et rétablissement |
| Anticiper la suite | Libellé Suivante orange, nom et quantité agrandis, bloc intégré au bas du panneau |
| Visualiser le montage | 20 photos maximum, 8 Mio chacune, JPEG/PNG/WebP ; ordre modifiable, dernière photo finale, lecture automatique et pause |

La lecture boucle depuis la première image, avec durées 1/2/3/5/8/10/12/15 s
(défaut 3 s). Les flèches et Image finale conservent lecture/pause. Une seule
photo reste fixe ; une image indisponible suspend la lecture. Ce diaporama
n'est pas un import de fichiers GIF.

## Retour de Corentin et choix restants

- **Kits confirmés :** accessoires stockés à part (boîte, roulette, serviettes, sauces).
  Son fichier du 30 septembre contient « KIT Pizza » ; le code actuel l’exclut
  correctement. Import vérifié : 192 pizzas, 10 variétés, 7 distributeurs.
- **Corrections :** Corentin confirme l’usage quotidien, le recalcul et le repère
  visuel. L’avertissement est facultatif pour lui. Le choix actuel reste une
  confirmation seulement au remplacement de corrections par un nouvel import ;
  conservation à la fermeture et retour au début de l’atelier après modification
  à valider en recette.
- **Variétés :** seules les lignes importées avec un total positif sont éditables ;
  une ligne ensuite mise à zéro reste disponible. L'ajout d'une variété absente
  de l'Excel n'est pas implémenté et doit faire l'objet d'un besoin explicite.
- **Lecture :** le démarrage automatique demandé par Julien le 1er octobre
  remplace la finale fixe du document initial ; confirmer l'usage en cuisine.
- **Photos :** obtenir les vraies étapes, leur ordre et l'image finale par pizza.
  Des titres d'étapes ou un zoom dédié seraient des évolutions distinctes, pas
  des fonctionnalités déjà promises ou implémentées.

## Essai local

Lancer les deux serveurs décrits dans le [README](../README.fr.md), puis ouvrir
`http://localhost:5173`. La Reine de la base de développement de Julien contient
quatre photos fictives de test. Elles servent uniquement à évaluer l'interface,
ne correspondent pas à sa recette officielle et ne sont pas versionnées.
Un autre navigateur, une autre origine ou Electron peut utiliser une session
ou une base différente. Un clone neuf ne possède pas cette galerie de test.

## Vérifications réalisées et limites

- Dernier contrôle complet du comportement V2 : 64 tests (10 desktop, 32 frontend,
  22 backend), lint, typage et compilation réussis.
- Navigateur : corrections et persistance, E, totaux, zéro, import invalide,
  galerie, ordre, annulation de retrait, image indisponible, lecture/pause,
  flèches, boucle à 1 s et durée 12 s conservée après rechargement.
- Affichage contrôlé en 1366 × 768 et 1920 × 1080 ; dernière retouche du bloc
  suivante contrôlée à 1366 × 768 avec un nom long et compilation frontend réussie.
- Migration d'une copie de base V1 : photo conservée et sauvegarde présente.
- Pas de validation terrain V2 sur Windows 43 pouces, ni de nouvel installateur.
  L'annulation native d'un nouvel import corrigé reste à tester manuellement.
  Une fenêtre très étroite n'est pas un format mobile validé.

Les comptes et parcours détaillés de chaque lot sont dans le
[journal V2](JOURNAL_V2.md). Les contrôles passés attestent les révisions locales
testées ; ils ne constituent pas un statut CI distant de la V2.

## Recette avant livraison

La [checklist complète pour Julien](RECETTE_V2.md) fournit les manipulations
exactes et résultats attendus. La recette manuelle reste à réaliser.

- [x] Recevoir et vérifier l’Excel de Corentin et l’explication des kits.
- [ ] Valider les comportements restants et l’usage terrain avec Corentin.
- [ ] Vérifier et remplacer les photos fictives par les photos officielles.
- [ ] Tester import, édition, E, repères, totaux et remise à zéro avec ses données.
- [ ] Fermer/réouvrir : corrections conservées ; import suivant annulé puis accepté.
- [ ] Tester galerie, ordre, pause/flèches, vitesse mémorisée et photo manquante.
- [ ] Sauvegarder le dossier de données ; tester la migration sur une copie V1.
- [ ] Contrôler lisibilité, zoom et raccourcis sur le poste Windows de cuisine.
- [ ] Après accord, choisir et aligner version, workflow et noms d'artefacts.
- [x] Relancer release:check le 2 octobre : 64 tests, lint, types et builds réussis.
- [x] Répartir le travail en commits locaux par fonctionnalité, autorisés par Julien
  le 2 octobre. Cette sauvegarde ne vaut pas validation de la recette manuelle.
- [ ] Après autorisation distincte, pousser et fabriquer Windows ; contrôler
  l’installateur et son empreinte.

La sauvegarde de la base et des photos n'inclut pas les corrections du tableau :
voir [Installation et exploitation](INSTALLATION_ET_EXPLOITATION.md).
Le chiffrage et l'accord de livraison sont suivis séparément de la documentation technique.
