#!/bin/bash
set -euo pipefail

# Apply CryptPad's WASM stubs to a vanilla ONLYOFFICE/core tree.
# These 6 files replace Qt-dependent or platform-specific implementations
# that cannot compile to WebAssembly.
#
# Usage:
#   ./apply-stubs.sh /path/to/vanilla-core
#
# The target should be a vanilla clone of ONLYOFFICE/core v9.3.0.140.

TARGET="${1:-}"
if [ -z "$TARGET" ] || [ ! -d "$TARGET" ]; then
  echo "Usage: $0 /path/to/vanilla-core"
  echo "Target must be a directory containing a vanilla ONLYOFFICE/core clone."
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
STUBS_DIR="$SCRIPT_DIR"
APPLIED=0

apply_stub() {
  local rel_path="$1"
  local src="$STUBS_DIR/$rel_path"
  local dst="$TARGET/$rel_path"

  if [ ! -f "$src" ]; then
    echo "MISSING: $src"
    return 1
  fi

  mkdir -p "$(dirname "$dst")"
  cp "$src" "$dst"
  echo "  $rel_path"
  APPLIED=$((APPLIED + 1))
}

echo "Applying WASM stubs to $TARGET..."
echo ""

apply_stub "DesktopEditor/doctrenderer/doctrenderer_empty.cpp"
apply_stub "DesktopEditor/doctrenderer/docbuilder_empty.cpp"
apply_stub "DesktopEditor/doctrenderer/docbuilder_p_empty.cpp"
apply_stub "DesktopEditor/graphics/pro/js/qt/raster/pro_Graphics_empty.cpp"
apply_stub "DesktopEditor/graphics/pro/js/qt/raster/pro_Fonts_empty.cpp"
apply_stub "UnicodeConverter/UnicodeConverter_internal_empty.cpp"

echo ""
echo "Done: $APPLIED stubs applied."
echo "Core is now ready for x2t WASM docker build."
