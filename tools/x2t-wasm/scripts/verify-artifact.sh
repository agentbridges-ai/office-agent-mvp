#!/bin/bash
set -euo pipefail

# Verify that a fresh x2t build produces bit-identical artifacts to the committed ones.
# Usage: ./scripts/verify-artifact.sh [build-output-dir]

BUILD_DIR="${1:-build}"
PUBLIC_DIR="$(cd "$(dirname "$0")/../../public/wasm/x2t" && pwd)"

echo "=== x2t WASM artifact verification ==="
echo "Build output: $BUILD_DIR"
echo "Public artifacts: $PUBLIC_DIR"
echo ""

check_file() {
  local name="$1"
  local build_file="$BUILD_DIR/$name"
  local public_file="$PUBLIC_DIR/$name"

  if [ ! -f "$build_file" ]; then
    echo "MISSING: $name not found in build output"
    return 1
  fi

  local build_hash
  local public_hash
  build_hash=$(sha256sum "$build_file" | awk '{print $1}')
  public_hash=$(sha256sum "$public_file" | awk '{print $1}')

  if [ "$build_hash" = "$public_hash" ]; then
    echo "MATCH: $name ($build_hash)"
    return 0
  else
    echo "MISMATCH: $name"
    echo "  build:  $build_hash"
    echo "  public: $public_hash"
    return 1
  fi
}

PASS=0
FAIL=0

for name in x2t.js x2t.wasm x2t.wasm.br x2t.wasm.gz; do
  if check_file "$name"; then
    PASS=$((PASS + 1))
  else
    FAIL=$((FAIL + 1))
  fi
done

echo ""
echo "Results: $PASS match, $FAIL mismatch"
if [ "$FAIL" -gt 0 ]; then
  echo "NOTE: gzip output is non-deterministic (timestamps in header)."
  echo "x2t.wasm.gz mismatch is expected unless --no-name --best flags match exactly."
fi
