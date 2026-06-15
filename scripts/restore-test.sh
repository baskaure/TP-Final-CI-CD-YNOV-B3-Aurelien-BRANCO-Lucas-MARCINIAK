#!/bin/sh
set -eu

DB_CONTAINER="${DB_CONTAINER:-shoplite_db}"
DB_USER="${POSTGRES_USER:-shoplite}"
BACKUP_DIR="${BACKUP_DIR:-backups}"
DUMP="${1:-$(ls -1t "${BACKUP_DIR}"/shoplite-*.sql 2>/dev/null | head -n1)}"
TMP_DB="shoplite_restore_test_$(date +%s)"

if [ -z "${DUMP:-}" ] || [ ! -f "$DUMP" ]; then
  echo "Aucun dump trouvé dans ${BACKUP_DIR}. Lancer scripts/backup.sh d'abord." >&2
  exit 1
fi

echo "Test de restauration de ${DUMP} dans une base temporaire ${TMP_DB}"
docker exec "$DB_CONTAINER" createdb -U "$DB_USER" "$TMP_DB"

docker exec -i "$DB_CONTAINER" psql -U "$DB_USER" -d "$TMP_DB" <"$DUMP" >/dev/null

COUNT=$(docker exec "$DB_CONTAINER" psql -U "$DB_USER" -d "$TMP_DB" -t -A -c "SELECT count(*) FROM products;")
echo "Produits restaurés: ${COUNT}"

echo "Nettoyage de la base temporaire"
docker exec "$DB_CONTAINER" dropdb -U "$DB_USER" "$TMP_DB"

if [ "${COUNT:-0}" -ge 1 ]; then
  echo "Restore test OK"
else
  echo "Restore test ECHEC: aucune donnée restaurée" >&2
  exit 1
fi
