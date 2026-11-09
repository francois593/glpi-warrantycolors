# Warranty Colors 1.0.0 — Validation et mise en production

## Périmètre

Le laboratoire GLPI 11 et le plugin sont distincts du serveur de production. Les contrôles ci-dessous n'autorisent pas à eux seuls un déploiement en production. Avant chaque opération sensible : auditer en lecture seule, sauvegarder, vérifier, appliquer une action, contrôler et prévoir le rollback.

## État constaté des essais

| Test | État |
|---|---|
| Couleurs et filtres sur 4 ordinateurs fictifs | Vérifiés dans le laboratoire |
| XLSX, CSV, PDF et ODS sur ces 4 ordinateurs | Exports fonctionnels ; ODS et CSV ouverts dans Excel |
| PDF A4 paysage | Fonctionnel ; largeurs de colonnes non optimales |
| Garde-fou de 1 000 résultats | 8/8 scénarios unitaires validés |
| Comportement HTTP réel à 1 000 et 1 001 résultats | **À qualifier** |
| Consommation mémoire PHP-FPM pendant un grand export | **À mesurer** |
| Réinstallation à blanc depuis le ZIP final | **À qualifier** |
| Compatibilité avec toutes les éditions/mises à jour GLPI 11 | **Non démontrée** |
| Qualité de protection de formules CSV sous Excel pour données malveillantes | **À qualifier en intégration** |

## Préflight lecture seule

1. Identifier la version GLPI, la version PHP, le serveur web et l'édition/hébergement (autonome ou prestataire).
2. Vérifier le chemin réel de `plugins/` (ne pas supposer les chemins du laboratoire).
3. Recenser les versions de plugins, thèmes, droits et entités ; vérifier la colonne de garantie (`Computer`, option 120).
4. Vérifier qu'aucune autre copie du plugin n'est présente et qu'aucun fichier de la destination ne sera écrasé sans accord explicite.
5. Vérifier les prérequis et l'emplacement du ZIP ; contrôler sa somme SHA-256 et sa structure `warrantycolors/`.

## Sauvegarde et rollback

- Faire valider par l'exploitant une sauvegarde **restaurable** de la base GLPI, des fichiers du plugin et de la configuration pertinente ; enregistrer l'emplacement et un moyen de restauration.
- Une sauvegarde de VM / checkpoint ne remplace pas automatiquement la sauvegarde cohérente des données applicatives.
- Pour une mise à jour, conserver un exemplaire indépendant du plugin précédent, avec ses empreintes SHA-256.
- Préparer les critères de retour arrière : erreurs GLPI/PHP, mauvais filtrage, export impossible, alerte mémoire, fuite de données ou modification inattendue de configuration.
- En cas de régression : désactiver le plugin, restaurer l'ancien code et/ou les sauvegardes applicatives selon le changement effectué, vérifier journaux, accès et fonctions standard. La restauration de base doit être encadrée par le prestataire et ne jamais se faire sans validation du périmètre.

## Recette fonctionnelle

1. Sur un laboratoire ou une copie représentative, installer le ZIP final et activer le plugin sans modifier les paramètres globaux GLPI.
2. Vérifier les 4 états : expirée (rouge), expiration de J0 à J+90 inclus (orange), après J+90 (vert), date absente ou illisible (gris).
3. Vérifier chaque filtre sur plusieurs pages, avec critères de recherche GLPI et restriction d'entités.
4. Vérifier tri, pagination, rafraîchissement, thème clair/sombre et absence de coloration de colonnes tierces.
5. Vérifier PDF, XLSX, ODS et CSV sur « Page courante » puis « Toutes les pages » ; les 11 colonnes affichées doivent être conservées. Vérifier la sélection du texte, l'encodage et les couleurs du PDF/XLSX/ODS.
6. Sur des données tests contrôlées, tenter 999, 1 000 et 1 001 résultats (avec et sans critères) ; vérifier le code HTTP 422 au dépassement et l'absence d'export complet.
7. Mesurer les pics RAM, les erreurs PHP-FPM/Apache et la durée lors des exports volumineux ; ne pas augmenter les limites sans mesure et décision explicite.
8. Tester les valeurs CSV à risque de formule (`=`, `+`, `-`, `@`, y compris préfixes invisibles) dans Excel et dans l'ODS/XLSX si pertinent.
9. Exécuter les tests JavaScript, `php tests/export-limit.smoke.php` et les vérifications PHP sur l'archive réellement installée ; comparer les empreintes avec l'archive de diffusion.
10. Tester désactivation/désinstallation puis retour à l'affichage GLPI natif.

## Réserve fonctionnelle connue

Le PDF natif en paysage, avec de nombreuses colonnes, peut couper le nom des ordinateurs. La variante expérimentale qui améliorait la colonne Nom dégradait les autres colonnes : elle a été abandonnée. Conserver le rendu natif de cette version et traiter l'amélioration par contribution séparée.

## Critères d'autorisation production / publication Marketplace

Accord du responsable et de l'hébergeur, sauvegardes testées, installation de l'archive finale qualifiée, droits et exports vérifiés, test HTTP de limite et mesures de charge acceptables, documentation et informations publiques vérifiées. La validation par GLPI pour le Marketplace est indépendante de ces tests locaux.
