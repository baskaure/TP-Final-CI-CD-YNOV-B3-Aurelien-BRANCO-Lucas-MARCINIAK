# ShopLite

Branco Aurélien, Marciniak Lucas

[![CI](https://github.com/baskaure/TP-Final-CI-CD-YNOV-B3-Aurelien-BRANCO-Lucas-MARCINIAK/actions/workflows/ci.yml/badge.svg)](https://github.com/baskaure/TP-Final-CI-CD-YNOV-B3-Aurelien-BRANCO-Lucas-MARCINIAK/actions/workflows/ci.yml)
[![CD](https://github.com/baskaure/TP-Final-CI-CD-YNOV-B3-Aurelien-BRANCO-Lucas-MARCINIAK/actions/workflows/cd.yml/badge.svg)](https://github.com/baskaure/TP-Final-CI-CD-YNOV-B3-Aurelien-BRANCO-Lucas-MARCINIAK/actions/workflows/cd.yml)
![Node](https://img.shields.io/badge/node-20%20%7C%2022-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

ShopLite est une mini application e-commerce : un frontend statique, une API Node.js/Express
et une base PostgreSQL, lancés avec Docker Compose derrière un reverse proxy Nginx.

## Sommaire

- [Stack](#stack)
- [Installation et lancement](#installation-et-lancement)
- [Tester l'API](#tester-lapi)
- [Tests et qualité](#tests-et-qualité)
- [Docker et images](#docker-et-images)
- [CI/CD](#cicd)
- [Environnements](#environnements)
- [Secrets et configuration](#secrets-et-configuration)
- [Déploiement](#déploiement)
- [Observabilité](#observabilité)
- [Backup et rollback](#backup-et-rollback)
- [Sécurité](#sécurité)
- [Documentation](#documentation)

## Stack

| Couche   | Techno              | Port hôte (dev) |
| -------- | ------------------- | --------------- |
| Proxy    | nginx:1.27-alpine   | 8080            |
| Frontend | nginx:1.27-alpine   | via proxy       |
| API      | node:20-alpine      | via proxy       |
| DB       | postgres:16-alpine  | 5433            |

Les diagrammes sont dans [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Installation et lancement

```bash
cp .env.example .env
docker compose up -d --build
```

Application : http://localhost:8080

Arrêter sans supprimer les données :

```bash
docker compose down
```

Ne jamais utiliser `docker compose down -v` : cette commande supprime le volume PostgreSQL.

## Tester l'API

```bash
curl http://localhost:8080/api/health
curl http://localhost:8080/api/ready
curl http://localhost:8080/api/products
```

## Tests et qualité

```bash
cd api
npm ci
npm test              # unit + integration, couverture minimale 80%
npm run lint          # ESLint
npm run format:check  # Prettier
```

- Tests unitaires dans `tests/unit/` (formatage prix, logger).
- Tests d'intégration avec PostgreSQL réel dans `tests/integration/` (`/products`, `/health`, `/ready`).
- Scénarios d'erreur couverts : 404, 400, 500, 503.
- Seuil de couverture à 80% configuré dans `package.json` (la CI échoue en dessous).

## Docker et images

```bash
docker build -t shoplite-api:local ./api
docker images shoplite-api
docker inspect shoplite-api:local
```

- Images officielles figées (`node:20-alpine`, `postgres:16-alpine`, `nginx:1.27-alpine`).
- Dockerfile API multi-stage, `HEALTHCHECK`, `.dockerignore`, image cible sous 200 MB.

### Registry et tags

Association entre le tag Git et le tag Docker :

```bash
git tag v1.0.0
docker build -t shoplite-api:v1.0.0 ./api
docker build -t shoplite-frontend:v1.0.0 ./frontend
docker images | grep shoplite
docker inspect shoplite-api:v1.0.0
```

| Tag Git | Image API           | Image Frontend          |
| ------- | ------------------- | ----------------------- |
| v1.0.0  | shoplite-api:v1.0.0 | shoplite-frontend:v1.0.0 |
| v1.1.0  | shoplite-api:v1.1.0 | shoplite-frontend:v1.1.0 |

## CI/CD

`.github/workflows/ci.yml` : jobs `lint`, `test`, `build`, `security` (Trivy).

- Déclencheurs : push, pull_request, tags `v*.*.*`, `workflow_dispatch`.
- Matrix Node 20 et 22, cache npm, service PostgreSQL, artefact de couverture.
- Le job `build` dépend de `lint` et `test` (`needs:`).

`.github/workflows/cd.yml` : déploiement staging (push `main`) et production (tag `v*`),
avec un GitHub Environment `production` soumis à approbation manuelle.

## Environnements

| Env               | Déclencheur           | URL locale            | Port | APP_VERSION     |
| ----------------- | --------------------- | --------------------- | ---- | --------------- |
| dev               | local                 | http://localhost:8080 | 8080 | starter         |
| staging           | push `main`           | http://localhost:8081 | 8081 | staging-starter |
| production simulée | tag `v*`              | http://localhost:8082 | 8082 | production      |

```bash
docker compose up -d --build                                                      # dev
docker compose -f docker-compose.yml -f docker-compose.staging.yml up -d --build  # staging
HTTP_PORT=8082 APP_VERSION=production docker compose up -d --build                 # prod simulée
```

## Secrets et configuration

- `.env.example` documente toutes les variables, sans valeur sensible réelle.
- Le vrai `.env` est ignoré par Git (`.gitignore`).
- Secrets séparés par environnement via les GitHub Environments (dev, staging, prod).
- Aucun secret en dur dans les Dockerfile ni dans le code.
- Rotation : les mots de passe (DB, secrets CI) sont renouvelés à chaque fin de sprint
  ou immédiatement en cas de fuite, en mettant à jour le secret GitHub puis en redéployant.

## Déploiement

Smoke test après déploiement :

```bash
BASE_URL=http://localhost:8081 sh scripts/smoke-test.sh
```

Il vérifie `/api/health`, `/api/ready` et `/api/products`.

### Journal de déploiement

| Date       | Version | Auteur   | Commande                                                | Résultat |
| ---------- | ------- | -------- | ------------------------------------------------------- | -------- |
| 2026-06-15 | v1.0.0  | Aurélien | `docker compose up -d --build`                          | OK       |
| 2026-06-15 | v1.1.0  | Lucas    | `docker compose -f ... -f docker-compose.staging.yml up`| OK       |

### Plan de retour arrière

```bash
sh scripts/rollback.sh v1.0.0
```

Le script sauvegarde les logs et la base, reconstruit la version cible, relance le smoke test
et conserve le volume PostgreSQL.

## Observabilité

- `/api/health` : statut API, statut DB, version et timestamp.
- `/api/ready` : readiness de l'API et de PostgreSQL, utilisée par le healthcheck Compose.
- Logs JSON structurés, niveaux DEBUG/INFO/WARN/ERROR/FATAL, identifiant `request_id` propagé
  (en-tête `X-Request-Id`).
- Sanitization des champs sensibles (password, token, secret, database_url).
- Rotation des logs Docker via `max-size` et `max-file`.
- En production, ces logs seraient envoyés vers une stack de centralisation (par exemple Loki ou ELK).

### Commandes de diagnostic

```bash
docker compose ps
docker compose logs --tail=100 api
curl http://localhost:8080/api/health
docker inspect shoplite_api
```

### Suivi des incidents

| Symptôme                     | Heure | Cause supposée       | Commande utilisée            | Résultat        |
| ---------------------------- | ----- | -------------------- | ---------------------------- | --------------- |
| `/api/products` renvoie 500  | 10:05 | Requête SQL invalide | `docker compose logs api`    | Erreur repérée  |
| Catalogue vide côté frontend | 10:06 | API en erreur        | `curl /api/products`         | 500 confirmé    |
| Retour au stable             | 10:18 | Rollback v1.0.0      | `scripts/rollback.sh v1.0.0` | Service rétabli |

## Backup et rollback

```bash
sh scripts/backup.sh        # pg_dump horodaté dans backups/, rétention 7
sh scripts/restore-test.sh  # restauration dans une base temporaire et contrôle
sh scripts/rollback.sh v1.0.0
```

Le scénario complet d'incident contrôlé et de rollback est décrit dans [docs/INCIDENT.md](docs/INCIDENT.md).

## Sécurité

- Scan d'image Trivy en CI (sévérités CRITICAL et HIGH), rapport SARIF en artefact.
- `npm audit` et `npm outdated` exécutés dans la CI.

### Checklist sécurité

- [x] Aucun secret réel commité (`.env` ignoré, `.env.example` sans valeur sensible).
- [x] Ports exposés minimisés (seul le proxy publie un port).
- [x] Dépendances auditées (`npm audit`, `npm outdated`).
- [x] Image scannée avec Trivy et basée sur une version figée.
- [x] Logs sans secret en clair (sanitization).
- [x] Conteneur API exécuté en non-root (`USER node`).

### Classement des risques

| Risque                              | Niveau   | Mitigation                                  |
| ----------------------------------- | -------- | ------------------------------------------- |
| Secret commité par erreur           | Critique | `.gitignore`, revue de PR                   |
| Vulnérabilité dépendance (CVE HIGH) | Moyen    | `npm audit`, Trivy, mise à jour             |
| Port DB exposé publiquement         | Moyen    | Non publié hors dev, réseau interne         |
| Dépendance obsolète non testée      | Faible   | `npm outdated`, montée de version contrôlée |

## Documentation

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) : diagrammes.
- [docs/INCIDENT.md](docs/INCIDENT.md) : rapport d'incident.
- [docs/DORA.md](docs/DORA.md) : indicateurs DORA.
- [docs/RACI.md](docs/RACI.md) : matrice RACI et rôles.
- [CHANGELOG.md](CHANGELOG.md) : historique des versions.
- [CONTRIBUTING.md](CONTRIBUTING.md) : branches, commits, PR, review.
