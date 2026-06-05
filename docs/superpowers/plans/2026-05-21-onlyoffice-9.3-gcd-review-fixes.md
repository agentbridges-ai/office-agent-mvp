# Superseded: ONLYOFFICE 9.3 GCD Review Fixes Plan

This historical plan is superseded by:

- `docs/superpowers/plans/2026-05-29-onlyoffice-9.3-full-adaptation.md`
- `docs/onlyoffice-9.3-progress.md`
- `docs/onlyoffice-9.3-upgrade-notes.md`

Do not execute this file. It was useful for the minimal-vendor GCD adapter branch, but its remediation steps no longer match the current full-vendor + PPTX + x2t 9.3 alignment target.

Known obsolete assumptions:

- Treats PPTX as unsupported in the product boundary.
- Encodes minimal-vendor risk checks that now conflict with the full-vendor runtime target.
- Documents `AscCommon.T7c` only as the implemented save bridge while the current target requires `T7c`, `Iid`, and `zWc`.
- Does not cover x2t 9.3.0.140 artifact replacement, format table generation, or WASM FS sandbox verification.
