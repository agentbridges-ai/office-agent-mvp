#!/bin/bash
set -euo pipefail

# Fetch CryptPad's modified ONLYOFFICE/core (required for WASM build).
# Vanilla ONLYOFFICE/core v9.3.0.140 does NOT build directly — it needs
# 56 file changes (6 empty stubs + build config + linker fixes).
# See sources.json and docs/cryptpad-delta.md for the full delta audit.
#
# Sources:
#   cryptpad/onlyoffice-x2t-wasm at v9.3.0+0
#     → core/ is a git subtree of ONLYOFFICE/core with WASM patches applied
#
# Usage:
#   ./scripts/clone-core.sh                          # default: CryptPad v9.3.0+0
#   CRYPTAD_REF=v9.3.0+0 ./scripts/clone-core.sh     # explicit ref
#   CORE_SOURCE=/path/to/existing ./scripts/clone-core.sh  # use local copy

CRYPTAD_REPO="${CRYPTAD_REPO:-https://github.com/cryptpad/onlyoffice-x2t-wasm.git}"
CRYPTAD_REF="${CRYPTAD_REF:-v9.3.0+0}"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
TOOLS_DIR="$(dirname "$SCRIPT_DIR")"

# If user provides a local core path, symlink it
if [ -n "${CORE_SOURCE:-}" ] && [ -d "$CORE_SOURCE" ]; then
  echo "Using local core source: $CORE_SOURCE"
  rm -rf "$TOOLS_DIR/core"
  ln -s "$CORE_SOURCE" "$TOOLS_DIR/core"
  echo "Done. core/ → $CORE_SOURCE"
  exit 0
fi

# If core already exists, skip
if [ -d "$TOOLS_DIR/core" ]; then
  echo "core/ already exists, skipping clone."
  echo "Remove it or set CORE_SOURCE to use a different core."
  exit 0
fi

# Clone CryptPad's repo and extract the core subtree
echo "Cloning $CRYPTAD_REPO at $CRYPTAD_REF..."
TMPDIR=$(mktemp -d)
trap "rm -rf $TMPDIR" EXIT

git clone --depth=1 --branch "$CRYPTAD_REF" "$CRYPTAD_REPO" "$TMPDIR/repo"
mv "$TMPDIR/repo/core" "$TOOLS_DIR/core"
rm -rf "$TMPDIR"

echo "Done. CryptPad modified core ($(du -sh "$TOOLS_DIR/core" | cut -f1)) at $TOOLS_DIR/core/"
echo ""
echo "To verify the delta from upstream ONLYOFFICE/core:"
echo "  git fetch --depth=1 https://github.com/ONLYOFFICE/core.git v9.3.0.140"
echo "  git diff FETCH_HEAD HEAD:core  # from CryptPad repo root"
