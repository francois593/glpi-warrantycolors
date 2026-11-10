# Changelog

## 1.0.1 — 2026-11-10

- Amélioration de la gestion mémoire des exports PDF « Toutes les pages » : minimum conditionnel de 256 Mio, sans diminuer une limite supérieure ou illimitée ; erreur explicite si l'augmentation est impossible.
- Ajout du centrage automatique du bouclier Warranty Colors dans la carte Marketplace, sans modification de GLPI ni des autres plugins.
- Logo du plugin fourni en haute résolution (256 × 256) ; les autres visuels historiques restent disponibles.
- Qualification HTTP réelle sur GLPI-LAB : exports PDF/XLSX/ODS/CSV réussis à 1 000 résultats et refus HTTP 422 à 1 001 résultats ; données temporaires supprimées après recette.
- Mise à jour de la documentation de recette et de ses limites connues.

**Réserve :** la nouvelle politique mémoire 1.0.1 n'a pas été retestée sur un export PDF de 1 000 résultats ; la réinstallation depuis l'archive finale et la compatibilité avec toutes les versions de GLPI 11 restent à qualifier.


## 1.0.0 — 2026-11-09

- Mise en couleur des expirations de garantie : rouge, orange, vert et gris.
- Cinq filtres intégrés à la recherche GLPI des ordinateurs.
- Exports PDF, XLSX, ODS et CSV, page courante ou toutes les pages.
- Garde-fou de 1 000 résultats sur les exports complets et contrôle des droits GLPI.
- Protection des valeurs CSV susceptibles d'être interprétées comme formules.
- Installation/désinstallation sans modification automatique de `auto_create_infocoms`.
- Logo PNG et SVG à quatre couleurs, documentation bilingue et tests JavaScript.
- Conserve le rendu PDF natif : amélioration éventuelle des largeurs de colonnes reportée à une contribution ultérieure.

### Qualification restant à documenter avant un déploiement large

- Tests HTTP authentifiés à 1 000 et 1 001 résultats ; contrôle SQL avec recherches filtrées.
- Pics mémoire et temps des exports volumineux.
- Installation propre depuis le ZIP final et recette complète avec l'exploitant.
