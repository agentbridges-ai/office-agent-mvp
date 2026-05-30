# x2t WASM Build Pipeline

Self-contained Docker build for the ONLYOFFICE x2t WASM converter used in this project.

## Quick Start

```bash
# 1. Clone ONLYOFFICE core source (one-time, ~686MB)
./scripts/clone-core.sh

# 2. Build (1-2 hours, 28 library stages + Emscripten link)
docker build --target output -o build .

# 3. Verify bit-identical output against committed artifacts
./scripts/verify-artifact.sh build/
```

## Output

| File | Size | sha256 |
|------|------|--------|
| x2t.js | 133 KB | e0abb599... |
| x2t.wasm | 35 MB | e166c252... |
| x2t.wasm.br | 6.5 MB | 8dfeb638... |
| x2t.wasm.gz | 7.1 MB | 85b25f73... |

## Dependencies

- Docker with BuildKit enabled
- ONLYOFFICE/core at v9.3.0.140 (cloned by `clone-core.sh`)
- ONLYOFFICE/build_tools at v9.3.0.140 (cloned inside Dockerfile)
- emscripten/emsdk:4.0.11 Docker image

## Known Limitations

- `build_tools` version mismatch: CryptPad's build used v8.3.0.91, core is v9.3.0.140. Artifact is bit-identical despite this.
- Fb2File and OFDFile formats are not linked in WASM.
- `gzip` output is non-deterministic (timestamps); `x2t.wasm.gz` may differ between builds.
- The Dockerfile's `fb2file` and `log-symbols` stages have broken references — these are NOT on the build→output dependency chain.

## Provenance

See [provenance.json](./provenance.json) for full build metadata, patch list, and artifact hashes.

## Related

- Upstream: [ONLYOFFICE/core](https://github.com/ONLYOFFICE/core) v9.3.0.140
- CryptPad baseline: [onlyoffice-x2t-wasm v9.3.0+0](https://github.com/cryptpad/onlyoffice-x2t-wasm)
- Project docs: `docs/cryptpad-delta.md` (56-file change audit)
