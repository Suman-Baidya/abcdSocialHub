#!/bin/bash
set -e

echo "=== Initializing ABCD Social Hub Database ==="
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";
EOSQL
echo "=== Database Extensions Initialized Successfully ==="
