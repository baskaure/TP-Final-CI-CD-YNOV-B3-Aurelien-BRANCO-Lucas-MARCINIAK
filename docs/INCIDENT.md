# Rapport d'incident

## Template

- **Impact** : qui / quoi est touché, sévérité.
- **Timeline** : horodatage des actions clés.
- **Diagnostic** : symptôme, cause racine.
- **Correction** : action menée (revert / rollback).
- **Prévention** : mesures pour éviter la récidive.

---

## Incident INC-2026-001 : catalogue indisponible en staging (v1.1.0)

### Impact

- **Service** : route `/api/products` en erreur 500, le catalogue ne s'affiche plus côté frontend.
- **Environnement** : staging (port 8081).
- **Sévérité** : majeure (fonctionnalité métier principale indisponible).
- **Détection** : signalement client + test automatisé `/api/products` au rouge.

### Timeline

| Heure | Action                                       | Responsable       | Résultat                              |
| ----- | -------------------------------------------- | ----------------- | ------------------------------------- |
| 23:08 | Sauvegarde PostgreSQL préventive             | DBA               | Dump horodaté créé                    |
| 23:09 | Détection erreur `/api/products`             | QA                | Test rouge (3 échecs)                 |
| 23:09 | Analyse des logs API (`request_id`)          | DevOps + Dev API  | `column "price_euro" does not exist`  |
| 23:10 | Vérification PostgreSQL                       | DBA               | Données présentes                     |
| 23:11 | Décision de rollback                         | PO + Incident Mgr | Revert validé                         |
| 23:11 | `git revert` + reconstruction de l'API       | DevOps            | API rétablie                          |
| 23:12 | Tests automatisés + smoke test               | QA                | 28/28 verts                           |
| 23:12 | Vérification des données après rollback      | DBA               | 4 produits intacts                    |

### Diagnostic

- **Symptôme** : `GET /api/products` renvoie 500 ; les tests d'intégration échouent.
- **Cause racine** : la requête SQL de `api/src/routes/products.js` référence la colonne
  inexistante `price_euro` au lieu de `price_cents`, ce qui casse la lecture du catalogue.
- **Outils** : `git log`/`git diff`, logs JSON corrélés par `request_id`, suite Jest.

### Correction

- Annulation de la modification fautive via `git revert` sur la branche `hotfix/products-catalog`,
  puis reconstruction de l'API (`docker compose up -d --build api`).
- Alternative outillée disponible : `scripts/rollback.sh v1.0.0` (sauvegarde + logs avant,
  reconstruction sur le tag stable, smoke test après).
- **Aucune suppression de volume** : interdiction de `docker compose down -v`.
- Données PostgreSQL conservées (volume `shoplite_pgdata`).

### Mini-message incident

> **Impact** : catalogue ShopLite indisponible (~4 min), API et readiness OK par ailleurs.
> **Cause** : requête SQL invalide (`price_euro` au lieu de `price_cents`).
> **Action** : `git revert` de la modification fautive, données préservées.
> **Statut** : résolu, service rétabli, post-mortem documenté.

### Prévention

- Renforcer les tests d'intégration `/api/products` avant tout tag de release.
- Bloquer le déploiement production tant que la CI n'est pas verte (branch protection).
- Conserver une politique de backup systématique avant déploiement.
