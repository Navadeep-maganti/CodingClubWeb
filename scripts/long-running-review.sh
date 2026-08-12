#!/usr/bin/env bash
# =============================================================
# Long-Running Review & Fix Loop
# =============================================================
# Runs the review-loop.sh script every 10 minutes for 15 hours.
# Total: 90 iterations.
#
# Usage:
#   nohup bash scripts/long-running-review.sh > review-daemon.log 2>&1 &
#
# To stop:
#   pkill -f long-running-review.sh
# =============================================================

INTERVAL=600  # 10 minutes in seconds
DURATION=54000  # 15 hours in seconds (90 iterations)
START=$(date +%s)
ITER=0

echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Starting long-running review loop"
echo "Interval: ${INTERVAL}s (10 min) | Duration: ${DURATION}s (15 hours) | Max iterations: 90"
echo ""

while [ $(( $(date +%s) - START )) -lt $DURATION ]; do
  ITER=$((ITER + 1))
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] === Iteration $ITER/90 ==="

  # Run the review
  bash /home/z/my-project/scripts/review-loop.sh || true

  # Sleep for the interval (but check if we should stop)
  SLEEP_START=$(date +%s)
  while [ $(( $(date +%s) - SLEEP_START )) -lt $INTERVAL ]; do
    # Check if we've exceeded total duration
    if [ $(( $(date +%s) - START )) -ge $DURATION ]; then
      break
    fi
    sleep 30
  done
done

echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Long-running review loop complete after $ITER iterations."
