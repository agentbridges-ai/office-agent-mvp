#!/bin/bash
set -euo pipefail

CORE_REPO="${CORE_REPO:-https://github.com/ONLYOFFICE/core.git}"
CORE_COMMIT="${CORE_COMMIT:-v9.3.0.140}"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
TOOLS_DIR="$(dirname "$SCRIPT_DIR")"

echo "Cloning ONLYOFFICE/core at $CORE_COMMIT into $TOOLS_DIR/core/"
if [ -d "$TOOLS_DIR/core" ]; then
  echo "core/ already exists, skipping clone. Remove it to re-clone."
  exit 0
fi

git clone --depth=1 --branch "$CORE_COMMIT" "$CORE_REPO" "$TOOLS_DIR/core"
echo "Done. core/ is ready for docker build."
