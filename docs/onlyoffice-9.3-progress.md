# ONLYOFFICE 9.3 适配进度

## 回写规则

- 本文件是本任务的进度事实源。
- 每完成一个阶段、发现一个阻塞、运行一个验证命令，都必须更新本文件。
- 状态只使用: `pending`、`in_progress`、`completed`、`blocked`、`failed`。
- 不把“计划完成”当作“实现完成”。
- 不在未验证时写“通过”。

## 当前状态

- Overall: `in_progress`
- 当前阶段: 准备 T7 隔离 worktree 资源替换与补丁重放
- 当前工作目录: `/mnt/z/projects/document`
- 基线提交: `796f77c`
- 目标版本: ONLYOFFICE 9.3 系列，默认 `v9.3.1`
- 计划文档: `docs/superpowers/plans/2026-05-20-onlyoffice-9-3-adaptation.md`
- 影响边界文档: `docs/onlyoffice-9.3-impact-boundary.md`
- Goal contract: `docs/onlyoffice-9.3-goal-contract.md`
- 主风险: 当前工作树存在 CRLF 噪声，不能直接覆盖 vendored 资源

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
| T7 | 隔离 worktree 中替换资源 | pending | 目标目录 `/tmp/document-onlyoffice-9-3-worktree` |
| T8 | 最小 API 适配 | pending | 仅在 9.3 契约变化时修改 adapter |
| T9 | L0/L1 验证 | pending | `pnpm run lint:ts`、`pnpm run build` |
| T10 | L2 浏览器 smoke | pending | DOCX/XLSX/PPTX/CSV open-save matrix |
| T11 | 集成或 handoff | pending | 根据主工作树状态选择 patch/cherry-pick |

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

## 最近观测

- `gh issue view 1 --repo agentbridges-ai/document`: issue 正文为空，标题是升级到 9.3。
- `gh release view v9.3.1 --repo ONLYOFFICE/DocumentServer`: 存在 `ONLYOFFICE-DocumentServer-9.3.1`。
- `git status --short --branch`: 当前主工作树存在大量 `M`。
- `git ls-files --eol`: 文本文件呈现 `i/lf w/crlf`，说明大量 diff 主要由行尾转换造成。

## 阻塞与风险

| 风险 | 状态 | 处理策略 |
| --- | --- | --- |
| 主工作树 CRLF 噪声污染 diff | active | 使用 `/tmp` 平行拉取和隔离 worktree；不在当前目录直接覆盖资源 |
| 9.3.1 tag 与 DocumentServer release 产物不一致 | active | 记录 tag/release provenance；静态版本和浏览器运行双重验证 |
| sdkjs 9.3 编译产物来源不明确 | resolved | DocumentServer `.deb` 中存在已构建 `sdkjs/{word,cell,slide}/sdk-all.js` |
| x2t 9.3 产物来源不明确 | active | DocumentServer 包只含服务端 `server/FileConverter/bin/x2t`；浏览器 WASM 不确认则不替换 |
| 当前资源可能有本地定制 | confirmed | 当前三类 editor app 都有保存、写图、图片 URL bridge 补丁；资源替换必须重放 |

## 下一步

1. 提交 T4-T6 provenance/progress 文档更新。
2. 创建 `/tmp/document-onlyoffice-9-3-worktree` 隔离 worktree。
3. 在隔离 worktree 中先加入/运行 bridge 契约失败检查，证明纯 9.3.1 runtime 缺本地补丁。
4. 复制 9.3.1 runtime，并重放当前项目的 bridge 补丁。
