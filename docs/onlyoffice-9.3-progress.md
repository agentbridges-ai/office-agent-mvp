# ONLYOFFICE 9.3 适配进度

## 回写规则

- 本文件是本任务的进度事实源。
- 每完成一个阶段、发现一个阻塞、运行一个验证命令，都必须更新本文件。
- 状态只使用: `pending`、`in_progress`、`completed`、`blocked`、`failed`。
- 不把“计划完成”当作“实现完成”。
- 不在未验证时写“通过”。

## 当前状态

- Overall: `in_progress`
- 当前阶段: T22 Task 4 runtime shim contract completed
- 当前工作目录: `/tmp/document-onlyoffice-9-3-gcd-adapter`
- 当前实施分支: `feat/onlyoffice-9-3-gcd-adapter`
- 基线提交: `96b2a9e2`
- 目标版本: ONLYOFFICE 9.3 系列，默认 `v9.3.1`
- 计划文档: `docs/superpowers/plans/2026-05-21-onlyoffice-9.3-gcd-adapter.md`
- 设计文档: `docs/superpowers/specs/2026-05-21-onlyoffice-9.3-gcd-adapter-design.md`
- 影响边界文档: `docs/onlyoffice-9.3-impact-boundary.md`
- Goal contract: `docs/onlyoffice-9.3-goal-contract.md`
- 主风险: 不能把旧 runtime-patch 路线与新 adapter 路线直接 merge；本轮只抽取最大公约数逻辑和验证证据

## 任务状态

| ID | 任务 | 状态 | 证据 / 下一步 |
| --- | --- | --- | --- |
| T0 | 感知 issue 与本地环境 | completed | Issue #1 标题为“升级到onlyoffice-9.3版本”；当前资源为 `web-apps 7.4.1` + `sdkjs 7.5.0` |
| T1 | 初版执行计划 | completed | 已创建 `docs/superpowers/plans/2026-05-20-onlyoffice-9-3-adaptation.md` |
| T2 | CSE 影响边界分析 | completed | 已创建 `docs/onlyoffice-9.3-impact-boundary.md` |
| T3 | Progress 文档初始化 | completed | 本文件已创建，并约定后续每个阶段实时回写 |
| T3.5 | 三轮第一性原理自辩论与 goal contract | completed | 已创建 `docs/onlyoffice-9.3-goal-contract.md`；包含 `/goal`、Scope、Constraints、Done when、Stop if 和三轮自辩论 |
| T4 | 平行拉取 9.3.1 上游资源 | completed | 已拉取 `/tmp/onlyoffice-9.3-sources/web-apps`、`/tmp/onlyoffice-9.3-sources/sdkjs`，并保存 DocumentServer release 元数据 |
| T5 | 资源结构与版本信号核验 | completed | 正确 runtime 来源是 DocumentServer `v9.3.1` `.deb` 提取目录；`api.js` 需由 `api.js.tpl` 注入 `9.3.1` 生成；x2t 浏览器 WASM 不在该包内，先不替换 |
| T6 | 本地补丁/桥接命令审计 | completed | 9.3.1 官方 runtime 仅命中 `asc_openDocument`；当前项目三类 editor app 额外包含 `asc_setImageUrls`、`asc_onSaveCallback`、`asc_writeFileCallback`、`event: 'onSave'`、`event: 'writeFile'` 本地补丁，T7 必须重放 |
| T7 | 旧 runtime 路线资源替换 | completed | 被 GCD adapter 路线取代；本轮不在 `/tmp/document-onlyoffice-9-3-worktree` 继续整包替换 |
| T8 | 旧 runtime 路线最小 API 适配 | completed | 兼容逻辑改由 `lib/onlyoffice-compat/**` 承载 |
| T9 | 旧 runtime 路线 L0/L1 验证 | completed | GCD 路线的 fresh risk/bridge/lint/build 已在 T17 完成 |
| T10 | 旧 runtime 路线 L2 浏览器 smoke | completed | GCD 路线的 docx/xlsx/csv single-user smoke 已在 T17 完成；PPTX 不 claim |
| T11 | 旧 runtime 路线集成或 handoff | completed | 当前交付分支为 `feat/onlyoffice-9-3-gcd-adapter` |
| T12 | 最大公约数 adapter 规划 | completed | 从 `96b2a9e2` 新建 `/tmp/document-onlyoffice-9-3-gcd-adapter`；不 merge `cec52b4f`/`1526ddc2`；已创建设计和实施计划 |
| T13 | GCD adapter RED gates | completed | `check_onlyoffice_9_3_risks` 和 `check_onlyoffice_bridge_contract` 已按预期 RED，失败项覆盖缺 adapter、旧 editor 直连兼容、非 9.3 runtime、x2t 风险声明、PDF/save/font 边界 |
| T14 | GCD first-party adapter 实现 | completed | adapter 相关文件已落地；bridge contract 退出 0；`lint:ts` 退出 0 且仅既有 warning；risk check 只剩 9.3 runtime/font 资源误差 |
| T15 | 最小 9.3 runtime manifest | completed | official 9.3.1 minimal runtime manifest、browser-local `AllFonts.js`、可信 9.3 DOCX/XLSX empty bin 已落地；risk/bridge/lint fresh 退出 0 |
| T16 | GCD browser smoke verification | completed | dynamic-port smoke harness 已落地；完整矩阵 7/7 PASS；`failures=[]`、无 4xx、无 `/downloadas/`、无坏字体、无 browser exception |
| T17 | GCD final verification and review | completed | fresh bridge/risk/lint/build/full smoke 均退出 0；review 自检未发现阻塞项 |
| T18 | Claude + local hard review 交叉复盘 | completed | 已创建 `docs/onlyoffice-9.3-gcd-review.md` 和 `docs/superpowers/plans/2026-05-21-onlyoffice-9.3-gcd-review-fixes.md`；确认 F1/F2/F3 为 must-fix，F4/F5/F6 为 handoff 前 should-fix |
| T19 | Review Task 1 cross-realm binary handling | completed | `binary.ts` 新增 realm-safe helpers；`media.ts`、`converter.ts`、`document-converter.ts` 不再直接使用 `instanceof Uint8Array/ArrayBuffer`；bridge/risk/lint fresh 通过 |
| T20 | Review Task 2 save/PDF failure semantics | completed | smoke 已观测 PDF 阻断内部 download callback 从 `status: ok` 修正为 `status: error`；adapter 不再直接 `alert()`，由 editor orchestration 注入错误显示 |
| T21 | Review Task 3 unsupported PPT/PPTX entry boundary | completed | risk gate 阻止 PPT/PPTX create/open 可达入口；file picker 移除 `.ppt/.pptx`，UI PowerPoint 动作显式 unsupported；非 PPT smoke 5/5 PASS |
| T22 | Review Task 4 local runtime shim contract | completed | `AscCommon.T7c`、ready hook aliases、fake permission version 已写入 upgrade notes；risk gate 要求 shim provenance；ready hook 候选常量化 |

## 检查点日志

| 时间 UTC | 类型 | 内容 |
| --- | --- | --- |
| 2026-05-20T12:26:52Z | INIT | 创建 CSE 影响边界与 progress 文档；锁定 9.3 系列，默认 9.3.1 |
| 2026-05-20T12:27:58Z | CHECKPOINT | T2/T3 完成；影响边界文档与 progress 文档已落地 |
| 2026-05-20T12:31:17Z | CHECKPOINT | 开始落地 `/goal` contract、Scope、Constraints、Done when、Stop if 与三轮第一性原理自辩论 |
| 2026-05-20T12:32:15Z | CHECKPOINT | T3.5 完成；准备提交文档规划 feature，限定只提交四个 docs 文件 |
| 2026-05-20T12:34:17Z | COMMIT | 文档规划 feature 已提交: `12d848a docs: plan onlyoffice 9.3 adaptation` |
| 2026-05-20T12:34:33Z | CHECKPOINT | T4 开始；先平行拉取上游资源，不触碰当前 `public/` |
| 2026-05-20T12:34:59Z | CHECKPOINT | 已重建 `/tmp/onlyoffice-9.3-sources` 与 release 元数据目录 |
| 2026-05-20T12:36:11Z | CHECKPOINT | T4 完成；`web-apps`、`sdkjs` 与 DocumentServer `v9.3.1` 元数据已拉取到 `/tmp/onlyoffice-9.3-sources` |
| 2026-05-20T12:36:40Z | CHECKPOINT | T5 发现 sdkjs tag 不含当前项目所需 `word/cell/slide/sdk-all.js` 编译产物；停止直接替换，转为定位 DocumentServer 或构建产物来源 |
| 2026-05-20T12:37:14Z | CHECKPOINT | 确认 `web-apps` 源码 `api.js` 仍含 `{{PRODUCT_VERSION}}`；需要从 DocumentServer 9.3.1 `.deb` 提取最终 runtime |
| 2026-05-20T12:40:17Z | CHECKPOINT | T5 完成；`.deb` sha256 校验通过，已提取 9.3.1 runtime；确认 `web-apps`/`sdkjs` 为 `9.3.1 (build:10)`，`api.js.tpl` 可生成 `return '9.3.1'`，x2t WASM 不随 DocumentServer 包提供 |
| 2026-05-20T12:41:25Z | CHECKPOINT | T6 完成；官方 9.3.1 runtime 缺少当前项目保存/写图/图片 URL bridge 补丁，T7 需先做失败检查再重放补丁 |
| 2026-05-21T02:08:10Z | REPLAN | 新建第三条分支 `feat/onlyoffice-9-3-gcd-adapter`，worktree `/tmp/document-onlyoffice-9-3-gcd-adapter`，基于共同源头 `96b2a9e2`。本轮不直接 merge `feat/onlyoffice-9-3-runtime` 或 `feat/onlyoffice-9-3-adapter-layer`，而是抽取两者最大公约数：official/minimal 9.3 runtime + first-party adapter + browser smoke gates。 |
| 2026-05-21T02:08:10Z | DESIGN | 创建 `docs/superpowers/specs/2026-05-21-onlyoffice-9.3-gcd-adapter-design.md`，记录 issue #1 空正文约束、两条既有路线关系、第一性原理、CSE control contract、三轮自辩论和 Done criteria。 |
| 2026-05-21T02:08:10Z | PLAN | 创建 `docs/superpowers/plans/2026-05-21-onlyoffice-9.3-gcd-adapter.md`，规划 GCD adapter 的 RED gates、adapter 模块、最小 runtime manifest、browser smoke 和 handoff 验证。 |
| 2026-05-21T02:16:55Z | RED | 新增 `bin/check_onlyoffice_9_3_risks.mjs` 与 `bin/check_onlyoffice_bridge_contract.mjs`。`timeout 60 node bin/check_onlyoffice_9_3_risks.mjs` 退出 1，预期失败项包括缺少 7 个 `lib/onlyoffice-compat/**` adapter、`lib/onlyoffice-editor.ts` 仍直接处理 binary/media/save、runtime 非 9.3.1、x2t 风险未声明、PDF/save/font 边界未满足。 |
| 2026-05-21T02:16:55Z | RED | `timeout 60 node bin/check_onlyoffice_bridge_contract.mjs` 退出 1，预期失败项包括 editor 缺少 adapter imports、仍包含 save/media/open 兼容逻辑、binary adapter/save adapter 尚不存在。 |
| 2026-05-21T02:20:06Z | GREEN | first-party adapter 层落地：`lib/onlyoffice-compat/**` 承载 binary/runtime/local-binary/save/media/pdf/fonts 边界；`lib/onlyoffice-editor.ts` 转为编排层；`timeout 60 node bin/check_onlyoffice_bridge_contract.mjs` 退出 0。 |
| 2026-05-21T02:20:06Z | VERIFY | `timeout 60 pnpm run lint:ts` 退出 0，仅既有 `bin/bundle_single_html.js:36 no-unused-expressions` warning；`timeout 60 node bin/check_onlyoffice_9_3_risks.mjs` 退出 1，失败项只剩 9.3.1 runtime version 和 `AllFonts.js` 旧 Windows 字体路径，符合 T15 输入误差。 |
| 2026-05-21T02:32:47Z | T15 RED | risk gate 新增 empty bin provenance 检查；`timeout 60 node bin/check_onlyoffice_9_3_risks.mjs` 退出 1，预期失败项为旧 DOCX/XLSX empty bin 仍存在、缺少可信 9.3 DOCX/XLSX empty bin、缺少 PPTX not claimed 文档声明。 |
| 2026-05-21T02:32:47Z | T15 GREEN | 从 `/tmp/onlyoffice-9.3-sources/sdkjs/word/document/empty.js` 提取 `DOCY;v4;8985`，从 `/tmp/onlyoffice-9.3-sources/sdkjs/cell/document/empty.js` 提取 `XLSY;v2;5958`，替换 `lib/empty_bin.ts` 的 DOCX/XLSX；未找到可信 9.3 PPTX empty bin，保留旧值但不纳入 claim/smoke。 |
| 2026-05-21T02:32:47Z | T15 DOCS | `docs/onlyoffice-9.3-upgrade-notes.md` 补充 minimal runtime manifest、browser-local font boundary、DOCX/XLSX empty bin provenance、PPTX not claimed，并将尚未 fresh 执行的 build/smoke 状态保持为 pending。 |
| 2026-05-21T02:34:22Z | T15 VERIFY | `timeout 60 node bin/check_onlyoffice_9_3_risks.mjs` 退出 0，输出 `ONLYOFFICE 9.3 GCD risk check passed for /tmp/document-onlyoffice-9-3-gcd-adapter`。 |
| 2026-05-21T02:34:22Z | T15 VERIFY | `timeout 60 node bin/check_onlyoffice_bridge_contract.mjs` 退出 0，输出 `ONLYOFFICE GCD bridge contract passed for /tmp/document-onlyoffice-9-3-gcd-adapter`。 |
| 2026-05-21T02:34:22Z | T15 VERIFY | `timeout 60 pnpm run lint:ts` 退出 0；仅保留既有 warning `bin/bundle_single_html.js:36 no-unused-expressions`，未新增 warning。 |
| 2026-05-21T02:37:01Z | T16 RED | risk gate 新增 smoke harness 约束；缺少 `bin/smoke_onlyoffice_9_3_browser.mjs` 时 `timeout 60 node bin/check_onlyoffice_9_3_risks.mjs` 退出 1，明确要求动态端口、生成样本、结构化 diagnostics、无机器路径、无 PPTX claim。 |
| 2026-05-21T02:37:01Z | T16 GREEN | 新增 browser smoke harness：sample server 使用 `server.listen(0)`，Vite app 使用随机动态端口，DOCX/XLSX/CSV 样本由脚本生成，输出 `scenarioDiagnostics`，无 `/Users/`、`/mnt/z/`、固定 `5174/5184` 或 `new-pptx`。`node --check`、局部 `oxlint` 与 risk gate 均退出 0。 |
| 2026-05-21T02:37:34Z | T16 SMOKE | `timeout 180 node bin/smoke_onlyoffice_9_3_browser.mjs --scenario new-docx --timeout-ms 90000` 退出 0；结构化结果显示 `version=9.3.1`、`documentReady=true`、iframe `765x493`、无 4xx、无 `/downloadas/`、无 `/fonts//fonts`、无 browser exception。 |
| 2026-05-21T02:39:52Z | T16 DEBUG | 完整矩阵首轮功能结果 7/7 PASS，但 harness 失败，因为 9.3 app 通过 `Common.Utils.loadConfig` 请求根路径 `/themes.json` 返回 404；根因是只保留了 `web-apps/apps/common/main/resources/themes/themes.json`，Vite 根路径未暴露该资源。 |
| 2026-05-21T02:39:52Z | T16 FIX | 新增 `public/themes.json`，内容为官方空 theme config `{ "themes": [] }`，并在 risk gate 中要求根路径 theme config 存在，防止后续回退。 |
| 2026-05-21T02:39:52Z | T16 SMOKE | `timeout 360 node bin/smoke_onlyoffice_9_3_browser.mjs --scenario new-docx,new-xlsx,open-docx,open-xlsx,open-csv,input-save-docx,pdf-block-docx --timeout-ms 90000` 退出 0；7/7 PASS，`failures=[]`，全部场景 `version=9.3.1`、`documentReady=true`，无 failed responses、无 `/downloadas/`、无 `/fonts//fonts`、无 browser exception。`input-save-docx` 观测 `modified=true`、`.docx` download anchor、`onlyofficeLocalDownloadBridge outputformat=65`、`asc_onEndAction [1,6]`；`pdf-block-docx` 观测 server-side conversion alert、无 `.pdf` download anchor、`onlyofficeLocalDownloadBridge outputformat=513`、`asc_onEndAction [1,6]`。 |
| 2026-05-21T02:46:35Z | T16 REFACTOR RED | review 自检发现 `bin/smoke_onlyoffice_9_3_browser.mjs` 为 1161 行，不符合项目代码文件 300 行上限；拆分后首轮验证暴露 `createSmokeState` 缺失 import，以及 risk gate 仍在入口单文件查找动态端口和生成样本信号。 |
| 2026-05-21T02:46:35Z | T16 REFACTOR GREEN | smoke harness 拆分为入口文件加 `bin/onlyoffice-smoke/{actions,cdp,config,diagnostics,hooks,processes,samples,scenario,utils}.mjs`；所有模块均低于 300 行。risk gate 改为检查模块化 smoke 所有者：`samples.mjs` 负责 `server.listen(0)` 和生成样本，`processes.mjs` 负责动态 Vite helper，入口负责 `scenarioDiagnostics`。 |
| 2026-05-21T02:46:35Z | T16 REFACTOR VERIFY | `timeout 60 node --check bin/smoke_onlyoffice_9_3_browser.mjs`、`timeout 60 node bin/check_onlyoffice_9_3_risks.mjs`、`timeout 60 node bin/check_onlyoffice_bridge_contract.mjs`、`timeout 60 pnpm exec oxlint bin/smoke_onlyoffice_9_3_browser.mjs bin/onlyoffice-smoke/*.mjs bin/check_onlyoffice_9_3_risks.mjs` 均退出 0。 |
| 2026-05-21T02:46:35Z | T16 REFACTOR SMOKE | 拆分后重新执行 `timeout 360 node bin/smoke_onlyoffice_9_3_browser.mjs --scenario new-docx,new-xlsx,open-docx,open-xlsx,open-csv,input-save-docx,pdf-block-docx --timeout-ms 90000`，退出 0；7/7 PASS，`failures=[]`，动态 app/sample 端口分别为 `22639`/`39433`，无 failed responses、无 `/downloadas/`、无 `/fonts//fonts`、无 browser exception。 |
| 2026-05-21T02:48:02Z | T17 VERIFY | `timeout 60 node bin/check_onlyoffice_bridge_contract.mjs` 退出 0，输出 `ONLYOFFICE GCD bridge contract passed for /tmp/document-onlyoffice-9-3-gcd-adapter`。 |
| 2026-05-21T02:48:02Z | T17 VERIFY | `timeout 60 node bin/check_onlyoffice_9_3_risks.mjs` 退出 0，输出 `ONLYOFFICE 9.3 GCD risk check passed for /tmp/document-onlyoffice-9-3-gcd-adapter`。 |
| 2026-05-21T02:48:02Z | T17 VERIFY | `timeout 60 pnpm run lint:ts` 退出 0；仅既有 warning `bin/bundle_single_html.js:36 no-unused-expressions`，未新增 warning。 |
| 2026-05-21T02:48:02Z | T17 VERIFY | `timeout 60 pnpm run build` 退出 0；保留 Vite external script/chunk size warning 与既有 shell 方言 warning `./bin/build.sh: 17: [[: Permission denied`，构建输出 `Build completed successfully!`。 |
| 2026-05-21T02:48:02Z | T17 SMOKE | `timeout 360 node bin/smoke_onlyoffice_9_3_browser.mjs --scenario new-docx,new-xlsx,open-docx,open-xlsx,open-csv,input-save-docx,pdf-block-docx --timeout-ms 90000` 退出 0；7/7 PASS，`failures=[]`，动态 app/sample 端口分别为 `22560`/`39271`；所有场景 `version=9.3.1`、`documentReady=true`、iframe `765x493`，无 failed responses、无 `/downloadas/`、无 `/fonts//fonts`、无 browser exception。 |
| 2026-05-21T02:48:02Z | T17 REVIEW | 本地 review 自检：未声明 browser x2t 已 9.3；未声明 PPTX 支持；未声明完整多人协作；保存路径不依赖 `/downloadas/{documentId}`；坏 PDF 被阻断并提示 server-side conversion；smoke 不依赖固定端口或机器路径；vendor manifest 保持 minimal 9.3 runtime。 |
| 2026-05-21T03:21:24Z | T18 REVIEW | 交叉复核 Claude review 与本地 review，形成 `docs/onlyoffice-9.3-gcd-review.md`。新增结论：当前 gates/smoke 虽 fresh pass，但仍缺 paste/writeFile realm 覆盖、save failure callback 状态覆盖、PPTX 产品入口边界覆盖、minified shim provenance gate、随机 Vite port gate。 |
| 2026-05-21T03:21:24Z | T18 PLAN | 创建 `docs/superpowers/plans/2026-05-21-onlyoffice-9.3-gcd-review-fixes.md`。整改顺序为 cross-realm binary、save failure honesty、PPTX entry block、minified shim docs/gates、smoke port retry、low-severity adapter cleanup；每个闭环要求 RED/GREEN/VERIFY/commit。 |
| 2026-05-21T05:34:42Z | T19 RED | Task 1 新增 bridge contract 检查：`lib/onlyoffice-compat/media.ts`、`lib/converter.ts`、`lib/document-converter.ts` 中出现 `instanceof Uint8Array/ArrayBuffer` 即失败。`timeout 60 node bin/check_onlyoffice_bridge_contract.mjs` 退出 1，命中上述三个文件，符合 cross-realm 误差定义。 |
| 2026-05-21T05:34:42Z | T19 GREEN | `lib/onlyoffice-compat/binary.ts` 新增 `toStandaloneArrayBuffer()` 与 `toUint8Array()`；`media.ts`、`converter.ts`、`document-converter.ts` 改为调用 helper，避免 iframe realm 的 `Uint8Array` 被误判。 |
| 2026-05-21T05:34:42Z | T19 VERIFY | `timeout 60 node bin/check_onlyoffice_bridge_contract.mjs` 退出 0；`timeout 60 node bin/check_onlyoffice_9_3_risks.mjs` 退出 0；`timeout 60 pnpm run lint:ts` 退出 0，仅保留既有 `bin/bundle_single_html.js:36 no-unused-expressions` warning。 |
| 2026-05-21T05:40:27Z | T20 RED | Task 2 smoke diagnostics 新增 `frame:downloadCallback` 观测，并要求 `pdf-block-docx` 的 callback status 为 `error`。`timeout 360 node bin/smoke_onlyoffice_9_3_browser.mjs --scenario pdf-block-docx --timeout-ms 90000` 退出 1，recentEvents 显示 alert 为 PDF 0 pages，同时 `frame:downloadCallback status="ok"`，证明 fake-success 风险存在。 |
| 2026-05-21T05:40:27Z | T20 GREEN | `handleLocalSaveDocument()` 改为返回 `{ ok: true } | { ok: false; error }`；`installLocalDownloadBridge()` 按结果向 ONLYOFFICE 内部 callback 返回 `ok` 或 `error`；`alert()` 从 adapter 移出，由 `onlyoffice-editor.ts` 注入 `onError`。 |
| 2026-05-21T05:40:27Z | T20 VERIFY | `timeout 60 node bin/check_onlyoffice_9_3_risks.mjs`、`timeout 60 node bin/check_onlyoffice_bridge_contract.mjs`、`timeout 60 pnpm run lint:ts` 均退出 0；`timeout 360 node bin/smoke_onlyoffice_9_3_browser.mjs --scenario input-save-docx,pdf-block-docx --timeout-ms 90000` 退出 0，DOCX 保存 `frame:downloadCallback status="ok"`，PDF 阻断 `status="error"` 且 `failures=[]`。 |
| 2026-05-21T05:43:22Z | T21 RED | Task 3 新增 risk gate：当 notes 记录 PPTX not claimed 时，`lib/document.ts` 不得接受 `.ppt/.pptx`，`lib/ui.ts` 不得调用 `onCreateNew('.pptx')`，且 document open path 必须有显式 presentation blocker。`timeout 60 node bin/check_onlyoffice_9_3_risks.mjs` 退出 1，命中上述四项。 |
| 2026-05-21T05:43:22Z | T21 GREEN | `fileInput.accept` 收敛为 `.docx,.xlsx,.doc,.xls,.csv`；新增 `isUnsupportedPresentationFileName()` 并在 new/open-url/file-input 进入 x2t 前阻断；PowerPoint UI 动作改为显式 unsupported 提示，不再调用 `.pptx` 新建路径。 |
| 2026-05-21T05:43:22Z | T21 VERIFY | `timeout 60 node bin/check_onlyoffice_9_3_risks.mjs` 退出 0；`timeout 60 pnpm run lint:ts` 退出 0，仅既有 warning；`timeout 360 node bin/smoke_onlyoffice_9_3_browser.mjs --scenario new-docx,new-xlsx,open-docx,open-xlsx,open-csv --timeout-ms 90000` 退出 0，5/5 PASS，`failures=[]`。 |
| 2026-05-21T05:46:12Z | T22 RED | Task 4 新增 risk gate：代码出现 `AscCommon.T7c`、`asyncServerIdEndLoaded`、`n1f`、`Mmg`、`NOf` 或 `asc_getBuildVersion` 时，`docs/onlyoffice-9.3-upgrade-notes.md` 必须有 `Local Runtime Shim Contract` provenance。`timeout 60 node bin/check_onlyoffice_9_3_risks.mjs` 退出 1，命中 6 个未文档化 shim。 |
| 2026-05-21T05:46:12Z | T22 GREEN | `docs/onlyoffice-9.3-upgrade-notes.md` 新增 `Local Runtime Shim Contract`，记录 `AscCommon.T7c`、ready hook aliases、`asc_getBuildVersion/asc_getBuildNumber` 的 RED 症状、最小锚点和非 DocumentServer 边界；`LOCAL_BINARY_READY_HOOK_CANDIDATES` 替代内联 alias fallback，错误信息列出候选。 |
| 2026-05-21T05:46:12Z | T22 VERIFY | `timeout 60 node bin/check_onlyoffice_9_3_risks.mjs`、`timeout 60 node bin/check_onlyoffice_bridge_contract.mjs`、`timeout 60 pnpm run lint:ts` 均退出 0；`timeout 360 node bin/smoke_onlyoffice_9_3_browser.mjs --scenario new-docx,input-save-docx,pdf-block-docx --timeout-ms 90000` 退出 0，3/3 PASS，binary bridge、DOCX save ok、PDF block error 均保持。 |

## 最近观测

- `gh issue view 1 --repo agentbridges-ai/document`: issue 正文为空，标题是升级到 9.3。
- GitHub issue 页面显示 PR #2 关联该 issue；PR #2 方向是整包替换 `public/sdkjs` 与 `public/web-apps` 为 DocumentServer 9.3.1，并保留 `AllFonts.js`，这与旧 runtime 路线一致，只作为反例和 provenance 证据，不作为本轮 merge 来源。
- `gh release view v9.3.1 --repo ONLYOFFICE/DocumentServer`: 存在 `ONLYOFFICE-DocumentServer-9.3.1`。
- `git status --short --branch`: 当前主工作树存在大量 `M`。
- `git ls-files --eol`: 文本文件呈现 `i/lf w/crlf`，说明大量 diff 主要由行尾转换造成。
- `git merge-base cec52b4f 1526ddc2`: 两条旧 feat 的共同基线为 `96b2a9e2`，互不是父子关系。

## 阻塞与风险

| 风险 | 状态 | 处理策略 |
| --- | --- | --- |
| 主工作树 CRLF 噪声污染 diff | active | 使用 `/tmp` 平行拉取和隔离 worktree；不在当前目录直接覆盖资源 |
| 9.3.1 tag 与 DocumentServer release 产物不一致 | active | 记录 tag/release provenance；静态版本和浏览器运行双重验证 |
| sdkjs 9.3 编译产物来源不明确 | resolved | DocumentServer `.deb` 中存在已构建 `sdkjs/{word,cell,slide}/sdk-all.js` |
| x2t 9.3 产物来源不明确 | active | DocumentServer 包只含服务端 `server/FileConverter/bin/x2t`；浏览器 WASM 不确认则不替换 |
| 当前资源可能有本地定制 | confirmed | 当前三类 editor app 都有保存、写图、图片 URL bridge 补丁；资源替换必须重放 |
| 旧 runtime 分支 vendor 过宽 | active | 不整分支 merge；只抽取 source provenance、风险清单和 smoke 证据 |
| 旧 adapter 分支虽方向正确但仍需重做为 GCD 规划 | active | 以 adapter-first 作为结构参考，但新分支从 `96b2a9e2` 独立规划，避免继承未审查实现细节 |
| 后续 ONLYOFFICE 更新造成 adapter 失效 | active | 把兼容逻辑集中在 `lib/onlyoffice-compat/**`，并用 bridge/risk/smoke gates 捕捉上游契约漂移 |
| cross-realm 二进制值未覆盖 | resolved | T19 已用 bridge contract 阻止 adapter/converter 中的 `instanceof Uint8Array/ArrayBuffer`，并集中到 `onlyoffice-compat/binary.ts` helper |
| save/PDF 失败内部 callback 可能 fake success | resolved | T20 已用 smoke 覆盖内部 callback status；PDF 阻断返回 `status: error`，DOCX 保存仍返回 `status: ok` |
| PPTX 不 claim 但入口仍可达 | resolved | T21 已关闭 `.ppt/.pptx` file input 和 `.pptx` 新建成功路径；PowerPoint UI 只显示 unsupported 提示 |
| minified shim 缺少 provenance gate | resolved | T22 已由 `Local Runtime Shim Contract` 和 risk gate 覆盖 `T7c`、ready hook aliases、fake permission version |

## 收口结论

- 当前交付分支: `feat/onlyoffice-9-3-gcd-adapter`
- 最终口径: ONLYOFFICE 9.3.1 editor runtime with existing browser x2t under adapter and browser-smoke coverage; single-user local editing only.
- 不 claim: browser x2t 9.3 对齐、PPTX、完整多人协作、坏 PDF 下载成功。
