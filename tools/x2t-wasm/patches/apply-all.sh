#!/bin/bash
set -euo pipefail
# Apply ALL WASM patches to a vanilla ONLYOFFICE/core tree.
# Order: stubs → auto-discovered must-port patches → harfbuzz
#
# Usage: ./patches/apply-all.sh /path/to/vanilla-core

TARGET="${1:-}"
if [ -z "$TARGET" ] || [ ! -d "$TARGET" ]; then
  echo "Usage: $0 /path/to/vanilla-core"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PATCHES_DIR="$SCRIPT_DIR"

echo "=== Applying WASM patches to $TARGET ==="
echo ""

# Step 1: Apply stub files (replace Qt-dependent implementations)
echo "--- Step 1: Applying stubs ---"
"$PATCHES_DIR/core-stubs/apply-stubs.sh" "$TARGET"

# Step 2: Auto-discover and apply all patches in core-must-port/
echo ""
echo "--- Step 2: Applying must-port patches ---"
MUST_PORT="$PATCHES_DIR/core-must-port"
APPLIED=0; SKIPPED=0; FAILED=0

# Map: patch filename prefix → target file path (for display only)
# Patches are auto-discovered; this map provides human-readable output
declare -A PATCH_MAP=()

apply_one_patch() {
  local patch_file="$1"
  local patch_name
  patch_name="$(basename "$patch_file")"

  # Find the target file by reading the +++ line from the patch header
  # Format: "+++ b/path/to/file\t2026-05-29..."
  local target_file
  target_file=$(head -5 "$patch_file" | grep '^+++' | sed 's|^+++ b/||; s|\t.*||' | head -1)

  if [ -z "$target_file" ]; then
    echo "  SKIP: $patch_name (could not determine target from patch header)"
    SKIPPED=$((SKIPPED + 1))
    return
  fi

  if [ ! -f "$TARGET/$target_file" ]; then
    echo "  SKIP: $patch_name → $target_file (not in vanilla core)"
    SKIPPED=$((SKIPPED + 1))
    return
  fi

  if patch -d "$TARGET" -p1 --dry-run < "$patch_file" > /dev/null 2>&1; then
    patch -d "$TARGET" -p1 --quiet < "$patch_file"
    echo "  OK: $target_file"
    APPLIED=$((APPLIED + 1))
  else
    echo "  FAIL: $target_file ($patch_name did not apply cleanly)"
    FAILED=$((FAILED + 1))
  fi
}

# Discover and apply all .patch files
for patch_file in "$MUST_PORT"/*.patch; do
  [ -f "$patch_file" ] || continue
  apply_one_patch "$patch_file"
done

echo ""
echo "--- Step 2 results: $APPLIED applied, $SKIPPED skipped, $FAILED failed ---"

# Step 3: Apply harfbuzz patch (if present)
echo ""
echo "--- Step 3: Applying harfbuzz patch ---"
if [ -f "$PATCHES_DIR/harfbuzz.patch" ] && [ -d "$TARGET/Common/3dParty/harfbuzz" ]; then
  if patch -d "$TARGET" -p1 --dry-run < "$PATCHES_DIR/harfbuzz.patch" > /dev/null 2>&1; then
    patch -d "$TARGET" -p1 --quiet < "$PATCHES_DIR/harfbuzz.patch"
    echo "  OK: Common/3dParty/harfbuzz"
  else
    echo "  SKIP: harfbuzz patch did not apply"
  fi
else
  echo "  SKIP: harfbuzz patch or directory not found"
fi

echo ""
echo "=== All patches applied ==="
echo "Core at $TARGET is ready for docker build."
