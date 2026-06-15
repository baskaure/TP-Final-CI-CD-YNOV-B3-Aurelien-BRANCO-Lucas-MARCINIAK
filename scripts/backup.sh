#!/bin/sh
set -eu

DB_CONTAINER="${DB_CONTAINER:-shoplite_db}"
DB_USER="${POSTGRES_USER:-shoplite}"
DB_NAME="${POSTGRES_DB:-shoplite}"
BACKUP_DIR="${BACKUP_DIR:-backups}"
RETENTION="${RETENTION:-7}"

mkdir -p "$BACKUP_DIR"

TS=$(date +%Y%m%d-%H%M%S)
FILE="${BACKUP_DIR}/shoplite-${DB_NAME}-${TS}.sql"

echo "Sauvegarde de ${DB_NAME} depuis ${DB_CONTAINER} -> ${FILE}"
docker exec "$DB_CONTAINER" pg_dump -U "$DB_USER" -d "$DB_NAME" >"$FILE"

echo "Dump créé ($(du -h "$FILE" | cut -f1))"

echo "Rétention: conservation des ${RETENTION} derniers dumps"
ls -1t "${BACKUP_DIR}"/shoplite-*.sql 2>/dev/null | tail -n +$((RETENTION + 1)) | while read -r old; do
  echo "  suppression ${old}"
  rm -f "$old"
done

echo "Backup OK"
