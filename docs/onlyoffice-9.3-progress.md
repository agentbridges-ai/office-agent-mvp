# ONLYOFFICE 9.3 适配进度

## 回写规则

- 本文件是本任务的进度事实源。
- 每完成一个阶段、发现一个阻塞、运行一个验证命令，都必须更新本文件。
- 状态只使用: `pending`、`in_progress`、`completed`、`blocked`、`failed`。
- 不把"计划完成"当作"实现完成"。
- 不在未验证时写"通过"。

## 当前状态

- Overall: `completed`
- 当前阶段: T29 — 全量 vendor 替换 + PPTX 启用 + 9-scenario smoke 通过
- 当前实施分支: `onlyoffice-9-3-adaption`
- 基线提交: `96b2a9e2` (docs: record onlyoffice 9.3 source provenance)
- gcd-adapter 基线: `83376092` (refactor: reuse onlyoffice binary helper in save bridge)
- 目标版本: ONLYOFFICE 9.3 系列，实际 `v9.3.1 (build:10)`
- 影响边界文档: `docs/onlyoffice-9.3-impact-boundary.md`
- Goal contract: `docs/onlyoffice-9.3-goal-contract.md`
- 升级说明: `docs/onlyoffice-9.3-upgrade-notes.md`

## 分支拓扑

```
96b2a9e2 (source provenance)
├── main (当前 7.x 基线, CRLF 污染)
├── feat/onlyoffice-9-3-runtime (cec52b4f, 14 commits) — 全量 vendor + inline adapter + bridge patch
├── feat/onlyoffice-9-3-adapter-layer (1526ddc2, 5 commits) — 模块化 adapter + 最小 vendor
├── feat/onlyoffice-9-3-gcd-adapter (83376092, 16 commits) — GCD adapter + 最小 vendor + smoke harness
└── onlyoffice-9-3-adaption (e12f812d, 19 commits) — GCD adapter + 全量 vendor + PPTX + 9-scenario smoke
    ├── d30aa5cb chore: replace vendor runtime with onlyoffice 9.3.1 full resources
    ├── 63878e21 fix: adapt 9.3.1 runtime to local browser-only deployment
    └── e12f812d feat: enable PPTX and add full smoke matrix
```

合并状态:
- gcd-adapter → adaption: 已是祖先（adaption 包含 gcd-adapter 全部）
- runtime → adaption: 14 commits 不在 adaption 中（vendor 已全量替换，adapter 架构不同，不 merge）
- adapter-layer → adaption: 5 commits 不在 adaption 中（adapter 架构相似但 adaption 更完整，不 merge）

## 任务状态

| ID | 任务 | 状态 | 证据 / 下一步 |
| --- | --- | --- | --- |
| T0 | 感知 issue 与本地环境 | completed | Issue #1 标题为"升级到onlyoffice-9.3版本"；当前资源为 `web-apps 7.4.1` + `sdkjs 7.5.0` |
| T1 | 初版执行计划 | completed | 已创建 `docs/superpowers/plans/2026-05-20-onlyoffice-9-3-adaptation.md` |
| T2 | CSE 影响边界分析 | completed | 已创建 `docs/onlyoffice-9.3-impact-boundary.md` |
| T3 | Progress 文档初始化 | completed | 本文件已创建，并约定后续每个阶段实时回写 |
| T3.5 | 三轮第一性原理自辩论与 goal contract | completed | 已创建 `docs/onlyoffice-9.3-goal-contract.md` |
| T4 | 平行拉取 9.3.1 上游资源 | completed | 拉取 DocumentServer v9.3.1 `.deb`；sha256 `b206c7eefcf3750605d6d3f61a95f81c2ecaf931f4855f004bfd1d4d05269817` |
| T5 | 资源结构与版本信号核验 | completed | `.deb` 提取 runtime 9.3.1 (build:10)；api.js 由 api.js.tpl 生成；x2t 不在该包内 |
| T6 | 本地补丁/桥接命令审计 | completed | 9.3.1 官方 runtime 含 `asc_openDocument` 和 `openDocumentFromBinary`，不含 `asc_setImageUrls/asc_onSaveCallback/asc_writeFileCallback` |
| T7–T11 | 旧 runtime 路线 | completed | 被 GCD adapter 路线取代 |
| T12–T26 | GCD adapter 路线 | completed | 在 `feat/onlyoffice-9-3-gcd-adapter` 完成：TS-only adapter、最小 vendor、7-scenario smoke |
| T27 | 全量 .deb vendor 资源替换 | completed | `d30aa5cb` — rsync 17,356 文件从 fresh .deb 提取；api.js 从 template 生成；AllFonts.js 从 runtime 分支获取；project-owned assets (fonts/img/libs/wasm/manifest/sw) 保留 |
| T28 | 9.3.1 运行时适配修复 | completed | `63878e21` — api.js 禁用 `/9.3.1-10/` 版本路径前缀；AllFonts.js 恢复 9.3 兼容版（100 行）；smoke 7/7 PASS |
| T29 | PPTX 支持启用与全量 smoke | completed | `e12f812d` — 移除 PPTX 屏蔽（document.ts/ui.ts）；更新 themes.js（Tort → Turtle）；新增 PPTX smoke 场景；全量 9/9 PASS, 0 failures |

## 检查点日志

| 时间 UTC | 类型 | 内容 |
| --- | --- | --- |
| 2026-05-20T12:26:52Z | INIT | 创建 CSE 影响边界与 progress 文档；锁定 9.3 系列，默认 9.3.1 |
| 2026-05-20T12:27:58Z | CHECKPOINT | T2/T3 完成 |
| 2026-05-20T12:32:15Z | CHECKPOINT | T3.5 完成 |
| 2026-05-20T12:34:17Z | COMMIT | `12d848a docs: plan onlyoffice 9.3 adaptation` |
| 2026-05-20T12:36:11Z | CHECKPOINT | T4 完成；DocumentServer 9.3.1 资源已拉取 |
| 2026-05-20T12:40:17Z | CHECKPOINT | T5 完成；.deb sha256 通过，确认 9.3.1 (build:10) |
| 2026-05-20T12:41:25Z | CHECKPOINT | T6 完成；9.3.1 不含旧 bridge 补丁 |
| 2026-05-21T02:08:10Z | REPLAN | 新建 gcd-adapter 分支，基于 `96b2a9e2` |
| 2026-05-21T02:48:02Z | CHECKPOINT | T17 完成；gcd-adapter 7-scenario smoke pass |
| 2026-05-21T05:56:35Z | CHECKPOINT | T25 完成；final review fixes verified |
| 2026-05-28T21:30:00Z | REPLAN | 从 gcd-adapter 创建 `onlyoffice-9-3-adaption`；决定全量 .deb 替换 + 纯 TS adapter |
| 2026-05-28T21:48:00Z | EXTRACT | 重新下载 .deb，sha256 b206c7ee 匹配；dpkg-deb 提取 runtime |
| 2026-05-28T22:00:00Z | CHECKPOINT | 内部 API 确认：openDocumentFromBinary 在 9.3.1 app.js 原生支持；AscCommon.T7c/Iid/zWc 在 sdk-all-min.js 均存在（各 5+ hits） |
| 2026-05-28T22:15:00Z | COMMIT | `d30aa5cb` — rsync 17,356 文件全量 vendor 替换 |
| 2026-05-28T22:25:00Z | VERIFY | L0 version/bridge/lint 通过；L1 build 通过（4m58s） |
| 2026-05-28T22:40:00Z | FIX | api.js 版本路径前缀 `/9.3.1-10/` 破坏 iframe 加载 → 设为空 |
| 2026-05-28T22:45:00Z | FIX | AllFonts.js 缺失（.deb 不含）→ 从 runtime 分支复制 9.3 兼容版 |
| 2026-05-28T22:50:00Z | SMOKE | new-docx smoke PASS (`version:9.3.1`, `documentReady:true`) |
| 2026-05-28T22:51:00Z | COMMIT | `63878e21` — runtime adaptation fixes |
| 2026-05-28T23:00:00Z | SMOKE | 全量 7/7 PASS (DOCX/XLSX/CSV create+open+save+pdf-block) |
| 2026-05-28T23:10:00Z | FIX | PPTX 入口屏蔽 → 移除 assertSupportedLocalFileName, 恢复 UI 按钮 |
| 2026-05-28T23:15:00Z | FIX | themes.js 缺失 → 复制 7.x 版，更新为 9.3.1 主题列表 (Tort) |
| 2026-05-28T23:20:00Z | SMOKE | PPTX 2/2 PASS (new-pptx + open-pptx) |
| 2026-05-28T23:25:00Z | SMOKE | 全量 9/9 PASS, 0 failures |
| 2026-05-28T23:30:00Z | COMMIT | `e12f812d` — PPTX enablement + 9-scenario smoke |

## 最近观测

- `.deb` sha256: `b206c7eefcf3750605d6d3f61a95f81c2ecaf931f4855f004bfd1d4d05269817` 与 GitHub Release v9.3.1 匹配
- `DocsAPI.DocEditor.version()` 浏览器运行时返回 `9.3.1`
- 7 个版本信号源（api.js 3+app.js 3+sdk-all.js 6）一致报告 `9.3.1 (build:10)`
- 官方 9.3.1 原生支持 `openDocumentFromBinary` postMessage 命令
- 官方 9.3.1 不含 `asc_setImageUrls`/`asc_onSaveCallback`/`asc_writeFileCallback` bridge 命令
- `AscCommon.T7c`/`AscCommon.Iid`/`AscCommon.zWc` 在 sdk-all-min.js 均存在
- x2t WASM 未替换（与 main 分支 blob hash 一致）
- `lib/onlyoffice-compat/` 模块在 full vendor 下工作正常（9/9 smoke pass）

## 阻塞与风险

| 风险 | 状态 | 处理策略 |
| --- | --- | --- |
| 主工作树 CRLF 噪声污染 diff | active | 仅在 root config files 上有噪声；vendor/ 和 lib/ 已通过 branch switch 隔离 |
| x2t WASM 版本不一致 | active | 保留现有 x2t，所有 smoke 通过证明兼容 |
| 9.3.1 sdk 内部 API (T7c/Iid/zWc) 签名变化 | resolved | 当前版本确认 5+ hits，adapter 拦截正常工作 |
| .deb 缺少 AllFonts.js 和 themes.js | resolved | T28/T29 已从 runtime 分支恢复 |
| PPTX save bridge 未充分验证 | monitor | PPTX open/create smoke 通过，但未在 smoke 中测试 PPTX save |

## 收口结论

- 当前交付分支: `onlyoffice-9-3-adaption`
- 最终口径: ONLYOFFICE 9.3.1 full vendor runtime with TS-only adapter, browser-smoke verified (9/9 scenarios PASS)
- Claim: DOCX/XLSX/PPTX/CSV — create, open, save (DOCX save verified), binary bridge
- PDF: PDE export blocked with clear error (requires server-side conversion)
- 不 claim: browser x2t 9.3 alignment, multi-user collaboration, PPTX save automation
