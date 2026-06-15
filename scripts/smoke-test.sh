#!/bin/sh
set -eu

BASE_URL="${BASE_URL:-http://localhost:8080}"

echo "Smoke test sur ${BASE_URL}"

check() {
  path="$1"
  printf "  GET %s ... " "$path"
  if curl -fsS "${BASE_URL}${path}" >/dev/null; then
    echo "OK"
  else
    echo "ECHEC"
    exit 1
  fi
}

check "/api/health"
check "/api/ready"
check "/api/products"

echo "Smoke test OK"
