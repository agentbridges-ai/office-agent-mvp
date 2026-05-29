# Superseded: ONLYOFFICE 9.3 GCD Adapter Design

This historical design is superseded by:

- `docs/superpowers/plans/2026-05-29-onlyoffice-9.3-full-adaptation.md`
- `docs/onlyoffice-9.3-progress.md`
- `docs/onlyoffice-9.3-upgrade-notes.md`

Do not use this file as the current design source. It describes an earlier maximum-common-denominator/minimal-vendor adapter route. The current target is a full 9.3.1 editor runtime, first-party adapter bridge, and x2t 9.3.0.140 WASM alignment.

Known obsolete assumptions:

- It says not to replace `public/wasm/x2t/**` unless a trusted browser-compatible source is found; CryptPad `onlyoffice-x2t-wasm v9.3.0+0` is now the artifact probe source.
- It says not to claim PPTX unless a trusted path is available; PPTX create/open is now in scope, and PPTX save bridge behavior is smoke-verified through `zWc`.
- It treats PDF/Visio/Monaco full-vendor presence as suspicious by default; full-vendor is now intentional and must be documented instead of rejected.
