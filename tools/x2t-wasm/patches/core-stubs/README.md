# Core Stubs — WASM Platform Adapters

These 6 files replace ONLYOFFICE core implementations that **cannot compile to WebAssembly**
because they depend on Qt GUI, platform-specific APIs, or server-only functionality.

## Why Stubs Are Needed

| Stub | Replaces | Lines | Why |
|------|----------|-------|-----|
| `doctrenderer_empty.cpp` | Full doctrenderer (Qt GUI rendering) | 827 | Qt raster/embed unavailable in WASM. x2t only needs conversion, not rendering. |
| `docbuilder_empty.cpp` | Full docbuilder API | stub | Document Builder is a server-side feature. Not needed for browser-local conversion. |
| `docbuilder_p_empty.cpp` | Docbuilder internal | stub | Same as above — internal implementation detail. |
| `pro_Graphics_empty.cpp` | Qt raster graphics engine | stub | Qt `QPainter`/`QImage` unavailable in WASM. Emscripten provides Canvas/WebGL alternatives but x2t doesn't use them. |
| `pro_Fonts_empty.cpp` | Qt font rendering | stub | Qt `QFont`/`QFontMetrics` unavailable. Font rendering handled by Emscripten freetype. |
| `UnicodeConverter_internal_empty.cpp` | Platform Unicode conversion | stub | Emscripten provides ICU via `-sUSE_ICU=1`. Internal converter would conflict. |

## Source

Extracted from `cryptpad/onlyoffice-x2t-wasm` v9.3.0+0 (`core/` subtree).
License: AGPL-3.0 (compatible with this project).

CryptPad's core is a git subtree of `ONLYOFFICE/core` v9.3.0.140 with these stubs
and other WASM-adaptation changes applied. Full delta audit: `docs/cryptpad-delta.md`.

## How to Apply

```bash
# From tools/x2t-wasm/
./patches/core-stubs/apply-stubs.sh /path/to/vanilla-core
```

This copies the 6 stubs into the vanilla core tree, overwriting the original
Qt-dependent implementations. After applying, the core is ready for `docker build`.

## Long-term Plan (R3-远期)

These stubs are Step 1 of eliminating the CryptPad core dependency.
Remaining steps:

- **Step 2**: Extract 14 must-port build config changes as `.patch` files
  (`.pri`/`.pro` adjustments for Emscripten toolchain, ICU, freetype dedup)
- **Step 3**: Review 4 risk-needs-review behavioral changes
  (HTML conversion, PDF image, linker flags, binary format parsing)
- **Step 4**: Update `clone-core.sh` to fetch vanilla core + apply all patches
  → Fully independent of CryptPad fork

At that point, `tools/x2t-wasm/` can build x2t from vanilla ONLYOFFICE/core source
with no external fork dependency.
