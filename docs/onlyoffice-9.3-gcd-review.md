# ONLYOFFICE 9.3 GCD Adapter Review

## Scope

- Reviewed head: `fc6a0b356a7cb1bd8a1411d2593a07eb91f9c7a1`
- Branch: `feat/onlyoffice-9-3-gcd-adapter`
- Baseline considered: `96b2a9e2`
- Review target: implementation state across the GCD adapter branch, not only the final docs commit.

## Review Method

- CSE reference: single-user browser-local ONLYOFFICE 9.3.1 editor runtime with existing browser x2t under adapter and smoke coverage.
- Sensors used: code inspection, branch diff, existing risk/bridge gates, smoke harness coverage, Claude review findings, local cross-review findings.
- Error definition: anything that creates fake success, hidden server simulation, unsupported user paths, brittle minified coupling, hard-coded environment assumptions, or checklist-only code.

## Findings

### F1. Save/PDF failure can still report success to the internal download callback

- Severity: High
- Source: local review
- Location: `lib/onlyoffice-compat/save.ts:51-72`, `lib/onlyoffice-compat/save.ts:94-103`
- Evidence: `handleLocalSaveDocument()` catches conversion/PDF errors, calls `alert()` and `asc_onSaveCallback(error)`, but does not rethrow. The bridge Promise therefore enters `.then()` and calls `callback?.({ status: 'ok', data: 'local-adapter-save' }, true)`.
- Impact: PDF block and conversion failure are visible to the user, but the internal ONLYOFFICE callback can still receive an `ok` status. This is a fake-success signal and is not aligned with the no silent fallback/no mock-success rule.
- Fix direction: return an explicit `SaveResult` or rethrow after reporting the editor save callback; ensure failure takes the bridge callback error branch. Add smoke assertion for `onlyofficeLocalDownloadBridge` callback status.

### F2. Unsupported PPTX remains reachable through UI/open paths

- Severity: High
- Source: local review
- Location: `lib/document.ts:25`, `lib/ui.ts:129`, `lib/ui.ts:355-359`, `lib/empty_bin.ts:6`, `lib/document-utils.ts:34-66`
- Evidence: docs state PPTX is not claimed, but file input still accepts `.pptx,.ppt`, UI still creates new PPTX, and `empty_bin.ts` still contains legacy `PPTY` data.
- Impact: user can enter an explicitly unverified path. The implementation is honest in docs but not honest at the product boundary.
- Fix direction: for the GCD scope, explicitly block PPT/PPTX create/open with a visible unsupported error and remove PPTX from accepted final paths. Do not delete vendored slide runtime unless a separate resource-minimization pass proves it is unused.

### F3. Cross-realm binary checks are inconsistent

- Severity: High
- Source: Claude review, locally verified
- Location: `lib/onlyoffice-compat/media.ts:20`, `lib/converter.ts:53`, `lib/document-converter.ts:159`, `lib/document-converter.ts:175`, `lib/document-converter.ts:475`, `lib/document-converter.ts:529`
- Evidence: `binary.ts` correctly uses `ArrayBuffer.isView()`, while media and converter paths still use `instanceof Uint8Array` or `instanceof ArrayBuffer`. Iframe-originated values can fail `instanceof` across realms.
- Impact: valid pasted image data from the editor iframe can be rejected as invalid; conversion outputs can be mishandled if they cross a realm boundary.
- Fix direction: centralize binary normalization in a first-party helper and use `ArrayBuffer.isView()` plus object-tag ArrayBuffer detection consistently.

### F4. `AscCommon.T7c` monkey patch is undocumented and not guarded by RED evidence

- Severity: High
- Source: Claude review plus local review
- Location: `lib/onlyoffice-compat/save.ts:75-106`
- Evidence: adapter replaces `frame.AscCommon.T7c`, a minified internal function. The design allowed this only after real browser RED evidence, a minimal patch anchor, documentation, and a risk gate. The implementation has the patch but lacks the trace and gate.
- Impact: this is the most invasive adapter mutation. A future ONLYOFFICE update can rename or change the function without a clear failure contract or update path.
- Fix direction: add an explicit local-download shim contract in docs, name the observed 9.3.1 anchor, document the RED symptom, and add a gate that fails if internal monkey patches lack a documented shim entry.

### F5. Local binary ready hook depends on undocumented minified names

- Severity: High
- Source: Claude review plus local review
- Location: `lib/onlyoffice-compat/local-binary.ts:78-83`
- Evidence: `asyncServerIdEndLoaded || n1f || Mmg || NOf` is a set of opaque fallbacks without provenance or version mapping.
- Impact: follow-up upgrades become archeology. The failure message does not tell maintainers what was observed in 9.3.1 or how to update the shim.
- Fix direction: replace inline fallbacks with a small manifest of observed hook candidates, including provenance comments and a clearer error containing checked names. Add risk gate for documented minified hook usage.

### F6. Smoke harness uses random port selection, not true dynamic binding

- Severity: Medium
- Source: Claude review plus local review
- Location: `bin/onlyoffice-smoke/processes.mjs:8-9`
- Evidence: Vite port is selected by `20_000 + Math.floor(Math.random() * 20_000)` and started with `--strictPort`.
- Impact: parallel smoke or leftover processes can fail non-deterministically on collision.
- Fix direction: implement a small bounded retry loop around Vite startup or start Vite in middleware mode behind a `server.listen(0)` wrapper. Keep no new dependencies.

### F7. `alert()` is baked into adapter library code

- Severity: Medium
- Source: Claude review, locally verified
- Location: `lib/onlyoffice-compat/save.ts:68`
- Evidence: save adapter directly calls `alert(message)`.
- Impact: UI policy is embedded in the compatibility layer. The caller cannot replace alert with a different visible error mechanism.
- Fix direction: inject `onError` into the save bridge from `onlyoffice-editor.ts`; default should throw if no handler is supplied in tests. Keep user-visible failure but move the UI decision out of the adapter.

### F8. Presentation cleanup delays are duplicated magic timing

- Severity: Low
- Source: Claude review, locally verified
- Location: `lib/onlyoffice-editor.ts:149-174`
- Evidence: the same presentation check and `400/250/150` timing appears twice with no provenance.
- Impact: tuning-by-guesswork and future edits can diverge the two delays.
- Fix direction: extract named constants and a `getEditorCleanupDelayMs()` helper. Keep behavior unchanged unless a smoke test proves a better value.

### F9. Header-preserving binary string behavior is correct but non-obvious

- Severity: Low
- Source: Claude review, locally verified
- Location: `lib/onlyoffice-compat/binary.ts:32`
- Evidence: string input is encoded as the full `DOCY/XLSY/PPTY;vX;len;base64` text instead of decoded payload. This is intentional for ONLYOFFICE's parser, but the code does not say so.
- Impact: a future cleanup may "fix" it incorrectly by decoding only the base64 payload.
- Fix direction: add a short comment and function naming around header preservation.

### F10. `postMessage(..., '*')` is repeated across adapter modules

- Severity: Low
- Source: Claude review, locally verified
- Location: `lib/onlyoffice-compat/save.ts:92`, `lib/onlyoffice-compat/runtime.ts:71-78`, `lib/onlyoffice-compat/local-binary.ts:106-112`
- Evidence: three adapter paths post to `*`.
- Impact: low in the current same-origin local app, but the pattern is not a good default and should be documented or tightened.
- Fix direction: use `window.location.origin` where the target is same-origin; document any case that must stay wildcard because the target frame origin is opaque.

### F11. `fonts.ts` is checklist code with no runtime owner

- Severity: Low
- Source: Claude review, locally verified
- Location: `lib/onlyoffice-compat/fonts.ts`
- Evidence: exports are not imported by TypeScript runtime code; risk check separately greps `AllFonts.js`.
- Impact: the module exists mainly to satisfy file-existence gate rather than owning behavior.
- Fix direction: either wire `isInvalidOnlyOfficeFontPath()` into the risk check/browser smoke helper, or remove the module from the required adapter list and document font boundary solely in gates/docs.

### F12. Fake 9.3.1 permission/server version should be documented as a local shim

- Severity: Note
- Source: Claude review, locally verified
- Location: `lib/onlyoffice-compat/local-binary.ts:97-98`
- Evidence: local permissions report `asc_getBuildVersion: () => '9.3.1'` and `asc_getBuildNumber: () => '10'`.
- Impact: this is probably necessary to satisfy the local 9.3 editor, but it is a simulated server permission response and should be named as such.
- Fix direction: document it in the local binary shim contract and gate against accidental claims that this is a real DocumentServer backend.

## Consolidated Priority

1. Must fix: F1, F2, F3.
2. Should fix before handoff: F4, F5, F6.
3. Cleanup/documentation: F7, F8, F9, F10, F11, F12.

## Gate Gaps

- Current smoke does not exercise paste/writeFile, so F3 is not covered.
- Current PDF block smoke checks alert/no PDF download, but not the internal download callback status, so F1 is not covered.
- Current risk gate checks broad strings but does not require shim provenance for `T7c` or minified hook names, so F4/F5 are not covered.
- Current risk gate rejects `new-pptx` smoke scenarios but does not reject runtime/UI PPTX entry points, so F2 is not covered.
- Current smoke claims dynamic ports but Vite uses random strict ports, so F6 is not covered.

