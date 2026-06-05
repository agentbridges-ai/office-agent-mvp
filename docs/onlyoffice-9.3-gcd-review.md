# Superseded: ONLYOFFICE 9.3 GCD Adapter Review

This historical review is superseded by:

- `docs/superpowers/plans/2026-05-29-onlyoffice-9.3-full-adaptation.md`
- `docs/onlyoffice-9.3-progress.md`
- `docs/onlyoffice-9.3-upgrade-notes.md`

Do not use this file as the current review source. It reviewed the earlier minimal-vendor GCD adapter branch and contains conclusions that no longer match the full-vendor + PPTX + x2t 9.3 alignment target.

Known obsolete assumptions:

- Treats PPTX as unsupported in parts of the product boundary.
- Treats full-vendor `pdf`, `visio`, and `monaco` resources as suspicious by default.
- Records only the Word `AscCommon.T7c` save bridge as implemented, while the current target requires `T7c`, `Iid`, and `zWc`.
- Does not cover CryptPad x2t `v9.3.0+0`, 9.3 format table generation, or WASM FS sandbox verification.
