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

| Heure | Action                                   | Responsable          | Résultat                  |
| ----- | ---------------------------------------- | -------------------- | ------------------------- |
| 10:05 | Détection erreur `/api/products`         | QA                   | Test rouge                |
| 10:08 | Analyse des logs API (request_id)        | DevOps + Dev API     | Erreur SQL dans la route  |
| 10:12 | Vérification PostgreSQL                   | DBA                  | Données présentes         |
| 10:13 | `scripts/backup.sh` (sauvegarde dump)    | DBA                  | Dump horodaté créé        |
| 10:15 | Décision de rollback                     | PO + Incident Mgr    | Rollback validé           |
| 10:18 | `scripts/rollback.sh v1.0.0`             | DevOps               | API redémarrée sur v1.0.0 |
| 10:22 | Smoke test + tests automatisés           | QA                   | Tests verts               |
| 10:25 | Vérification données post-rollback       | DBA                  | Produits intacts          |

### Diagnostic

- **Symptôme** : `GET /api/products` renvoie 500 ; le test d'intégration échoue.
- **Cause racine** : une modification de la requête SQL dans `api/src/routes/products.js`
  (colonne inexistante) introduite avec la v1.1.0 casse la lecture des produits.
- **Outils** : `git log`/`git diff`, logs JSON corrélés par `request_id`, suite Jest.

### Correction

- Rollback du code vers le tag stable `v1.0.0` via `scripts/rollback.sh v1.0.0`
  (sauvegarde + logs avant, reconstruction, smoke test après).
- **Aucune suppression de volume** : interdiction de `docker compose down -v`.
- Données PostgreSQL conservées (volume `shoplite_pgdata`).

### Mini-message incident

> **Impact** : catalogue ShopLite indisponible en staging (~20 min).
> **Cause** : requête SQL invalide introduite en v1.1.0.
> **Action** : rollback vers v1.0.0, données préservées.
> **Statut** : résolu, service rétabli, post-mortem documenté.

### Prévention

- Renforcer les tests d'intégration `/api/products` avant tout tag de release.
- Bloquer le déploiement production tant que la CI n'est pas verte (branch protection).
- Conserver une politique de backup systématique avant déploiement.
