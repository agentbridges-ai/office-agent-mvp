#!/bin/bash
set -euo pipefail

# Canonical x2t WASM build script.
#
# The Dockerfile requires CryptPad's modified ONLYOFFICE/core.
# This script ensures the core source is available, builds, and verifies.
#
# Usage:
#   ./scripts/build-with-core.sh              # build + verify
#   CORE_SOURCE=/tmp/cryptpad-x2t/core ./scripts/build-with-core.sh  # use local
#   SKIP_VERIFY=1 ./scripts/build-with-core.sh  # build only
#
# Prerequisites:
#   - Docker with BuildKit
#   - CryptPad's modified core (see sources.json)
#     Either: set CORE_SOURCE to a local copy
#     Or:     run ./scripts/clone-core.sh first

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
TOOLS_DIR="$(dirname "$SCRIPT_DIR")"
CORE_SOURCE="${CORE_SOURCE:-}"
CRYPTAD_CONTEXT="${CRYPTAD_CONTEXT:-/tmp/cryptpad-x2t}"

# ── Step 1: Ensure core is available ───────────────────────────────

if [ -n "$CORE_SOURCE" ] && [ -d "$CORE_SOURCE" ]; then
  echo "Using CORE_SOURCE=$CORE_SOURCE"
  rm -rf "$TOOLS_DIR/core"
  cp -a "$CORE_SOURCE" "$TOOLS_DIR/core"
elif [ -d "$CRYPTAD_CONTEXT/core" ]; then
  echo "Using CryptPad context: $CRYPTAD_CONTEXT"
  # Fast path: build from the CryptPad checkout directly
  BUILD_CONTEXT="$CRYPTAD_CONTEXT"
  USE_DIRECT_CONTEXT=true
elif [ -d "$TOOLS_DIR/core" ]; then
  echo "Using existing tools/x2t-wasm/core/"
else
  echo "ERROR: No core source found."
  echo ""
  echo "Options:"
  echo "  1. Run: ./scripts/clone-core.sh"
  echo "  2. Set CORE_SOURCE=/path/to/cryptpad-x2t/core"
  echo "  3. Set CRYPTAD_CONTEXT=/path/to/cryptpad-x2t"
  echo ""
  echo "See sources.json for why CryptPad's modified core is required."
  exit 1
fi

# ── Step 2: Prepare build context ──────────────────────────────────

if [ "${USE_DIRECT_CONTEXT:-false}" = "true" ]; then
  # Build from CryptPad checkout — all files already in place
  echo "Building from direct context: $BUILD_CONTEXT"
  DOCKERFILE="$TOOLS_DIR/Dockerfile"
  CONTEXT="$BUILD_CONTEXT"
else
  # Build from tools/x2t-wasm/ — need test.js (Dockerfile step 45)
  cd "$TOOLS_DIR"
  if [ ! -f test.js ]; then
    if [ -f "$CRYPTAD_CONTEXT/test.js" ]; then
      cp "$CRYPTAD_CONTEXT/test.js" .
    else
      touch test.js  # empty fallback
    fi
  fi
  DOCKERFILE="$TOOLS_DIR/Dockerfile"
  CONTEXT="$TOOLS_DIR"
fi

# ── Step 3: Docker build ───────────────────────────────────────────

echo ""
echo "=== Starting docker build ==="
echo "Dockerfile: $DOCKERFILE"
echo "Context:    $CONTEXT"
echo ""

docker build \
  --file "$DOCKERFILE" \
  --target output \
  -o "$TOOLS_DIR/build" \
  "$CONTEXT"

echo ""
echo "=== Build complete ==="
echo "Artifacts:"
ls -lh "$TOOLS_DIR/build"/x2t.* 2>/dev/null || echo "  (check $TOOLS_DIR/build/)"

# ── Step 4: Verify (unless skipped) ─────────────────────────────────

if [ "${SKIP_VERIFY:-0}" = "1" ]; then
  echo "Skipping verification (SKIP_VERIFY=1)"
  exit 0
fi

echo ""
echo "=== Verifying artifacts ==="
PUBLIC_DIR="$(cd "$TOOLS_DIR/../../public/wasm/x2t" && pwd)"
PASS=0; FAIL=0

for name in x2t.js x2t.wasm x2t.wasm.br x2t.wasm.gz; do
  if [ ! -f "$TOOLS_DIR/build/$name" ]; then continue; fi
  build_hash=$(sha256sum "$TOOLS_DIR/build/$name" | awk '{print $1}')
  public_hash=$(sha256sum "$PUBLIC_DIR/$name" 2>/dev/null | awk '{print $1}')
  if [ "$build_hash" = "$public_hash" ]; then
    echo "  MATCH: $name"
    PASS=$((PASS + 1))
  else
    echo "  DIFF:  $name (build: ${build_hash:0:16}..., public: ${public_hash:0:16}...)"
    FAIL=$((FAIL + 1))
  fi
done

echo ""
echo "Results: $PASS match, $FAIL mismatch"
if [ "$FAIL" -gt 0 ]; then
  echo ""
  echo "x2t.wasm/x2t.wasm.br should be bit-identical."
  echo "x2t.js may differ (Emscripten JS glue is non-deterministic)."
  echo "x2t.wasm.gz may differ (gzip timestamp in header)."
  echo ""
  echo "See provenance.json for expected hashes."
fi

# ── Step 5: Cleanup temp core copy ──────────────────────────────────

if [ "${USE_DIRECT_CONTEXT:-false}" != "true" ] && [ -n "${CORE_SOURCE:-}" ]; then
  rm -rf "$TOOLS_DIR/core"
fi
