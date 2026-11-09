# Contribuer à Warranty Colors / Contributing

Les retours et pull requests sont les bienvenus. Merci de décrire la version GLPI 11, le navigateur, le format d'export et un scénario reproductible avec **données fictives**.

## Pistes d'amélioration

- Répartition des largeurs des 11 colonnes dans le PDF A4 paysage. Conserver le moteur GLPI natif et les couleurs ; ne pas dégrader les colonnes secondaires ni le pied de page.
- Tests d'intégration authentifiés pour la limite HTTP 1 000/1 001 et les recherches filtrées.
- Mesure de la consommation PHP-FPM avec des exports volumineux.
- Tests de sécurité des cellules CSV/XLSX/ODS et compatibilité des différentes versions GLPI 11.

## Avant une pull request

1. Ne pas inclure de données clients, secrets, captures de production ou informations de l'infrastructure.
2. Préserver les permissions GLPI, l'absence de modification de configuration globale, la limitation des exports et les formats existants.
3. Exécuter `node --test tests/status.test.cjs tests/dom.test.cjs` et vérifier la syntaxe des fichiers PHP modifiés.
4. Fournir un test ou un cas reproductible démontrant le changement ; documenter la compatibilité et les éventuelles limites.

Les vulnérabilités de sécurité ne doivent pas être publiées avec des détails exploitables dans une issue ouverte ; utiliser le canal de signalement privé du mainteneur lorsqu'il est disponible.
