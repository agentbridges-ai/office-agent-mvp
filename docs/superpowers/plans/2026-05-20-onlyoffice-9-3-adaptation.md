# Superseded: Initial ONLYOFFICE 9.3 Adaptation Plan

This historical plan is superseded by:

- `docs/superpowers/plans/2026-05-29-onlyoffice-9.3-full-adaptation.md`
- `docs/onlyoffice-9.3-progress.md`
- `docs/onlyoffice-9.3-upgrade-notes.md`

Do not execute this file. It was written before the final full-vendor 9.3.1 runtime decision, before PPTX was re-enabled, and before the x2t 9.3.0.140/CryptPad artifact path was established.

Known obsolete assumptions:

- Treats adapter changes as minimal and centered on `lib/onlyoffice-editor.ts`.
- Does not reflect the current `lib/onlyoffice-compat/**` adapter layer.
- Does not include the required `AscCommon.Iid` and `AscCommon.zWc` save bridge work.
- Does not include the x2t 9.3.0.140 artifact probe and follow-up hardening.
- Does not reflect the current failing risk gate.
