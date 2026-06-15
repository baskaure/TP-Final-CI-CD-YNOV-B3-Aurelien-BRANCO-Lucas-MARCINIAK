#!/bin/sh
set -eu

VERSION="${1:-}"
COMPOSE="docker compose"
LOG_DIR="${LOG_DIR:-logs}"
BASE_URL="${BASE_URL:-http://localhost:8080}"

if [ -z "$VERSION" ]; then
  echo "Usage: scripts/rollback.sh <version>   (ex: v1.0.0)" >&2
  echo "Tags Git disponibles:" >&2
  git tag >&2
  exit 1
fi

if ! git rev-parse "$VERSION" >/dev/null 2>&1; then
  echo "Version '$VERSION' introuvable (tag ou commit Git)." >&2
  exit 1
fi

mkdir -p "$LOG_DIR"
TS=$(date +%Y%m%d-%H%M%S)

echo "[1/5] Export des logs API avant correction -> ${LOG_DIR}/api-${TS}.log"
$COMPOSE logs --no-color api >"${LOG_DIR}/api-${TS}.log" 2>&1 || true

echo "[2/5] Sauvegarde PostgreSQL (volumes conservés)"
sh scripts/backup.sh

echo "[3/5] Version actuellement déployée: $(git describe --tags --always)"

echo "[4/5] Rollback du code vers ${VERSION} puis reconstruction"
git checkout "$VERSION"
$COMPOSE up -d --build

echo "[5/5] Vérification post-rollback"
sleep 10
BASE_URL="$BASE_URL" sh scripts/smoke-test.sh

echo "Rollback vers ${VERSION} terminé sans suppression de volume."
echo "Rappel: ne jamais utiliser 'docker compose down -v' pendant un rollback."
