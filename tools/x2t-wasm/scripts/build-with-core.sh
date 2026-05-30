#!/bin/bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
TOOLS_DIR="$(dirname "$SCRIPT_DIR")"
CRYPTAD_CORE="${CRYPTAD_CORE:-/tmp/cryptpad-x2t/core}"

cd "$TOOLS_DIR"

# Ensure CryptPad core is available
if [ ! -f "$CRYPTAD_CORE/DesktopEditor/doctrenderer/doctrenderer_empty.cpp" ]; then
  echo "ERROR: CryptPad core not found at $CRYPTAD_CORE"
  echo "The Dockerfile requires CryptPad's modified core (with empty stubs), not vanilla ONLYOFFICE/core."
  echo "Set CRYPTAD_CORE env var or ensure /tmp/cryptpad-x2t/core exists."
  exit 1
fi

# Remove any stale core link/dir
rm -rf core

echo "Copying CryptPad core into build context..."
cp -a "$CRYPTAD_CORE" core
echo "Core ready ($(du -sh core | cut -f1))"

# Build
echo "Starting docker build..."
docker build --target output -o build .

# Cleanup
rm -rf core
echo "Build complete. Artifacts in build/"
