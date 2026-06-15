# Changelog

Le format suit [Keep a Changelog](https://keepachangelog.com/) et le versionnage [SemVer](https://semver.org/).

## [Unreleased]

- Documentation complète (architecture, DORA, incident, RACI).
- Observabilité : `/ready`, version dans `/health`, logs JSON avec `request_id`.
- Scripts backup / restore-test / rollback fonctionnels.
- Scan Trivy en CI, environnement de production simulé via `HTTP_PORT`.

## [1.1.0] - 2026-06-15

### Added

- Modification SQL non destructive dans `database/init.sql` (colonne `category`, nouveau produit).
- Tests d'intégration `/api/products` et scénarios d'erreur (404, 400, 500, 503).

### Changed

- Enrichissement du frontend (états, catalogue dynamique).

## [1.0.0] - 2026-06-15

### Added

- API Express : `/`, `/health`, `/products`.
- Frontend statique servi par Nginx derrière un reverse proxy.
- Docker Compose (api, frontend, db, proxy) avec volume nommé PostgreSQL.
- CI/CD GitHub Actions (lint, test, build), Dockerfiles multi-stage.

## [0.1.0]

- Projet starter ShopLite.

## Hotfix

- `hotfix/*` : branche créée depuis `main` pour corriger un incident en production,
  mergée vers `main` puis `develop`. Voir `docs/INCIDENT.md`.
