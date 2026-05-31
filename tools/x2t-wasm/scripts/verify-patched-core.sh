#!/bin/bash
set -euo pipefail
# Pre-build integrity check: verifies that the patched vanilla core
# contains all required WASM adapters before docker build.
#
# Usage: ./scripts/verify-patched-core.sh [path/to/core]

CORE_DIR="${1:-$(cd "$(dirname "$0")/.." && pwd)/core}"

if [ ! -d "$CORE_DIR" ]; then
  echo "ERROR: core/ not found at $CORE_DIR"
  echo "Run: ./scripts/clone-core.sh"
  exit 1
fi

FAILURES=0

check_file() { if [ ! -f "$CORE_DIR/$1" ]; then echo "  MISSING: $1"; FAILURES=$((FAILURES + 1)); fi; }
check_contains() { if ! grep -q "$2" "$CORE_DIR/$1" 2>/dev/null; then echo "  MISMATCH: $1 ($2 not found)"; FAILURES=$((FAILURES + 1)); fi; }

echo "=== Verifying patched core at $CORE_DIR ==="

# Stubs
check_file "DesktopEditor/doctrenderer/doctrenderer_empty.cpp"
check_file "DesktopEditor/doctrenderer/docbuilder_empty.cpp"
check_file "DesktopEditor/doctrenderer/docbuilder_p_empty.cpp"
check_file "DesktopEditor/graphics/pro/js/qt/raster/pro_Graphics_empty.cpp"
check_file "DesktopEditor/graphics/pro/js/qt/raster/pro_Fonts_empty.cpp"
check_file "UnicodeConverter/UnicodeConverter_internal_empty.cpp"

# Build config patches
check_contains "X2tConverter/src/main.cpp" "main1"
check_contains "Common/3dParty/icu/icu.pri" "emscripten"
check_contains "X2tConverter/build/Qt/X2tConverter.pri" "DocFormatLib\|XlsFormatLib\|PdfFile"
check_contains "DesktopEditor/graphics/pro/freetype.pri" "duplicate"

# Optional but recommended
check_file "DesktopEditor/doctrenderer/editors.h"

echo ""

if [ "$FAILURES" -gt 0 ]; then
  echo "ERROR: $FAILURES integrity checks failed."
  echo "Patches may not have been applied correctly."
  echo "Run: ./patches/apply-all.sh $CORE_DIR"
  exit 1
fi

echo "=== Patched core integrity check passed ==="
