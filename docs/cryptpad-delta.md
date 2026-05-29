# CryptPad onlyoffice-x2t-wasm v9.3.0+0 — Upstream Delta Audit

> Baseline: CryptPad `v9.3.0+0` (commit `96886ff`) vs upstream `ONLYOFFICE/core v9.3.0.140` (commit `269dd9b8`)
> Scope: 56 files changed, +1574/-1464 lines (excluding .git metadata)

## Classification

### Must-Port (WASM build essential, 14 changes)

| # | File | Change | Reason |
|---|------|--------|--------|
| 1 | `X2tConverter/src/main.cpp` | Comment out `proclimits.h`, disable `limit_memory()` | WASM has no rlimit; `ALLOW_MEMORY_GROWTH` handles memory |
| 2 | `wrap-main.cpp` | Expose `main1(char* xmlPath)` → `main(2, argv)` | JS can call `ccall("main1")` without argc/argv plumbing |
| 3 | `DesktopEditor/doctrenderer/doctrenderer_empty.cpp` | Empty stub replacing full doctrenderer | docbuilder/rendering not needed for x2t-only WASM |
| 4 | `DesktopEditor/doctrenderer/docbuilder_empty.cpp` | Empty stub replacing full docbuilder | Same as above |
| 5 | `DesktopEditor/doctrenderer/docbuilder_p_empty.cpp` | Empty stub replacing docbuilder internal | Same as above |
| 6 | `DesktopEditor/doctrenderer/doctrenderer.pri` | Comment out all sources except js_internal include | Strips ~100 source files not needed by x2t |
| 7 | `DesktopEditor/doctrenderer/editors.h` | Adjustment for empty stubs | Required by stub compilation |
| 8 | `Common/3dParty/icu/icu.pri` | Skip `libicuuc.so`/`libicudata.so` linking | Emscripten has built-in ICU (`-sUSE_ICU=1`) |
| 9 | `DesktopEditor/graphics/pro/freetype.pri` | Comment out duplicate zlib sources | Prevents "duplicate symbol" link error in WASM |
| 10 | `Common/base.pri` | Remove Windows version/publisher/copyright logic | Not applicable to WASM cross-compile |
| 11 | `Common/kernel.pro` | Build configuration adjustments | WASM qmake target |
| 12 | `Common/3dParty/boost/boost.pri` | Boost include adjustments | WASM headers path |
| 13 | `Common/3dParty/html/css/CssCalculator.pri` | CssCalculator source adjustments | Avoid duplicate symbols |
| 14 | `Common/3dParty/html/css/src/CCssCalculator_Private.*` | Private CSS calc header/source change | WASM inline adjustment |

### Optional-Trim (functionality removed, not critical for x2t, 8 changes)

| # | File | Change | What's Lost |
|---|------|--------|------------|
| 15 | `DesktopEditor/doctrenderer/js_internal/js_base.pri` | JS internal adjustments | JS scripting bridge (not used by x2t CLI) |
| 16 | `DesktopEditor/graphics/pro/textshaper.pri` | Text shaping adjustments | Full textshaper builds |
| 17 | `DesktopEditor/graphics/pro/raster.pri` | Raster graphics adjustments | Image rendering pipelines |
| 18 | `Fb2File/Fb2File.pro` | FictionBook build config | None (format not exposed to users) |
| 19 | `HtmlFile2/htmlfile2.cpp` | HTML file handling | None |
| 20 | `OOXML/Projects/Linux/DocxFormatLib/DocxFormatLib.pro` | DOCX format lib build | None (lib still compiles) |
| 21 | `OdfFile/Projects/Linux/OdfFormatLib.pro` | ODF format lib build | None |
| 22 | `OfficeUtils/OfficeUtils.pri` | Office utils build config | None |

### Skip (test/artifact, no functional impact, 1 change)

| # | File | Change | Reason |
|---|------|--------|--------|
| 23 | `Test/.../DeleteRowsComplex.xlsx` → `.xlsx.ignore` | Test file rename | Prevents WASM test runner picking up broken fixture |

### Risk-Needs-Review (may affect behavior, 4 changes)

| # | File | Change | Risk |
|---|------|--------|------|
| 24 | `X2tConverter/src/lib/html.h` | 33 lines changed | HTML conversion behavior change |
| 25 | `X2tConverter/src/lib/pdf_image.h` | 2 lines changed | PDF image handling |
| 26 | `X2tConverter/build/Qt/X2tConverter.pri` | 4 lines changed | Linker flags / dependency order |
| 27 | `MsBinaryFile/Common/Vml/PPTShape/BinaryReader.*` | Binary reader change | PPT/DOC binary format parsing |

### Dependency Chain Not Changed (present in both, 21 directories)

The following compile into static libs that get linked into the final x2t WASM binary.
CryptPad does NOT modify these beyond build config:

- `PdfFile/`, `UnicodeConverter/`, `XpsFile/`, `DjVuFile/`, `EpubFile/`
- `HwpFile/`, `DocxRenderer/`, `MsBinaryFile/` (except BinaryReader), `OdfFile/`
- The entire format support stack compiles as-is from upstream v9.3.0.140

## Build Dependency Chain

From CryptPad Dockerfile (`/tmp/cryptpad-x2t/Dockerfile`):

| Stage | Library | Source | Version/Lock |
|-------|---------|--------|-------------|
| 1 | gumbo | HTML parser | v0.12.1 |
| 2 | katana | CSS parser | Fixed commit |
| 3 | ooxmlsignature | DOCX signature | Fixed commit |
| 4 | boost | C++ libraries | System via apt |
| 5 | unicodeconverter | Unicode utils | Upstream core |
| 6 | Common | Core common lib | Upstream core |
| 7 | graphics | Freetype/raster/shaper | Upstream core |
| 8 | OOXML | DOCX/XLSX/PPTX support | Upstream core |
| 9 | MsBinaryFile | DOC/XLS/PPT binary | Upstream core |
| 10 | OdfFile | ODF support | Upstream core |
| 11 | RTF | RTF support | Upstream core |
| 12 | CryptoPP | Encryption lib | Upstream core |
| 13 | PdfFile | PDF support | Upstream core |
| 14 | Fb2 | FictionBook | Upstream core |
| 15 | HtmlFile2 | HTML support | Upstream core |
| 16 | Epub | EPUB support | Upstream core |
| 17 | Xps | XPS support | Upstream core |
| 18 | DjVu | DjVu support | Upstream core |
| 19 | IWork | Apple Pages/Numbers/Keynote | Upstream core |
| 20 | HwpFile | HWP/HWPX support | Upstream core |
| 21 | DocxRenderer | DOCX rendering | Upstream core |

**Key tools**: emsdk 4.0.11, build_tools v8.3.0.91, Ubuntu 22.04, qmake6

**Emscripten flags**: `-sUSE_ICU=1 -sALLOW_MEMORY_GROWTH=1 -sERROR_ON_UNDEFINED_SYMBOLS=0`, Closure Compiler enabled

## Critical Findings

1. **build_tools version mismatch**: CryptPad uses `ONLYOFFICE/build_tools v8.3.0.91` while core is `v9.3.0.140`. The build_tools repo provides automate.py and dependency resolution scripts. Version skew may cause missing dependency definitions for 9.3 formats (MD, TSV, OFD, HWPML).

2. **doctrenderer elimination**: Strips the entire docbuilder/rendering/embed/JSON/openssl stack. This means:
   - No PDF rendering (only conversion via x2t binary)
   - No docbuilder API access
   - No OpenSSL (document encryption handled by CryptoPP)
   - This is acceptable for x2t-only usage

3. **ICU from Emscripten**: Uses Emscripten's built-in ICU rather than linking native `.so`. This means ICU version is tied to emsdk version, not to upstream core's ICU expectations. Must verify CJK/Unicode handling matches.

4. **Native reference version**: CryptPad Dockerfile uses `onlyoffice/documentserver:8.3.3` as the native reference for testing — this is a full major version behind the 9.3 wasm! This means native-vs-wasm comparisons in CryptPad's test suite are against a different reference engine.

5. **wrap-main.cpp**: Trivially wraps `main(int, char**)` as `main1(char*)`. No error handling, no lifecycle management, no FS cleanup. Our existing `lib/document-converter.ts` already handles the JS-side concerns (sanitization, path construction, timeout).
