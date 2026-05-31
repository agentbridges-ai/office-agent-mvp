#!/bin/bash
set -euo pipefail

# Canonical x2t WASM build script.
# Default: vanilla ONLYOFFICE/core v9.3.0.140 + repo-owned patches/stubs.
# Fallback: X2T_CORE_MODE=cryptpad uses CryptPad modified core.
#
# Usage:
#   ./scripts/clone-core.sh && ./scripts/build-with-core.sh   # vanilla (default)
#   X2T_CORE_MODE=cryptpad ./scripts/build-with-core.sh        # CryptPad fallback
#   SKIP_VERIFY=1 ./scripts/build-with-core.sh                 # build only

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
TOOLS_DIR="$(dirname "$SCRIPT_DIR")"
X2T_CORE_MODE="${X2T_CORE_MODE:-vanilla}"
CRYPTAD_CONTEXT="${CRYPTAD_CONTEXT:-/tmp/cryptpad-x2t}"

# ── Step 1: Ensure core is available ───────────────────────────────

if [ "$X2T_CORE_MODE" = "cryptpad" ]; then
  echo "=== Mode: CryptPad fallback ==="
  if [ ! -d "$CRYPTAD_CONTEXT/core" ]; then
    echo "ERROR: CryptPad context not found at $CRYPTAD_CONTEXT"
    echo "Clone cryptpad/onlyoffice-x2t-wasm first, or use vanilla default:"
    echo "  X2T_CORE_MODE=vanilla ./scripts/build-with-core.sh"
    exit 1
  fi
  BUILD_CONTEXT="$CRYPTAD_CONTEXT"
  USE_DIRECT_CONTEXT=true
else
  echo "=== Mode: vanilla ONLYOFFICE/core + patches (default) ==="
  if [ ! -d "$TOOLS_DIR/core" ]; then
    echo "core/ not found. Running clone-core.sh..."
    "$SCRIPT_DIR/clone-core.sh"
  fi

  # Pre-build integrity check
  echo "Verifying patched core..."
  "$SCRIPT_DIR/verify-patched-core.sh" "$TOOLS_DIR/core"

  # Ensure test.js exists (Dockerfile step 45)
  if [ ! -f "$TOOLS_DIR/test.js" ]; then
    if [ -f "$CRYPTAD_CONTEXT/test.js" ]; then
      cp "$CRYPTAD_CONTEXT/test.js" "$TOOLS_DIR/"
    else
      touch "$TOOLS_DIR/test.js"
    fi
  fi
  BUILD_CONTEXT="$TOOLS_DIR"
  USE_DIRECT_CONTEXT=false
fi

DOCKERFILE="$TOOLS_DIR/Dockerfile"

# ── Step 2: Docker build ───────────────────────────────────────────

echo ""
echo "=== Starting docker build ==="
echo "Dockerfile: $DOCKERFILE"
echo "Context:    $BUILD_CONTEXT"
echo ""

docker build \
  --file "$DOCKERFILE" \
  --target output \
  -o "$TOOLS_DIR/build" \
  "$BUILD_CONTEXT"

echo ""
echo "=== Build complete ==="
ls -lh "$TOOLS_DIR/build"/x2t.* 2>/dev/null || echo "  (check $TOOLS_DIR/build/)"

# ── Step 3: Verify hashes ───────────────────────────────────────────

if [ "${SKIP_VERIFY:-0}" = "1" ]; then
  echo "Skipping verification (SKIP_VERIFY=1)"
  exit 0
fi

echo ""
echo "=== Verifying artifact hashes ==="

EXPECTED_WASM="e166c252adbd603e5e3abf65cf3b37bf0424a33edd9ae1b4b791176ce7fd2caa"
EXPECTED_BR="8dfeb638225fff59547eaca1ae6d24e0123aa90a2688c73d246e2ba1127d689e"
PASS=0; FAIL=0

check_hash() {
  local file="$1" expected="$2" label="$3"
  local actual
  actual=$(sha256sum "$TOOLS_DIR/build/$file" | awk '{print $1}')
  if [ "$actual" = "$expected" ]; then
    echo "  MATCH: $file"
    PASS=$((PASS + 1))
  else
    echo "  MISMATCH: $file"
    echo "    expected: $expected"
    echo "    actual:   $actual"
    FAIL=$((FAIL + 1))
  fi
}

check_hash "x2t.wasm" "$EXPECTED_WASM" "WASM binary"
check_hash "x2t.wasm.br" "$EXPECTED_BR" "Brotli WASM"

echo ""
echo "Results: $PASS match, $FAIL mismatch"

if [ "$FAIL" -gt 0 ]; then
  echo ""
  echo "Bit-identical verification FAILED."
  echo "This may indicate patch application issues or build environment differences."
  echo "x2t.js and x2t.wasm.gz may differ (Emscripten glue / gzip non-deterministic)."
  exit 1
fi

echo ""
echo "=== Vanilla core + patches → bit-identical x2t.wasm confirmed ==="
echo "Copy artifacts to public/wasm/x2t/ with:"
echo "  cp $TOOLS_DIR/build/x2t.wasm public/wasm/x2t/"
echo "  cp $TOOLS_DIR/build/x2t.wasm.br public/wasm/x2t/"
echo "  cp $TOOLS_DIR/build/x2t.js public/wasm/x2t/"
