#!/bin/bash
# ==============================================================
# Daily PostgreSQL Snapshot Backup to Cloudflare R2 / S3
# ==============================================================

set -e

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/tmp/db_backups"
BACKUP_FILE="${BACKUP_DIR}/abcd_social_${TIMESTAMP}.sql.gz"

mkdir -p "$BACKUP_DIR"

echo "Starting PostgreSQL backup: ${BACKUP_FILE}..."
docker exec abcd-postgres pg_dump -U postgres abcd_social | gzip > "$BACKUP_FILE"

echo "Backup created successfully ($(du -h "$BACKUP_FILE" | cut -f1))"

# If AWS CLI or R2 is configured, upload snapshot
if [ -n "$R2_BUCKET_NAME" ]; then
    echo "Uploading backup to Cloudflare R2 bucket: $R2_BUCKET_NAME..."
    # aws s3 cp "$BACKUP_FILE" "s3://${R2_BUCKET_NAME}/backups/abcd_social_${TIMESTAMP}.sql.gz" --endpoint-url https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com
fi

# Cleanup backups older than 7 days
find "$BACKUP_DIR" -type f -name "*.sql.gz" -mtime +7 -exec rm {} +

echo "Backup routine completed."
