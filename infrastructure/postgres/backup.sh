#!/bin/sh
# ──────────────────────────────────────────────────────────────
#  PostgreSQL Automated Backup Script
#  Creates compressed SQL dumps with timestamped filenames
#  Retains the last 7 daily backups automatically
# ──────────────────────────────────────────────────────────────
set -e

BACKUP_DIR="/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_NAME="${POSTGRES_DB:-shared_db}"
DB_USER="${POSTGRES_USER:-postgres}"
DB_HOST="${POSTGRES_HOST:-postgres_db}"
RETENTION_DAYS=7

echo "╔══════════════════════════════════════════════════════╗"
echo "║       PostgreSQL Backup — ${TIMESTAMP}              ║"
echo "╚══════════════════════════════════════════════════════╝"

mkdir -p "${BACKUP_DIR}"

# ── Full database dump (compressed) ──────────────────────────
BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_${TIMESTAMP}.sql.gz"
echo "📦 Backing up database '${DB_NAME}' → ${BACKUP_FILE}"

pg_dump -h "${DB_HOST}" -U "${DB_USER}" -d "${DB_NAME}" \
    --clean --if-exists --no-owner --no-privileges \
    | gzip > "${BACKUP_FILE}"

SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
echo "✅ Backup complete: ${BACKUP_FILE} (${SIZE})"

# ── Cleanup old backups (keep last N days) ───────────────────
echo ""
echo "🧹 Removing backups older than ${RETENTION_DAYS} days..."
deleted=$(find "${BACKUP_DIR}" -name "*.sql.gz" -mtime +${RETENTION_DAYS} -print -delete | wc -l)
echo "   Removed ${deleted} old backup(s)"

# ── List current backups ─────────────────────────────────────
echo ""
echo "📁 Current backups:"
ls -lth "${BACKUP_DIR}"/*.sql.gz 2>/dev/null || echo "   (none)"

echo ""
echo "✅ Backup job finished at $(date)"
