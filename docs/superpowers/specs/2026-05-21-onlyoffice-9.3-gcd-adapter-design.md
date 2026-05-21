# ONLYOFFICE 9.3 GCD Adapter Design

## Context

Issue `agentbridges-ai/document#1` only states `升级到onlyoffice-9.3版本`; it has no body text or acceptance details. The acceptance contract therefore must be derived from the current `document` app, upstream ONLYOFFICE runtime structure, and the two existing local adaptation routes:

- `feat/onlyoffice-9-3-runtime` proves that browser-local DOCX/XLSX/CSV open, edit, save, and PDF blocking can be made to work, but it does so with broad vendored runtime replacement and minified runtime patches.
- `feat/onlyoffice-9-3-adapter-layer` proves that the same user-facing flows can be expressed with a first-party adapter layer and a much narrower vendored runtime set.

This design creates a new branch from the shared source-provenance baseline `96b2a9e2`, treats both routes as evidence, and defines the maximum common denominator that should survive future ONLYOFFICE upgrades.

## First Principles

The project is a pure browser document editor. Its non-negotiable invariant is that user documents are opened, edited, converted, and downloaded locally without a DocumentServer backend.

ONLYOFFICE web-apps and sdkjs are a vendored runtime, not the project business layer. They may change between 9.3 and later versions, so project compatibility must be expressed in first-party TypeScript adapters wherever the public browser surface allows it.

The browser x2t converter is a separate runtime boundary. The DocumentServer 9.3.1 package contains server-side `x2t`, not a trusted browser WASM replacement, so the honest target is `ONLYOFFICE 9.3 editor runtime + existing browser x2t under smoke coverage`.

The supported product scope is single-user local editing. Multi-user collaboration requires server-owned locks, presence, incremental save, conflict handling, broadcast, and reconnect semantics; this project must not claim that without a real backend.

## Maximum Common Denominator

Both routes agree on these durable requirements:

- 9.3 runtime provenance must come from a trustworthy built artifact, not from unbuilt source tags alone.
- `web-apps`, `sdkjs`, editor API, empty bins, font registry, iframe sizing, loader/vendor paths, and x2t initialization must be verified together.
- DOCX/XLSX/CSV opening must be tested in a real browser, not inferred from build output.
- Save/download must not depend on `/downloadas/{documentId}`.
- PDF export must be blocked when browser x2t returns a bad `%PDF` or zero-page result.
- Font requests must resolve to real served files, never Vite HTML responses such as `/fonts//fonts/*.ttf`.
- The final evidence must include browser smoke, risk scripts, bridge-contract scripts, lint, and build.

The best-match architecture is not to merge both implementations. It is to keep the adapter route as the control structure, import only the evidence and regression lessons from the runtime route, and write gates that prevent the old failure modes from returning.

## Architecture

The integration has three layers:

1. Runtime provenance layer: official 9.3.1 `web-apps` and `sdkjs` assets copied from the DocumentServer Debian package by an explicit manifest.
2. First-party compatibility layer: `lib/onlyoffice-compat/**` owns binary open, local save/download, media URL handling, PDF guard, font expectations, and runtime readiness checks.
3. Verification layer: scripts and browser smoke assert the boundary contracts and reject hidden backend paths, broad unclaimed vendor resources, bad font URLs, damaged PDF downloads, and false x2t 9.3 claims.

Vendored runtime changes are allowed only as runtime assets or as a documented last-resort shim. A shim needs a real browser RED trace proving the adapter cannot observe or control the behavior, a narrow patch anchor, and a replacement plan.

## Data Flow

New document flow:

1. UI chooses `docx` or `xlsx`.
2. `lib/empty_bin.ts` supplies a trusted 9.3 empty bin for that type.
3. `lib/onlyoffice-compat/binary.ts` preserves the complete `DOCY/XLSY;vX;len;base64` bytes and normalizes them into an `ArrayBuffer`.
4. `lib/onlyoffice-compat/runtime.ts` opens the editor with local single-user settings and transfers the binary through the 9.3 browser path.

Existing document flow:

1. Browser x2t converts DOCX/XLSX/CSV to editor bin.
2. The adapter accepts `ArrayBuffer`, `Uint8Array`, or header string without cross-realm `instanceof` assumptions.
3. Media files are mapped to object URLs and injected only after the editor runtime has a URL registry ready.

Save flow:

1. The editor produces binary output through a local bridge path.
2. `lib/onlyoffice-compat/save.ts` normalizes the event, calls existing browser x2t conversion, triggers local download, and always ends the download overlay.
3. PDF output goes through `lib/onlyoffice-compat/pdf.ts`; invalid PDF is blocked with an explicit server-side conversion limitation.

## Compatibility Rules

- Do not replace `public/wasm/x2t/**` unless a trusted browser-compatible 9.3 source is found.
- Do not claim PPTX support unless a trusted 9.3 PPTX empty bin and smoke path are available.
- Do not copy PDF/Visio/Monaco/help/mobile resources unless browser load evidence or acceptance scope requires them.
- Do not encode project compatibility in minified vendor bundles by default.
- Do not silently fallback to mock success, fake server responses, or hidden no-op callbacks.
- Keep public app usage stable: upload/open from URL/new document/download in the browser.

## CSE Control Contract

Reference input: solve issue #1 by adapting this pure browser `document` project to the ONLYOFFICE 9.3 series.

Plant: runtime assets, first-party editor bridge, x2t converter, fonts, empty bins, save/PDF path, browser smoke harness.

Sensors: provenance checks, static risk checks, bridge-contract checks, lint/build, and real Chromium smoke.

Control inputs: adapter modules, explicit runtime manifest, documented resource copy, focused tests, and narrow shims only when proven unavoidable.

Frozen boundaries: no backend persistence, no database schema, no new npm dependency, no unrelated app modules, no full collaboration claim.

## Three-Round Self-Debate

### Round 1: Should the branch merge both existing routes?

Challenge: merging both routes may preserve every working fix.

Defense: the routes are parallel implementations with 76 overlapping paths and conflicting control strategy. Direct merge reintroduces broad runtime replacement and minified patch coupling.

Ruling: do not merge. Use adapter route as the structural base and runtime route as a failure corpus.

### Round 2: Should future compatibility live in vendored runtime patches?

Challenge: ONLYOFFICE internals may expose no clean API for local save/open.

Defense: once business compatibility is embedded in minified bundles, every upstream refresh becomes archaeology. The project should first exhaust parent-frame, SDK, and adapter-owned browser surfaces.

Ruling: adapter-first. A vendored shim is a documented exception, not the default design.

### Round 3: What is the honest 9.3 claim?

Challenge: users asked for 9.3, so every component should be 9.3.

Defense: no trusted browser 9.3 x2t source has been found. Server x2t is not a browser WASM replacement. Lying about this weakens future upgrades.

Ruling: claim 9.3 editor runtime adaptation with existing browser x2t covered by smoke. Stop if someone requires x2t 9.3 without a trusted browser artifact.

## Done Criteria

- A new branch exists from `96b2a9e2` and does not merge either previous feat branch wholesale.
- A plan describes the adapter-first maximum-common-denominator architecture and migration order.
- Future implementation can cherry-pick or rewrite adapter concepts without importing broad old vendor changes.
- Verification gates are planned to cover new-docx, new-xlsx, open-docx, open-xlsx, open-csv, input-save-docx, and pdf-block-docx.

