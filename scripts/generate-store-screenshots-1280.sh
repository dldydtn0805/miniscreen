#!/bin/zsh

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
OUT_DIR="$ROOT_DIR/docs/images/store-screenshots-1280"
TEMPLATE_PATH="$ROOT_DIR/docs/store-shot-template/index.html"
CHROME_BIN="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

mkdir -p "$OUT_DIR"

shots=(
  "overview"
  "search"
  "bookmarks"
  "modes"
  "workflow"
)

for shot in "${shots[@]}"; do
  USER_DATA_DIR="$(mktemp -d "${TMPDIR:-/tmp}/miniscreen-store-shot-${shot}.XXXXXX")"

  if "$CHROME_BIN" \
    --headless=new \
    --disable-gpu \
    --hide-scrollbars \
    --window-size=1280,800 \
    --force-device-scale-factor=1 \
    --virtual-time-budget=1500 \
    --user-data-dir="$USER_DATA_DIR" \
    --screenshot="$OUT_DIR/${shot}.png" \
    "file://$TEMPLATE_PATH?shot=$shot" >/dev/null 2>&1; then
    rm -rf "$USER_DATA_DIR"
  else
    status=$?
    rm -rf "$USER_DATA_DIR"
    exit "$status"
  fi
done

echo "Generated 1280x800 store screenshots in $OUT_DIR"
