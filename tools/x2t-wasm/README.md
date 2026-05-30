# x2t WASM Build Pipeline

Docker-based reproducible build for the ONLYOFFICE x2t WebAssembly converter.

## Quick Start

```bash
# Option A: Use local CryptPad checkout (fastest)
CORE_SOURCE=/tmp/cryptpad-x2t/core ./scripts/build-with-core.sh

# Option B: Clone CryptPad's modified core (network required, ~668MB)
./scripts/clone-core.sh
./scripts/build-with-core.sh
```

## Why CryptPad's Core Is Required

The Dockerfile compiles ONLYOFFICE's C++ codebase to WebAssembly using Emscripten.
**Vanilla `ONLYOFFICE/core` v9.3.0.140 does NOT build directly** for WASM due to:

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
- CryptPad's modified core (668MB)
  - From local: `CORE_SOURCE=/path/to/core`
  - From clone: `./scripts/clone-core.sh`
  - From existing CryptPad checkout: `CRYPTAD_CONTEXT=/tmp/cryptpad-x2t`

### Build Script

```bash
./scripts/build-with-core.sh
# → ensures core, runs docker build (28 libs + Emscripten link), verifies output
```

Flags:
- `CORE_SOURCE=/path` — use specific core copy
- `CRYPTAD_CONTEXT=/path` — build from existing CryptPad checkout (fastest)
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
| `scripts/clone-core.sh` | Fetch CryptPad's modified core (CryptPad v9.3.0+0 → extract core/) |
| `scripts/build-with-core.sh` | Full build pipeline: core check → docker build → verify |
| `scripts/verify-artifact.sh` | Cross-check build output against `public/wasm/x2t/` |

## Long-term Roadmap

Current: CryptPad's modified core is the build source (56 file delta from upstream).

Goal: Reduce to a minimal patch series applied to vanilla `ONLYOFFICE/core`:
1. Extract 6 stub files as independent patches (highest priority — the 827-line doctrenderer stub is the biggest)
2. Capture 14 must-port build config changes as `.patch` files
3. Review 4 risk-needs-review changes for behavioral impact
4. Eliminate CryptPad core dependency entirely

With a complete patch series, `./scripts/clone-core.sh` would fetch **vanilla** core and apply patches, removing the CryptPad fork dependency.

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
