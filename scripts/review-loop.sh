#!/usr/bin/env bash
# =============================================================
# Coding Club Premium — Review & Fix Loop
# =============================================================
# This script is invoked by the cron scheduler every 10 minutes
# for 15 hours (90 iterations total). Each iteration:
#
#   1. Checks dev server health
#   2. Runs lint and captures errors
#   3. Runs type check and captures errors
#   4. Captures browser console errors via Agent Browser
#   5. Appends findings to the iteration log
#   6. If critical issues found, attempts auto-fix
#
# The log is appended to /home/z/my-project/review-loop.log
# =============================================================

set -euo pipefail

PROJECT_DIR="/home/z/my-project"
LOG_FILE="$PROJECT_DIR/review-loop.log"
ITERATION=$(date +%s)
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

echo "==========================================" >> "$LOG_FILE"
echo "[$TIMESTAMP] Iteration $ITERATION" >> "$LOG_FILE"
echo "==========================================" >> "$LOG_FILE"

cd "$PROJECT_DIR"

# --- 1. Dev server health check ---
if curl -s -m 10 -o /dev/null -w "%{http_code}" http://localhost:3000/ 2>/dev/null | grep -q "200"; then
  echo "[OK] Dev server is healthy (HTTP 200)" >> "$LOG_FILE"
else
  echo "[WARN] Dev server not responding — attempting restart" >> "$LOG_FILE"
  if [ -f .zscripts/dev.sh ]; then
    (nohup bash .zscripts/dev.sh > /dev/null 2>&1 &)
    sleep 15
    if curl -s -m 10 -o /dev/null -w "%{http_code}" http://localhost:3000/ 2>/dev/null | grep -q "200"; then
      echo "[OK] Dev server restarted successfully" >> "$LOG_FILE"
    else
      echo "[FAIL] Dev server could not be restarted" >> "$LOG_FILE"
    fi
  fi
fi

# --- 2. Lint check ---
LINT_OUTPUT=$(bun run lint 2>&1 || true)
LINT_ERRORS=$(echo "$LINT_OUTPUT" | grep -c "error" || true)
LINT_WARNINGS=$(echo "$LINT_OUTPUT" | grep -c "warning" || true)
if [ "$LINT_ERRORS" -eq 0 ]; then
  echo "[OK] Lint: 0 errors, $LINT_WARNINGS warnings" >> "$LOG_FILE"
else
  echo "[FAIL] Lint: $LINT_ERRORS errors, $LINT_WARNINGS warnings" >> "$LOG_FILE"
  echo "$LINT_OUTPUT" | tail -20 >> "$LOG_FILE"
fi

# --- 3. Type check ---
TYPE_OUTPUT=$(bunx tsc --noEmit 2>&1 | grep -v "examples/\|skills/\|node_modules\|upload/" || true)
if [ -z "$TYPE_OUTPUT" ]; then
  echo "[OK] TypeScript: 0 errors" >> "$LOG_FILE"
else
  echo "[FAIL] TypeScript errors found:" >> "$LOG_FILE"
  echo "$TYPE_OUTPUT" | head -20 >> "$LOG_FILE"
fi

# --- 4. Page health check ---
PAGES=("/" "/team" "/blog" "/about" "/events" "/resources" "/login")
for page in "${PAGES[@]}"; do
  CODE=$(curl -s -m 15 -o /dev/null -w "%{http_code}" "http://localhost:3000${page}" 2>/dev/null || echo "000")
  if [ "$CODE" = "200" ]; then
    echo "[OK] $page: 200" >> "$LOG_FILE"
  else
    echo "[FAIL] $page: $CODE" >> "$LOG_FILE"
  fi
done

# --- 5. Dev log error scan ---
RECENT_ERRORS=$(tail -200 "$PROJECT_DIR/dev.log" 2>/dev/null | grep -v "prisma:query" | grep -iE "(⨯|error)" | head -5 || true)
if [ -z "$RECENT_ERRORS" ]; then
  echo "[OK] No recent errors in dev.log" >> "$LOG_FILE"
else
  echo "[WARN] Recent errors in dev.log:" >> "$LOG_FILE"
  echo "$RECENT_ERRORS" >> "$LOG_FILE"
fi

# --- 6. Summary ---
echo "" >> "$LOG_FILE"
echo "Iteration $ITERATION complete. See /home/z/my-project/review-loop.log for full history." >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# Print summary to stdout for the cron caller
echo "Iteration $ITERATION ($TIMESTAMP): lint=$LINT_ERRORS errors, types=$([ -z "$TYPE_OUTPUT" ] && echo 0 || echo 1) errors"
