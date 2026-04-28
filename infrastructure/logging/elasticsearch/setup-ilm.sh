#!/bin/sh
# ──────────────────────────────────────────────────────────────
#  Elasticsearch ILM + Index Template Bootstrap
#  Sets up log retention (delete after 30 days) and applies it
#  to the test-* index pattern used by Logstash.
# ──────────────────────────────────────────────────────────────
set -e

ES_URL="${ES_URL:-http://elasticsearch:9200}"
ES_USER="${ES_USER:-elastic}"
ES_PASS="${ES_PASS:-changeme}"
MAX_RETRIES=40
RETRY_INTERVAL=5

AUTH=""
if [ -n "$ES_USER" ] && [ -n "$ES_PASS" ]; then
    AUTH="-u ${ES_USER}:${ES_PASS}"
fi

echo "⏳ Waiting for Elasticsearch..."
attempt=0
while [ $attempt -lt $MAX_RETRIES ]; do
    attempt=$((attempt + 1))
    code=$(curl -sf -o /dev/null -w "%{http_code}" $AUTH "${ES_URL}/_cluster/health" 2>/dev/null || echo "000")
    if [ "$code" = "200" ]; then
        echo "✅ Elasticsearch ready (attempt ${attempt})"
        break
    fi
    echo "   attempt ${attempt}/${MAX_RETRIES} — HTTP ${code}"
    sleep $RETRY_INTERVAL
done

if [ "$code" != "200" ]; then
    echo "❌ Elasticsearch not ready — aborting"
    exit 1
fi

# ── 0. Set kibana_system password ────────────────────────────
echo ""
echo "🔐 Setting kibana_system user password..."
curl -sf -X POST $AUTH "${ES_URL}/_security/user/kibana_system/_password" \
  -H "Content-Type: application/json" \
  -d "{\"password\": \"${ES_PASS}\"}" && echo ""
echo "✅ kibana_system password set"

# ── 1. Create ILM Policy ────────────────────────────────────
echo ""
echo "📋 Creating ILM policy 'logs-retention-policy'..."
curl -sf -X PUT $AUTH "${ES_URL}/_ilm/policy/logs-retention-policy" \
  -H "Content-Type: application/json" \
  -d '{
    "policy": {
      "phases": {
        "hot": {
          "min_age": "0ms",
          "actions": {
            "rollover": {
              "max_size": "1gb",
              "max_age": "1d"
            },
            "set_priority": { "priority": 100 }
          }
        },
        "warm": {
          "min_age": "7d",
          "actions": {
            "shrink": { "number_of_shards": 1 },
            "forcemerge": { "max_num_segments": 1 },
            "set_priority": { "priority": 50 }
          }
        },
        "delete": {
          "min_age": "30d",
          "actions": {
            "delete": {}
          }
        }
      }
    }
  }' && echo ""
echo "✅ ILM policy created"

# ── 2. Create Index Template with ILM ───────────────────────
echo ""
echo "📋 Creating index template 'test-logs-template'..."
curl -sf -X PUT $AUTH "${ES_URL}/_index_template/test-logs-template" \
  -H "Content-Type: application/json" \
  -d '{
    "index_patterns": ["test-*"],
    "template": {
      "settings": {
        "index.lifecycle.name": "logs-retention-policy",
        "number_of_shards": 1,
        "number_of_replicas": 0
      }
    },
    "priority": 100
  }' && echo ""
echo "✅ Index template created"

echo ""
echo "══════════════════════════════════════════════"
echo "  Log Retention Policy Summary:"
echo "    Hot phase:    0-1 day  (rollover at 1GB or 1d)"
echo "    Warm phase:   7 days   (shrink + force-merge)"
echo "    Delete phase: 30 days  (auto-delete old logs)"
echo "══════════════════════════════════════════════"

# Signal healthcheck that setup is complete
touch /tmp/ilm-setup-done

# Keep container alive so healthcheck can report healthy
echo "✅ ILM setup complete — container staying alive for healthcheck"
tail -f /dev/null
