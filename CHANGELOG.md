# Changelog

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
