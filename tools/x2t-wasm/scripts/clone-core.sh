#!/bin/bash
set -euo pipefail

# Clone ONLYOFFICE/core (vanilla) and apply WASM patches.
# Default: vanilla v9.3.0.140 + apply-all.sh.
# Fallback: X2T_CORE_MODE=cryptpad uses CryptPad's modified core.
#
# Usage:
#   ./scripts/clone-core.sh                          # vanilla (default)
#   X2T_CORE_MODE=cryptpad ./scripts/clone-core.sh    # CryptPad fallback

ONLYOFFICE_CORE_REPO="${ONLYOFFICE_CORE_REPO:-https://github.com/ONLYOFFICE/core.git}"
ONLYOFFICE_CORE_REF="${ONLYOFFICE_CORE_REF:-v9.3.0.140}"
X2T_CORE_MODE="${X2T_CORE_MODE:-vanilla}"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
TOOLS_DIR="$(dirname "$SCRIPT_DIR")"

if [ -d "$TOOLS_DIR/core" ]; then
  echo "core/ already exists. Remove it to re-clone."
  exit 0
fi

if [ "$X2T_CORE_MODE" = "cryptpad" ]; then
  echo "=== Mode: CryptPad fallback ==="
  CRYPTAD_REPO="https://github.com/cryptpad/onlyoffice-x2t-wasm.git"
  CRYPTAD_REF="v9.3.0+0"
  TMPDIR=$(mktemp -d)
  trap "rm -rf $TMPDIR" EXIT
  git clone --depth=1 --branch "$CRYPTAD_REF" "$CRYPTAD_REPO" "$TMPDIR/repo"
  mv "$TMPDIR/repo/core" "$TOOLS_DIR/core"
  echo "Done. CryptPad modified core at $TOOLS_DIR/core/"
  exit 0
fi

echo "=== Mode: vanilla ONLYOFFICE/core + patches (default) ==="
echo "Cloning $ONLYOFFICE_CORE_REPO at $ONLYOFFICE_CORE_REF..."
git clone --depth=1 --branch "$ONLYOFFICE_CORE_REF" "$ONLYOFFICE_CORE_REPO" "$TOOLS_DIR/core"
echo "Vanilla core cloned ($(du -sh "$TOOLS_DIR/core" | cut -f1))."

echo "Applying WASM patches..."
"$TOOLS_DIR/patches/apply-all.sh" "$TOOLS_DIR/core"

echo ""
echo "=== Core ready: vanilla ONLYOFFICE/core v9.3.0.140 + 32 patches ==="
echo "Ready for: ./scripts/build-with-core.sh"
