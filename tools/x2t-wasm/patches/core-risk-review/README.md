# Risk-Needs-Review Patches

These 4 behavioral changes from CryptPad's delta require review before adoption.
Patches are stored here for analysis but NOT automatically applied by `apply-all.sh`.

## Change 1: html.h — FB2 Format Removal

**File**: `X2tConverter/src/lib/html.h` (71 lines)
**Change**: Comments out `Fb2File.h` include and `fb2docx_dir()` / `fb2docx()` functions.
**Risk**: Removes FictionBook (FB2, format 73) conversion support.
**Verdict**: **INCLUDE** (necessary companion)
**Why**: This is the companion to the linker change in `X2tConverter.pri` that removes
`Fb2File` from `ADD_DEPENDENCY`. Without this patch, the code references undefined
symbols. The alternative (keeping FB2) requires compiling and linking Fb2File, which
CryptPad intentionally excluded. FB2 is a niche Russian ebook format — acceptable loss.

## Change 2: pdf_image.h — PDF Temp Directory Fix

**File**: `X2tConverter/src/lib/pdf_image.h` (11 lines)
**Change**: PDF intermediate binary (`pdf.bin`) written to `sFileDir` (workdir) instead
of `m_sTempDir` (platform temp directory).
**Risk**: Minimal. In WASM, `m_sTempDir` may not be set or may point to an invalid path.
Writing to the workdir (`/working/`) is appropriate for the WASM virtual filesystem.
**Verdict**: **INCLUDE** (essential WASM fix)
**Why**: Without this, PDF conversion would fail in WASM due to missing temp directory.

## Change 3: X2tConverter.pri — Linker Dependency Reduction

**File**: `X2tConverter/build/Qt/X2tConverter.pri` (17 lines)
**Change**: Removes `Fb2File`, `OFDFile`, and `StarMathConverter` from `ADD_DEPENDENCY`.
**Risk**: These 3 formats will NOT be available:
- FB2 (format 73) — FictionBook, niche Russian ebook format
- OFD (format 522) — Chinese national document standard
- StarMath — ODF formula editor
**Verdict**: **CONDITIONAL** (build-time decision)
**Why**: These libs were not compiled for WASM (Fb2File and OFDFile are excluded from
the Dockerfile build stages). Including them in ADD_DEPENDENCY without the compiled
`.a` files would cause linker errors. To re-enable: add the build stages back to the
Dockerfile + restore the ADD_DEPENDENCY line.

## Change 4: BinaryReader — Binary Format Parser Removal

**File**: `MsBinaryFile/Common/Vml/PPTShape/BinaryReader.{cpp,h}` (163 lines total)
**Change**: Removes `CBinaryReader` method implementations from .cpp. Header adds
`#include <cstdint>` and declares methods without bodies.
**Risk**: Binary Office formats (`.doc`, `.xls`, `.ppt`) may not be parseable without
the BinaryReader implementation. However, the CDP smoke tests verify binary format
conversion (`.xls` → `.xlsx` scenarios pass at 11/11).
**Verdict**: **EXCLUDE (for now)** — defer to build test
**Why**: Two hypotheses:
  A) The implementation was inlined elsewhere or the methods are not actually called
     in the x2t-only build path (they're used by doctrenderer, which is stubbed).
  B) CryptPad removed them because they caused linker errors in WASM.
  Test approach: build from vanilla core WITHOUT this patch. If it compiles, the
  implementation is not needed. If it fails, investigate why and potentially include.

## Summary

| # | File | Lines | Decision | Reason |
|---|------|-------|----------|--------|
| 1 | html.h | 71 | INCLUDE | Companion to FB2 linker removal |
| 2 | pdf_image.h | 11 | INCLUDE | WASM temp dir fix |
| 3 | X2tConverter.pri | 17 | INCLUDE | Companion to unbuilt lib exclusion |
| 4 | BinaryReader | 163 | EXCLUDE | May not be needed; test first |

The `apply-all.sh` script currently applies patches 1-3 (they've been moved to
`core-must-port/`). Patch 4 is kept here for reference pending build test.
