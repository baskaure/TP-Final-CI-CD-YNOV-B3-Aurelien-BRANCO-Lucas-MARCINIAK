# Indicateurs DORA

Les quatre indicateurs DORA mesurent la performance de livraison de l'équipe.
Valeurs mesurées sur le périmètre pédagogique du TP.

| Indicateur               | Définition                                              | Mesure ShopLite                         | Source                          |
| ------------------------ | ------------------------------------------------------- | --------------------------------------- | ------------------------------- |
| Lead time for changes    | Temps entre un commit et sa mise en production          | ~15 min (commit → CI verte → tag → CD)  | GitHub Actions (durée des runs) |
| Deployment frequency     | Fréquence des déploiements réussis                      | À la demande, plusieurs / jour de TP    | Historique du workflow CD       |
| Change failure rate      | % de déploiements provoquant un incident                | 1 incident sur N déploiements (~déduit) | docs/INCIDENT.md + runs CD      |
| Mean time to restore     | Temps moyen pour rétablir le service après incident     | ~20 min (détection → rollback → vert)   | Timeline docs/INCIDENT.md       |

## Comment ces valeurs sont obtenues

- **Lead time** : différence entre l'horodatage du commit et la fin du job CD correspondant.
- **Deployment frequency** : nombre de runs `CD` en succès sur la période.
- **Change failure rate** : nombre d'incidents (`docs/INCIDENT.md`) rapporté au nombre de déploiements.
- **MTTR** : durée entre la détection (test `/api/products` rouge) et le retour au vert après rollback.

## Objectif d'amélioration

- Réduire le lead time en parallélisant davantage les jobs CI.
- Diminuer le change failure rate en renforçant les tests d'intégration avant tag.
