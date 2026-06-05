# x2t WASM Build Provenance

## Source

| Artifact | Source | Identifier |
| --- | --- | --- |
| Upstream core | `ONLYOFFICE/core` | tag `v9.3.0.140`, commit `269dd9b8` |
| CryptPad reference | `cryptpad/onlyoffice-x2t-wasm` | tag `v9.3.0+0`, commit `96886ff` |
| Build Dockerfile | `/tmp/cryptpad-x2t/Dockerfile` | 779 lines, 28 library stages |
| Fix: emsdk | Pre-built `emscripten/emsdk:4.0.11` via `docker.1ms.run` | Replaced `git clone + ./emsdk install` |
| Fix: locateFile | `pre-js.js` `document.currentScript.getAttribute("src")` → `prefix+path` | Required for `scriptOnLoad` context |

## Build Command

```bash
cd /tmp/cryptpad-x2t
docker build --progress=plain --target output -o build .
```

## Build Environment

| Component | Version/Spec |
| --- | --- |
| Base image | `ubuntu:22.04` |
| Emscripten | `emsdk 4.0.11` |
| build_tools | `ONLYOFFICE/build_tools v9.3.0.140` |
| Compiler | `emcc`/`em++` via qmake6 |
| Flags | `-sUSE_ICU=1 -sALLOW_MEMORY_GROWTH -sUSE_CLOSURE_COMPILER=1 -sERROR_ON_UNDEFINED_SYMBOLS=0` |
| Build time | ~1h10m |
| Output size | `x2t.wasm` 35,985,703 bytes; `x2t.wasm.br` 6,806,135 bytes; `x2t.js` 135,941 bytes |

## Artifact Hashes

| File | Size | sha256 |
| --- | ---: | --- |
| `public/wasm/x2t/x2t.wasm` | 35985703 | `e166c252adbd603e5e3abf65cf3b37bf0424a33edd9ae1b4b791176ce7fd2caa` |
| `public/wasm/x2t/x2t.wasm.br` | 6806135 | `8dfeb638225fff59547eaca1ae6d24e0123aa90a2688c73d246e2ba1127d689e` |
| `public/wasm/x2t/x2t.wasm.gz` | 9629242 | `85b25f7372ab9ff8252cda945d8290d92d8ace587cbde0248586326b034f1713` |
| `public/wasm/x2t/x2t.js` | 135767 | `e0abb59942bf4bf3734e04208107e88aeab243f26ca4b689b4c193bc96e58eeb` |

## Bit-Identical Verification

Self-built artifacts match CryptPad v9.3.0+0 pre-built artifacts byte-for-byte:
- `x2t.wasm`: `e166c252adb...` (matches)
- `x2t.wasm.br`: `8dfeb638225f...` (matches)
- `x2t.js` (before `locateFile` patch): `e37c43699e6f...` (matches)

## Rebuild Steps

1. Clone CryptPad `onlyoffice-x2t-wasm` (commit `96886ff`)
2. Apply Dockerfile fix: replace `git clone emsdk + ./emsdk install` with `COPY --from=emscripten/emsdk:4.0.11`
3. `docker build --target output -o build .`
4. Apply `locateFile` patch: replace `pre-js.js` `document.currentScript.getAttribute("src")` URL construction with `return prefix+path`
5. Copy to `public/wasm/x2t/`, generate `.gz` with `gzip -9`
6. Run 11-scenario smoke

## Known Trim

| Library | Status | Impact |
| --- | --- | --- |
| Fb2File | Not linked in X2tConverter.pri | FictionBook (FB2) format not convertible |
| OFDFile | Not linked in X2tConverter.pri | OFD format not convertible |
| doctrenderer | Empty stubs | No docbuilder/rendering (x2t-only, acceptable) |
| OpenSSL | Present | Document encryption support |
| IWork (Apple) | Present | Pages/Numbers/Keynote support |
| HwpFile | Present | HWP/HWPX support |

## Rollback

Restore old artifact files (7.x, hashes recorded in `docs/onlyoffice-9.3-upgrade-notes.md`).
Rebuild from source using this document as the build recipe.
