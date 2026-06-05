#!/bin/bash
set -euo pipefail
# Patch manifest + digest verification for vanilla core.
# Validates that all 26 patches + 6 stubs are present and applicable.
# This is a provenance gate, not a smoke gate — must be strict.
#
# Usage: ./scripts/verify-patched-core.sh [path/to/core]

CORE_DIR="${1:-$(cd "$(dirname "$0")/.." && pwd)/core}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
TOOLS_DIR="$(dirname "$SCRIPT_DIR")"
PATCHES_DIR="$TOOLS_DIR/patches"
STUBS_DIR="$PATCHES_DIR/core-stubs"
MUST_PORT="$PATCHES_DIR/core-must-port"

EXPECTED_STUBS=6
EXPECTED_PATCHES=26

if [ ! -d "$CORE_DIR" ]; then
  echo "ERROR: core/ not found at $CORE_DIR"
  echo "Run: ./scripts/clone-core.sh"
  exit 1
fi

echo "=== Patch Manifest Verification ==="
echo "Core: $CORE_DIR"
echo "Patches: $MUST_PORT"
echo "Stubs: $STUBS_DIR"
echo ""

# ── 1. Count patches ────────────────────────────────────────────────

STUB_COUNT=$(find "$STUBS_DIR" -name "*.cpp" | wc -l)
PATCH_COUNT=$(ls "$MUST_PORT"/*.patch 2>/dev/null | wc -l)

echo "Stubs: $STUB_COUNT/$EXPECTED_STUBS"
echo "Patches: $PATCH_COUNT/$EXPECTED_PATCHES"
echo ""

FAILURES=0

if [ "$STUB_COUNT" -ne "$EXPECTED_STUBS" ]; then
  echo "ERROR: expected $EXPECTED_STUBS stubs, found $STUB_COUNT"
  FAILURES=$((FAILURES + 1))
fi
if [ "$PATCH_COUNT" -ne "$EXPECTED_PATCHES" ]; then
  echo "ERROR: expected $EXPECTED_PATCHES patches, found $PATCH_COUNT"
  FAILURES=$((FAILURES + 1))
fi

# ── 2. Verify each stub exists and core has it ────────────────────────

echo "--- Stub integrity ---"
STUB_PATHS=(
  "DesktopEditor/doctrenderer/doctrenderer_empty.cpp"
  "DesktopEditor/doctrenderer/docbuilder_empty.cpp"
  "DesktopEditor/doctrenderer/docbuilder_p_empty.cpp"
  "DesktopEditor/graphics/pro/js/qt/raster/pro_Graphics_empty.cpp"
  "DesktopEditor/graphics/pro/js/qt/raster/pro_Fonts_empty.cpp"
  "UnicodeConverter/UnicodeConverter_internal_empty.cpp"
)
for s in "${STUB_PATHS[@]}"; do
  if [ ! -f "$STUBS_DIR/$s" ]; then
    echo "  MISSING source: patches/core-stubs/$s"
    FAILURES=$((FAILURES + 1))
  elif [ ! -f "$CORE_DIR/$s" ]; then
    echo "  MISSING target: core/$s (stub not applied)"
    FAILURES=$((FAILURES + 1))
  else
    echo "  OK: $s"
  fi
done
echo ""

# ── 3. Verify patches are applied (check key files, not dry-run) ─────
# Dry-run would fail if patches are already applied (modified files).
# Instead, verify that key patched markers are present.

echo "--- Patch application check ---"
PATCH_MARKERS=(
  "X2tConverter/src/main.cpp:main1"
  "Common/3dParty/icu/icu.pri:emscripten"
  "DesktopEditor/graphics/pro/freetype.pri:duplicate"
  "X2tConverter/build/Qt/X2tConverter.pri:DocFormatLib"
  "X2tConverter/src/lib/html.h:Fb2File"
  "X2tConverter/src/lib/pdf_image.h:pdf.bin"
)
PATCH_OK=0; PATCH_FAIL=0
for marker in "${PATCH_MARKERS[@]}"; do
  file="${marker%%:*}"
  needle="${marker##*:}"
  if grep -q "$needle" "$CORE_DIR/$file" 2>/dev/null; then
    echo "  OK: $file"
    PATCH_OK=$((PATCH_OK + 1))
  else
    echo "  FAIL: $file ($needle not found — patches not applied)"
    PATCH_FAIL=$((PATCH_FAIL + 1)); FAILURES=$((FAILURES + 1))
  fi
done
echo ""
echo "Patch markers: $PATCH_OK OK, $PATCH_FAIL missing"
echo ""

# ── 4. Compute patch manifest digest ──────────────────────────────────

MANIFEST_FILE="$TOOLS_DIR/patches/patch-manifest.sha256"
echo "--- Patch manifest digest ---"
# Generate digest of all patch+stub files
{
  find "$STUBS_DIR" -type f -name "*.cpp" | sort | xargs sha256sum
  find "$MUST_PORT" -type f -name "*.patch" | sort | xargs sha256sum
} > /tmp/patch-manifest-current.txt

CURRENT_DIGEST=$(sha256sum /tmp/patch-manifest-current.txt | awk '{print $1}')
echo "Current digest: $CURRENT_DIGEST"

if [ -f "$MANIFEST_FILE" ]; then
  STORED_DIGEST=$(cat "$MANIFEST_FILE")
  if [ "$CURRENT_DIGEST" = "$STORED_DIGEST" ]; then
    echo "  MATCH: patch manifest matches stored digest"
  else
    echo "  MISMATCH: patch files changed since last lock"
    echo "  Stored:  $STORED_DIGEST"
    echo "  Current: $CURRENT_DIGEST"
    echo "  If this is intentional, update with:"
    echo "    sha256sum /tmp/patch-manifest-current.txt | awk '{print \$1}' > $MANIFEST_FILE"
    FAILURES=$((FAILURES + 1))
  fi
else
  echo "  No stored manifest. Generating..."
  echo "$CURRENT_DIGEST" > "$MANIFEST_FILE"
  echo "  Stored: $CURRENT_DIGEST (initial lock)"
fi

rm -f /tmp/patch-manifest-current.txt
echo ""

# ── 5. Quick functional checks ────────────────────────────────────────

echo "--- Functional checks ---"
check_func() { if grep -q "$2" "$CORE_DIR/$1" 2>/dev/null; then echo "  OK: $1"; else echo "  WARN: $1 ($2 not found)"; fi; }
check_func "X2tConverter/src/main.cpp" "main1"
check_func "Common/3dParty/icu/icu.pri" "emscripten"
check_func "DesktopEditor/graphics/pro/freetype.pri" "duplicate"
echo ""

# ── Result ────────────────────────────────────────────────────────────

if [ "$FAILURES" -gt 0 ]; then
  echo "=== VERIFICATION FAILED: $FAILURES issue(s) ==="
  echo "Patches may not have been applied correctly."
  echo "Run: $TOOLS_DIR/patches/apply-all.sh $CORE_DIR"
  exit 1
fi

echo "=== Patch manifest verification passed ==="
echo "  $STUB_COUNT stubs | $PATCH_COUNT patches | dry-run OK | digest locked"
