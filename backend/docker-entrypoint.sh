#!/bin/sh
set -e

require_var() {
  eval "value=\$$1"
  if [ -z "$value" ]; then
    echo "[backend] ERROR: $1 is not set."
  else
    return 0
  fi
  return 1
}

missing=0
require_var DATABASE_URL || missing=1
require_var JWT_SECRET || missing=1

if [ "$missing" -eq 1 ]; then
  echo "[backend] Copy .env.example to .env at the repository root, set POSTGRES_PASSWORD, JWT_SECRET, and URLs, then:"
  echo "[backend]   docker compose config && docker compose up -d"
  exit 1
fi

case "$DATABASE_URL" in
  *@localhost:*|*@localhost/*|*@127.0.0.1:*|*@127.0.0.1/*)
    echo "[backend] WARNING: DATABASE_URL uses localhost. Inside Docker the host must be 'postgres'."
    ;;
esac

echo "[backend] Environment OK (DATABASE_URL present). Applying Prisma migrations..."
npx prisma migrate deploy

echo "[backend] Starting NestJS (production)..."
exec "$@"
