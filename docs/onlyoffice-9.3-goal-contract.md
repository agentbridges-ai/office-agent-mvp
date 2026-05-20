# ONLYOFFICE 9.3 Goal Contract

## /goal

将项目内置 ONLYOFFICE 前端资源适配到 9.3 系列，在隔离且可回滚的流程中完成资源升级、最小 API 适配、TDD 式验证、实时进度回写和本地 git commit。

## Scope

- 允许改动:
  - `public/web-apps/**`
  - `public/sdkjs/**`
  - `public/wasm/x2t/**`
  - `lib/onlyoffice-editor.ts`
  - `types/editor.d.ts`
  - `docs/onlyoffice-9.3-*.md`
  - `docs/superpowers/plans/2026-05-20-onlyoffice-9-3-adaptation.md`
- 允许创建:
  - `docs/onlyoffice-9.3-upgrade-notes.md`
  - 必要的版本/契约验证脚本，路径需先写入 progress 文档
- 不触碰:
  - `.github/**`
  - `Dockerfile`
  - `docker-compose.yaml`
  - `package.json`
  - `pnpm-lock.yaml`
  - `readme.md`
  - `readme.zh.md`
  - `index.ts`
  - `lib/converter.ts`
  - `lib/document-converter.ts`
  - `lib/document-utils.ts`
  - `public/manifest.json`
  - `public/sw.js`

## Constraints

- 不升级到 9.4；本轮只接受 9.3 系列，默认先用 `v9.3.1`。
- 保持现有公开 API 和 URL 参数契约不变: `locale`、`src`、`file`。
- 当前主工作树存在 CRLF 噪声，禁止在未隔离前直接覆盖 `public/`。
- 不引入服务器依赖，不把 DocumentServer 服务化作为本轮方案。
- 不添加 mock 成功、静默 fallback、吞错或模板化假通过。
- 不为了验证方便扩大 adapter 的公开 API 面。
- 资源替换必须成套验证 `web-apps` 与 `sdkjs`，不能混用未知版本。
- 每个阶段必须先回写 `docs/onlyoffice-9.3-progress.md`，再继续执行。
- 每个可提交 feature 必须遵循 TDD 式闭环: 先定义失败检查，再执行变更，再验证通过，再本地 commit。

## Done when

1. `docs/onlyoffice-9.3-progress.md` 显示 T4-T11 全部为 `completed`，且包含每个阶段的检查点日志。
2. `public/web-apps/apps/api/documents/api.js` 的 `DocsAPI.DocEditor.version()` 返回 9.3.x。
3. `public/web-apps/apps/{documenteditor,spreadsheeteditor,presentationeditor}/main/app.js` 与 `public/sdkjs/{word,cell,slide}/sdk-all.js` 的版本信号均为 9.3.x。
4. `rg -n "asc_openDocument|asc_setImageUrls|asc_onSaveCallback|asc_writeFileCallback|event: 'onSave'|event: 'writeFile'" public/web-apps/apps public/sdkjs -g '!*.min.js'` 能证明关键 bridge 契约存在，或 adapter 文档记录了明确替代契约。
5. `pnpm run lint:ts` 在适配 worktree 中通过。
6. `pnpm run build` 在适配 worktree 中通过。
7. `docs/onlyoffice-9.3-upgrade-notes.md` 记录 `DOCX/XLSX/PPTX/CSV` smoke matrix 的实际结果。
8. 本地 git 至少包含按 feature 切分的 commit，且每个 commit 不混入当前 CRLF 噪声。

## Stop if

- 需要修改 `Scope` 中“不触碰”列表的文件。
- 9.3 资源缺少当前 bridge 必需命令，且没有可验证的 9.3 替代契约。
- 拉取或提取的资源版本信号为 9.4 或非 9.3。
- 需要新增 npm/pnpm 依赖。
- 需要引入后端服务、数据库、队列、缓存或远程转换服务。
- 无法确认 `x2t` 9.3 产物来源，但替换会影响现有转换链路。
- `pnpm run lint:ts` 或 `pnpm run build` 失败且失败原因超出本轮 Scope。
- 当前主工作树仍只有 CRLF 噪声但执行路径准备直接覆盖资源。

## 三轮第一性原理自辩论

### Round 1: 目标到底是什么

**论点 A:** issue 只说“升级到 onlyoffice-9.3版本”，所以直接把最新版资源覆盖进 `public/` 就能满足。

**反论点 B:** 第一性原理看，项目真正提供的是“纯前端本地编辑能力”，不是“文件名看起来升级”。如果只替换资源但破坏本地打开、保存、转换，就没有满足目标。

**裁决:** 目标变量必须是用户可观测行为: 9.3 资源加载成功，DOCX/XLSX/PPTX/CSV 的打开与保存链路仍可用。版本号只是 L0 传感器，不是最终验收。

### Round 2: 改动应该落在哪里

**论点 A:** 既然是升级 ONLYOFFICE，就应把上游源码拉进项目，后续更容易维护。

**反论点 B:** 当前项目 vendored 的是运行时资源，不是上游构建系统。把上游源码作为项目内部目录会扩大仓库职责，引入构建、许可、体积和同步复杂性。

**裁决:** 上游资源先平行拉取到 `/tmp`，只把运行时所需资源复制进 `public/web-apps/**`、`public/sdkjs/**` 和必要的 `public/wasm/x2t/**`。源码目录不进入项目。

### Round 3: 怎样证明规划可落地

**论点 A:** 只要 `pnpm run build` 通过，适配就可以认为完成。

**反论点 B:** 这个项目的关键失败模式在浏览器运行时: iframe 加载、相对资源路径、WASM 初始化、editor event payload、保存回调。构建通过不能覆盖这些风险。

**裁决:** 采用 L0/L1/L2 分层 gate。L0 证明版本和契约，L1 证明构建与 API 加载，L2 证明真实文档 smoke。任何层失败都不能进入完成态。

## Feature Commit Policy

- Feature 1: planning-and-boundary-docs
  - 内容: 计划、影响边界、goal contract、progress 初始化。
  - 验证: 文档存在，progress 状态一致，git status 只包含目标文档。
  - Commit: `docs: plan onlyoffice 9.3 adaptation`
- Feature 2: upstream-source-harvest
  - 内容: 平行拉取与 provenance 记录，不改 runtime 资源。
  - 验证: 9.3.1 tag/release 记录，版本信号检查命令记录。
  - Commit: `docs: record onlyoffice 9.3 source provenance`
- Feature 3: runtime-resource-upgrade
  - 内容: 资源替换。
  - 验证: 版本信号和 bridge 命令检查。
  - Commit: `chore: update onlyoffice runtime assets to 9.3`
- Feature 4: adapter-compatibility
  - 内容: 仅在必要时修改 adapter 类型或事件处理。
  - 验证: 先有失败检查，再最小修改，再通过。
  - Commit: `fix: adapt onlyoffice 9.3 editor bridge`
- Feature 5: verification-and-handoff
  - 内容: build/smoke 结果与升级说明。
  - 验证: `pnpm run lint:ts`、`pnpm run build`、smoke matrix。
  - Commit: `docs: add onlyoffice 9.3 verification evidence`

