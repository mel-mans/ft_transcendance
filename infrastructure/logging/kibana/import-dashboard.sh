#!/bin/sh
# ──────────────────────────────────────────────────────────────
#  Kibana Dashboard Auto-Importer
#  Waits for Kibana to be fully ready, then imports saved objects
# ──────────────────────────────────────────────────────────────
set -e

KIBANA_URL="${KIBANA_URL:-http://kibana:5601}"
DASHBOARD_FILE="/usr/share/kibana/dashboards/platform-logs-dashboard.ndjson"
MAX_RETRIES=60
RETRY_INTERVAL=5

# Authentication (when xpack.security is enabled)
AUTH=""
if [ -n "${ES_USER}" ] && [ -n "${ES_PASS}" ]; then
    AUTH="-u ${ES_USER}:${ES_PASS}"
fi

echo "╔══════════════════════════════════════════════════════╗"
echo "║       Kibana Dashboard Auto-Importer                ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
echo "  Kibana URL:     ${KIBANA_URL}"
echo "  Dashboard file: ${DASHBOARD_FILE}"
echo ""

# ── Wait for Kibana to be ready ──────────────────────────────
echo "⏳ Waiting for Kibana to become ready..."
attempt=0
while [ $attempt -lt $MAX_RETRIES ]; do
    attempt=$((attempt + 1))

    http_code=$(curl -sf -o /dev/null -w "%{http_code}" $AUTH "${KIBANA_URL}/api/status" 2>/dev/null || echo "000")

    if [ "$http_code" = "200" ]; then
        echo "✅ Kibana is ready (attempt ${attempt}/${MAX_RETRIES})"
        break
    fi

    echo "   attempt ${attempt}/${MAX_RETRIES} — HTTP ${http_code}, retrying in ${RETRY_INTERVAL}s..."
    sleep $RETRY_INTERVAL
done

if [ "$http_code" != "200" ]; then
    echo "❌ Kibana did not become ready within $((MAX_RETRIES * RETRY_INTERVAL))s — aborting"
    exit 1
fi

# ── Check if dashboard already exists ────────────────────────
echo ""
echo "🔍 Checking if dashboard is already imported..."
existing=$(curl -sf $AUTH "${KIBANA_URL}/api/saved_objects/dashboard/dashboard-platform-logs" \
           -H "kbn-xsrf: true" 2>/dev/null || echo "")

if echo "$existing" | grep -q '"id":"dashboard-platform-logs"'; then
    echo "ℹ️  Dashboard already exists — skipping import (delete it manually to re-import)"
    exit 0
fi

# ── Import saved objects ─────────────────────────────────────
echo "📦 Importing dashboard and visualizations..."
response=$(curl -sf -X POST $AUTH \
    "${KIBANA_URL}/api/saved_objects/_import?overwrite=true" \
    -H "kbn-xsrf: true" \
    -F "file=@${DASHBOARD_FILE}" \
    2>&1)

# Check result
if echo "$response" | grep -q '"success":true'; then
    echo "✅ Dashboard imported successfully!"
    echo ""
    echo "  🌐  Open Kibana:  http://localhost:5601"
    echo "  📊  Dashboard:    http://localhost:5601/app/dashboards#/view/dashboard-platform-logs"
    echo ""
else
    echo "⚠️  Import response: ${response}"
    exit 1
fi

# Signal healthcheck that import is complete
touch /tmp/dashboard-imported

# Keep container alive so healthcheck can report healthy
echo "✅ Dashboard import complete — container staying alive for healthcheck"
tail -f /dev/null
