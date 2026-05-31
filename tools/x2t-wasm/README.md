# x2t WASM Build Pipeline

Docker-based reproducible build for the ONLYOFFICE x2t WebAssembly converter.

## Quick Start

```bash
# Default: vanilla ONLYOFFICE/core v9.3.0.140 + repo-owned patches
./scripts/clone-core.sh
./scripts/build-with-core.sh

# Fallback: CryptPad modified core
X2T_CORE_MODE=cryptpad ./scripts/clone-core.sh
X2T_CORE_MODE=cryptpad ./scripts/build-with-core.sh
```

## Why Patches Are Needed

The Dockerfile compiles ONLYOFFICE's C++ codebase to WebAssembly using Emscripten.
**Vanilla `ONLYOFFICE/core` v9.3.0.140 needs 32 patches (26 `.patch` + 6 stubs)**
to compile for WASM:

1. **Qt dependencies**: doctrenderer/graphics/fonts reference Qt classes not available in WASM. CryptPad provides 6 empty stubs (1138 lines total) that implement the required API surfaces as no-ops.
2. **Platform code**: Memory limits (`rlimit`), Windows version info, ICU linking — all need WASM-specific adjustments.
3. **Build configuration**: 14 `must-port` changes to `.pri`/`.pro` files for the Emscripten toolchain.

Full audit: [`docs/cryptpad-delta.md`](../../docs/cryptpad-delta.md) — 56 files changed, classified by category.

## Source Provenance

```
ONLYOFFICE/core v9.3.0.140 (vanilla)
        │
        ├── git subtree ──→ cryptpad/onlyoffice-x2t-wasm v9.3.0+0
        │                        │
        │                  56 WASM-adaptation changes
        │                        │
        │                  6 empty stubs + 14 build config + 8 trims + 4 risk
        │                        │
        └── Dockerfile ────→ x2t.wasm (bit-identical: e166c252...)
                             x2t.js   (Emscripten glue, non-deterministic)
```

See [`sources.json`](./sources.json) for detailed provenance metadata.

## Building

### Prerequisites
- Docker with BuildKit
- ONLYOFFICE/core v9.3.0.140 (auto-cloned by clone-core.sh)
  - Default: `./scripts/clone-core.sh` → vanilla + patches (668MB clone + apply-all.sh)
  - Fallback: `X2T_CORE_MODE=cryptpad ./scripts/clone-core.sh` → CryptPad modified core

### Build Script

```bash
./scripts/build-with-core.sh
# → ensures core (auto-clone if missing), verify patches, docker build, verify hashes
```

Flags:
- `X2T_CORE_MODE=cryptpad` — use CryptPad modified core (historical fallback)
- `SKIP_VERIFY=1` — skip artifact hash verification
- `SKIP_VERIFY=1` — skip artifact verification

### Manual Docker Build

```bash
# From CryptPad checkout directory:
docker build --target output -o build .

# From tools/x2t-wasm with core/ present:
docker build --target output -o build .
```

## Output

| File | Expected sha256 | Notes |
|------|----------------|-------|
| x2t.js | non-deterministic | Emscripten JS glue (timestamps, random IDs) |
| x2t.wasm | `e166c252...` | **Bit-identical** — the critical verification target |
| x2t.wasm.br | `8dfeb638...` | **Bit-identical** |
| x2t.wasm.gz | non-deterministic | gzip header contains timestamp |

## Scripts

| Script | Purpose |
|--------|---------|
| `scripts/clone-core.sh` | Clone vanilla ONLYOFFICE/core v9.3.0.140 + apply-all.sh patches (default). X2T_CORE_MODE=cryptpad for fallback. |
| `scripts/build-with-core.sh` | Full pipeline: auto-clone if needed → verify patches → docker build → verify x2t.wasm/x2t.wasm.br hashes |
| `scripts/verify-patched-core.sh` | Pre-build integrity check: stubs present, build config patches applied |
| `scripts/verify-artifact.sh` | Cross-check build output against `public/wasm/x2t/` |

## Long-term Roadmap ✅ — Completed

Vanilla core is now the default build source. The patch series (26 `.patch` + 6 stubs) is repo-owned and auto-applied by `clone-core.sh`. CryptPad fork is retained as `X2T_CORE_MODE=cryptpad` fallback.

Remaining stretch goals:
- Extend `verify-patched-core.sh` to cover all 56 delta files (currently covers critical stubs + build config)
- Add WOFF2 font conversion to the build pipeline
- Automate upstream version bump (ONLYOFFICE/core tag → regenerate patches)

## Files

| File | Purpose |
|------|---------|
| `Dockerfile` | Multi-stage build (28 libs → Emscripten link → output) |
| `pre-js.js` | Emscripten pre-js: `Module.locateFile` patch, disable `currentScript.getAttribute` |
| `wrap-main.cpp` | C++ wrapper: `main1(char* xmlPath)` entry point for JS `ccall` |
| `embuild.sh` | Per-library Emscripten build invocation |
| `build.sh` | Original CryptPad top-level build script (reference) |
| `patches/harfbuzz.patch` | HarfBuzz text shaping fix for WASM |
| `provenance.json` | Build metadata, artifact hashes, patch list |
| `sources.json` | Source provenance — why CryptPad core is needed, delta classification |
| `test.js` | Docker smoke test (required by Dockerfile step 45) |
