# ONLYOFFICE 9.3 适配进度

## 回写规则

- 本文件是本任务的进度事实源。
- 每完成一个阶段、发现一个阻塞、运行一个验证命令，都必须更新本文件。
- 状态只使用: `pending`、`in_progress`、`completed`、`blocked`、`failed`。
- 不把“计划完成”当作“实现完成”。
- 不在未验证时写“通过”。

## 当前状态

- Overall: `in_progress`
- 当前阶段: 文档规划 feature 已准备提交，等待执行 T4
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
| T4 | 平行拉取 9.3.1 上游资源 | pending | 目标目录 `/tmp/onlyoffice-9.3-sources` |
| T5 | 资源结构与版本信号核验 | pending | 需确认 web-apps/sdkjs 为 9.3.x 且非 9.4 |
| T6 | 本地补丁/桥接命令审计 | pending | 检查 `asc_openDocument`、`onSave`、`writeFile` 等契约 |
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
| x2t 9.3 产物来源不明确 | active | 先审计来源，不确认不替换；保留显式失败 |
| 当前资源可能有本地定制 | active | 替换前审计 bridge 命令和项目自有资源 |

## 下一步

1. 将文档规划 feature 做一次本地 commit，commit 不包含现有 CRLF 噪声。
2. 执行 T4: 平行拉取 `web-apps` 与 `sdkjs` 9.3.1 到 `/tmp/onlyoffice-9.3-sources`。
3. 每完成 T4 的一个子步骤，立即回写本文件的任务状态和检查点日志。
