#!/bin/sh
# ──────────────────────────────────────────────────────────────
#  PostgreSQL Disaster Recovery — Restore Script
#  Restores the latest (or specified) backup to PostgreSQL
# ──────────────────────────────────────────────────────────────
set -e

BACKUP_DIR="/backups"
DB_NAME="${POSTGRES_DB:-shared_db}"
DB_USER="${POSTGRES_USER:-postgres}"
DB_HOST="${POSTGRES_HOST:-postgres_db}"

# Use specified backup or find the latest
BACKUP_FILE="${1}"
if [ -z "${BACKUP_FILE}" ]; then
    BACKUP_FILE=$(ls -t "${BACKUP_DIR}"/*.sql.gz 2>/dev/null | head -1)
fi

if [ -z "${BACKUP_FILE}" ] || [ ! -f "${BACKUP_FILE}" ]; then
    echo "❌ No backup file found."
    echo "   Usage: $0 [backup_file.sql.gz]"
    echo "   Or ensure backups exist in ${BACKUP_DIR}/"
    exit 1
fi

echo "╔══════════════════════════════════════════════════════╗"
echo "║       PostgreSQL Disaster Recovery                  ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
echo "  Database:    ${DB_NAME}"
echo "  Host:        ${DB_HOST}"
echo "  Backup file: ${BACKUP_FILE}"
echo ""

SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
echo "📦 Restoring from backup (${SIZE})..."

gunzip -c "${BACKUP_FILE}" | psql -h "${DB_HOST}" -U "${DB_USER}" -d "${DB_NAME}" --single-transaction

echo ""
echo "✅ Database restored successfully from: ${BACKUP_FILE}"
echo "   Restored at: $(date)"
