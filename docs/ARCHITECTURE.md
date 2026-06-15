# Architecture ShopLite

## Vue d'ensemble

ShopLite est une mini application e-commerce composée d'un frontend statique, d'une
API Node.js/Express et d'une base PostgreSQL, le tout orchestré par Docker Compose
derrière un reverse proxy Nginx.

```mermaid
flowchart LR
  user([Utilisateur]) -->|HTTP 8080/8081/8082| proxy[Nginx proxy]

  subgraph stack[Réseau Docker shoplite_net]
    proxy -->|/| frontend[Frontend Nginx<br/>HTML/CSS/JS]
    proxy -->|/api/*| api[API Node.js<br/>Express]
    api -->|SQL 5432| db[(PostgreSQL 16<br/>volume shoplite_pgdata)]
  end

  db -.->|pg_dump| backups[(backups/*.sql)]
```

## Flux CI/CD

```mermaid
flowchart TD
  dev[Push / PR] --> ci[CI: lint + test + build + trivy]
  ci -->|main| stg[CD: deploy staging 8081]
  ci -->|tag v*| prod[CD: deploy production 8082]
  prod -.->|approbation environment| gate{{GitHub Environment production}}
  stg --> smoke1[Smoke test /health /ready /products]
  prod --> smoke2[Smoke test]
```

## Composants

| Composant  | Image / techno      | Rôle                                          |
| ---------- | ------------------- | --------------------------------------------- |
| proxy      | nginx:1.27-alpine   | Reverse proxy, route `/` et `/api/*`          |
| frontend   | nginx:1.27-alpine   | Sert le HTML/CSS/JS statique                  |
| api        | node:20-alpine      | API REST `/health` `/ready` `/products`       |
| db         | postgres:16-alpine  | Stockage des produits, volume nommé           |

## Réseau et communication

- Les services communiquent par leur **nom de service** sur le réseau `shoplite_net`.
- L'API joint PostgreSQL via l'hôte `db` (résolution DNS interne Docker), jamais via `localhost`.
- Seul le `proxy` publie un port vers l'hôte ; l'API et la DB ne sont pas exposées en production.

## Persistance

- Volume nommé `shoplite_pgdata` monté sur `/var/lib/postgresql/data`.
- `database/init.sql` initialise le schéma au premier démarrage du volume.
- Les sauvegardes `pg_dump` sont stockées hors conteneur dans `backups/`.
