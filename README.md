# Warranty Colors

**Version 1.0.0 — GLPI 11**  
Open-source plugin / Plugin open source — MIT.

Warranty Colors adds visual warranty-status indicators, native GLPI search filters and colored computer-warranty exports. It is manufacturer-independent: no Dell, HP, Lenovo or other vendor API is required.

Warranty Colors facilite la lecture des dates de garantie des ordinateurs dans GLPI 11, avec indicateurs, filtres natifs et exports colorisés, sans service constructeur.

![Warranty Colors logo](public/img/logo.png)

## Fonctions / Features

| Statut / Status | Règle / Rule | Couleur / Color |
|---|---|---|
| Expirée / Expired | Date antérieure à aujourd'hui / Past date | Rouge / Red |
| Sous 90 jours / Expiring soon | Aujourd'hui à J+90 inclus / Today through day 90 | Orange |
| Valide / Valid | Après J+90 / After day 90 | Vert / Green |
| Inconnue / Unknown | Date absente ou non interprétable / Missing or unrecognized | Gris / Grey |

**Filtres / Filters:** Tous, Expirées, Sous 90 jours, Valides, Inconnues. Les boutons construisent des critères de recherche GLPI côté serveur (ils ne masquent pas simplement les lignes de la page courante).

**Exports / Downloads:** PDF (A4 paysage / landscape), XLSX, ODS, CSV. Choix entre page courante / current page et toutes les pages / all pages. Les exports reprennent les colonnes et restrictions d'accès de la recherche GLPI. Les couleurs sont conservées dans PDF, XLSX et ODS ; le CSV est sans couleurs. La protection contre les valeurs assimilables à des formules est appliquée au CSV.

**Limite / Limit:** un export « Toutes les pages » portant sur plus de 1 000 résultats est conçu pour retourner HTTP 422 avec un message demandant d'affiner la recherche. Le seuil a été validé en test unitaire ; la qualification HTTP de bout en bout à 1 001 résultats reste à réaliser.

## Installation / Installation

1. Vérifier la compatibilité de la version exacte de GLPI 11 et sauvegarder la base de données, les fichiers et la configuration du serveur.
2. Extraire le ZIP de manière à obtenir le dossier `plugins/warrantycolors/` contenant directement `setup.php` et `hook.php`.
3. Depuis **Configuration → Plugins**, installer puis activer Warranty Colors.
4. Dans **Parc → Ordinateurs**, inclure la colonne GLPI « Expiration de la garantie » (option de recherche `Computer` n° 120) ; vérifier les couleurs, les filtres et chaque export avec un compte disposant des droits appropriés.
5. Avant un déploiement en production, appliquer la recette et le rollback documentés dans `docs/VALIDATION.md`.

The plugin was exercised on GLPI 11, Debian 13, Apache and PHP 8.4-FPM. **Compatibility across all GLPI 11 releases and high-volume use has not been fully verified.** Do not treat the declared `11.x` requirement as certification of every minor version.

## Sécurité et confidentialité / Security & privacy

- Export controller checks `Computer::canView()` and uses GLPI's authorized search engine and entity restrictions.
- No vendor API, external network dependency or telemetry is required by the plugin.
- The `install()` and `uninstall()` hooks do not modify GLPI core configuration or asset records.
- In particular, this version does **not** change `auto_create_infocoms` (earlier experimental builds could enable this GLPI core setting; their effects are not automatically undone).
- The supplied sample pages and tests contain artificial data only.
- Avoid publishing customer/production screenshots, addresses, hostnames and credentials when reporting bugs.

## Tests / Tests

JavaScript (Node.js):

```sh
node --test tests/status.test.cjs tests/dom.test.cjs
```

PHP syntax (run locally with PHP CLI):

```sh
find . -type f -name '*.php' -print0 | xargs -0 -n1 php -l
```

PHP guard tests (from an installed GLPI plugin directory):

```sh
php tests/export-limit.smoke.php
```

Previously validated in the GLPI test environment: four sample computers, warranty colors, XLSX and CSV exports, PDF (with a known layout limitation), ODS and opening the spreadsheets in Microsoft Excel. Eight boundary/invalid-count unit scenarios passed for the 1,000-row guard. **An authenticated HTTP integration test with 1,001 rows and a PHP-FPM memory load test remain outstanding.** See `docs/VALIDATION.md`.

## Limites connues / Known limitations

- Avec 11 colonnes sur une page A4 paysage, certains noms d'ordinateurs peuvent être coupés sur plusieurs lignes dans le PDF natif. Les données et couleurs restent présentes. Toute amélioration sera examinée séparément, afin de ne pas dégrader les autres colonnes.
- Les dates de garantie des exports tableur peuvent être encodées comme texte : leur affichage fonctionne, mais les calculs de dates dans le tableur peuvent nécessiter une conversion.
- Le seuil d'alerte de 90 jours est fixe dans cette version.
- La qualification de charge et la compatibilité sur d'autres environnements GLPI 11 restent à réaliser avant déploiement large.

## Désinstallation / Uninstallation

Désactiver puis désinstaller depuis GLPI. Le plugin ne crée pas de tables propres et ses hooks d'installation/désinstallation ne modifient pas les paramètres globaux de GLPI. Une désinstallation n'annule pas les changements éventuellement effectués manuellement ou par une ancienne version expérimentale. Conserver les sauvegardes jusqu'à validation du retour à la normale.

## Documentation et contributions

- `docs/VALIDATION.md` : recette de qualification, contrôles et rollback.
- `docs/DEMO.html` : démonstration locale sans données réelles.
- `CHANGELOG.md` : historique de la version.
- `CONTRIBUTING.md` : guide de contribution, dont l'amélioration facultative du PDF.
- `LICENSE` : licence MIT.

Pour la publication au catalogue et au Marketplace GLPI, suivre les instructions du site officiel et prévoir une validation distincte de l'équipe GLPI. Une installation en production doit être autorisée par son exploitant et précédée d'une sauvegarde restaurable.
