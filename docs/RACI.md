# Matrice RACI

## Légende

- **R** Responsible : réalise l'action.
- **A** Accountable : porte la responsabilité finale et valide.
- **C** Consulted : consulté avant/pendant l'action.
- **I** Informed : tenu informé du résultat.

## Équipe (binôme, rôles cumulés)

| Personne          | Rôles couverts                                        |
| ----------------- | ----------------------------------------------------- |
| Aurélien Branco   | DevOps / Release Manager, DBA, Incident Manager       |
| Lucas Marciniak   | Dev API, Dev Frontend, QA, Product Owner              |

## Matrice

| Activité                              | PO  | API | Front | DevOps | DBA | QA  | Incident Mgr |
| ------------------------------------- | --- | --- | ----- | ------ | --- | --- | ------------ |
| Créer la version stable Git           | A   | R   | C     | R      | I   | C   | I            |
| Mettre en place Docker Compose        | I   | C   | C     | A/R    | C   | I   | I            |
| Configurer la CI/CD                   | I   | C   | I     | A/R    | I   | C   | I            |
| Ajouter le test /api/products         | I   | R   | I     | C      | I   | A/R | I            |
| Sauvegarder PostgreSQL                | I   | I   | I     | C      | A/R | I   | I            |
| Provoquer l'incident contrôlé         | C   | R   | I     | C      | I   | A   | I            |
| Diagnostiquer l'incident              | I   | R   | C     | R      | C   | C   | A            |
| Décider le rollback                   | A   | C   | I     | R      | C   | C   | A            |
| Exécuter le rollback                  | I   | C   | I     | A/R    | C   | I   | I            |
| Vérifier les données après rollback   | I   | I   | I     | C      | A/R | C   | I            |
| Valider les tests après rollback      | I   | C   | C     | C      | I   | A/R | I            |
| Rédiger le rapport d'incident         | I   | C   | I     | C      | C   | I   | A/R          |

## Qui a réellement fait quoi pendant le TP

- **Aurélien** : Dockerfiles, Compose, CI/CD, scripts backup/rollback, observabilité, sécurité.
- **Lucas** : routes API, tests Jest, frontend, documentation, scénario d'incident et QA.

## Timeline d'incident

Voir [INCIDENT.md](INCIDENT.md) (section Timeline) pour le déroulé horodaté de l'incident contrôlé.
