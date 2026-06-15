# Contribution

## Stratégie de branches

| Branche      | Rôle                                                        |
| ------------ | ----------------------------------------------------------- |
| `main`       | Production, protégée, taguée (`v*.*.*`).                     |
| `develop`    | Intégration continue, déployée en staging.                  |
| `feature/*`  | Nouvelle fonctionnalité, partie de `develop`.               |
| `hotfix/*`   | Correctif urgent depuis `main`, mergé vers `main` + `develop`. |

## Commits conventionnels

Format : `type(scope): message`

Types utilisés : `feat`, `fix`, `test`, `docs`, `ci`, `chore`, `refactor`.

Exemples :

```text
feat(api): ajoute la route /ready
fix(products): corrige la requête SQL du catalogue
test(products): test d'intégration /api/products
docs(readme): tableau des environnements
ci(actions): scan Trivy de l'image API
```

## Pull Requests

- Une PR par fonctionnalité, depuis `feature/*` vers `develop`.
- Remplir le template `.github/pull_request_template.md` (tests, build, smoke test, rollback).
- La CI doit être **verte** avant merge.
- Au moins **une review** d'un binôme avec un commentaire.

## Code review

- Vérifier lisibilité, tests, absence de secret commité.
- Laisser au moins un commentaire constructif.
- Approuver uniquement si la CI passe.

## Tags et releases

```bash
git tag v1.0.0
git tag v1.1.0
git push --tags
```

## Rollback

En cas d'incident, suivre `docs/INCIDENT.md` et utiliser `scripts/rollback.sh <version>`.
Ne jamais exécuter `docker compose down -v` (perte des volumes).
