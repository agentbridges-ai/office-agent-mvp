# OnlyOffice 9.3 Adaptation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将本项目内置的 ONLYOFFICE 前端编辑资源适配到 9.3 系列，并保持本地浏览器编辑、打开、保存、转换链路可用。

**Architecture:** 当前项目是 Vite 纯前端应用，业务代码通过 `public/web-apps/apps/api/documents/api.js` 加载 ONLYOFFICE web-apps，再由 editor app 按相对路径加载 `public/sdkjs`。升级应以平行拉取上游资源、差异审计、成套替换 vendored assets、重放本项目必要本地补丁、分层验证的方式推进。

**Tech Stack:** Vite、TypeScript、pnpm、ONLYOFFICE web-apps/sdkjs/core x2t WASM、GitHub release/tag、Playwright 或浏览器手工 smoke gate。

---

## Control Contract

**Primary Setpoint:** 在不改变项目公开使用方式的前提下，内置 ONLYOFFICE 编辑器资源从当前 `web-apps 7.4.1 + sdkjs 7.5.0` 适配到 9.3 系列。

**Acceptance:** `DocsAPI.DocEditor.version()` 返回 9.3.x；`word/cell/slide` 三类编辑器可创建新文档、打开本地文档、保存回对应格式；`pnpm run lint:ts` 与 `pnpm run build` 通过。

**Guardrail Metrics:** 不引入服务器依赖；不改 URL 参数契约；不破坏 `src/file/locale` 使用；不吞转换或加载失败；不把 9.4 资源混入 9.3 适配。

**Sampling Plan:** 每个资源替换阶段采样一次版本头、关键事件名、构建结果；最终对 DOCX/XLSX/PPTX/CSV 做一次 smoke matrix。

**Known Delays / Delay Budget:** 上游资源体积大，拉取与复制可能耗时 5-20 分钟；浏览器 smoke 依赖本地 dev server 与 WASM 加载，允许 10 分钟排查一次失败。

**Recovery Target:** 任一阶段失败时，删除平行拉取目录或放弃隔离 worktree，当前主工作树保持可恢复；进入当前仓库覆盖前必须能用 git diff 精确回退。

**Rollback Trigger:** 出现 9.4 资源、上游 9.3 资源缺关键入口、三类 editor 任一无法加载、x2t 初始化失败且无明确兼容补丁时，停止替换并回到上一个资源快照。

**Constraints:** 当前工作树存在大面积 CRLF 脏状态，禁止在未隔离前直接覆盖 `public/`；不得为了跑通添加 mock 成功路径；所有失败必须可观测。

**Boundary:** 允许触碰 `public/web-apps/**`、`public/sdkjs/**`、`public/wasm/x2t/**`、`types/editor.d.ts`、必要的 `lib/onlyoffice-editor.ts` 与文档；默认不改应用业务入口、URL 契约、CI 配置和 Docker。

**Coupling Notes:** 资源替换强耦合 `api.js -> editor iframe -> sdkjs -> x2t`；`lib/onlyoffice-editor.ts` 依赖 `onAppReady/onDocumentReady/onSave/writeFile` 与 `sendCommand` 命令名。

**Approximation Validity:** 静态版本检查只能证明资源来源；真正兼容性必须通过浏览器运行和文件 open/save smoke。

**Actuator Budget:** 第一阶段只读和拉取到 `/tmp`；第二阶段在隔离 worktree 或清洁行尾后替换 vendored 资源；第三阶段只做最小 API 适配。

**Risks:** 上游 tag 与 DocumentServer release 编译产物不完全一致；项目当前资源经过本地定制；x2t WASM 9.3 资源来源可能不在 `sdkjs/web-apps` tag 内，需要从 DocumentServer 包或 build_tools 产物提取。

## Current State Estimate

- GitHub issue #1：标题为“升级到onlyoffice-9.3版本”，正文和评论为空，创建于 2026-05-20。
- ONLYOFFICE DocumentServer 发布：`v9.3.0` 发布于 2026-02-24，`v9.3.1` 发布于 2026-03-03；当前还有 `v9.4.0`，但本计划锁定 9.3。
- 默认目标版本：`9.3.1`。理由是它属于 9.3 系列的补丁发布；若兼容性失败，再降级验证 `9.3.0`。
- 当前本地资源：`public/web-apps/apps/api/documents/api.js` 返回 `7.4.1`，三个 editor app 头部为 `7.4.1 (build:1)`；`public/sdkjs/*/sdk-all.js` 头部为 `7.5.0 (build:20241016-1824)`。
- 当前工作树：90 个文件显示修改，`git ls-files --eol` 显示索引 LF、工作区 CRLF；这是执行前必须处理的噪声源。

## Pull Location Decision

结论：先平行拉取到 `/tmp/onlyoffice-9.3-sources`，不要拉到当前项目内部。

原因：
- 当前仓库工作树被 CRLF 转换污染，直接拉到项目内会把资源替换和行尾噪声混在一起。
- 上游仓库体积大、tag 多、构建产物路径不确定；平行目录更适合做结构勘探和提取。
- 本项目只需要 vendored runtime assets，不需要把上游源码作为子模块或长期源码目录纳入仓库。

进入当前项目的条件：
- 已确认上游 9.3.1 的 `web-apps`、`sdkjs`、`x2t` 来源和版本。
- 已生成资源替换清单。
- 已决定在隔离 worktree 或清洁行尾状态下执行覆盖。

## File Structure Map

- Modify: `public/web-apps/**`：ONLYOFFICE editor UI、API bridge、locale、CSS、vendor runtime。
- Modify: `public/sdkjs/**`：word/cell/slide SDK 与 common runtime。
- Modify: `public/wasm/x2t/**`：文档转换 WASM runtime，如 9.3 有对应产物。
- Modify: `types/editor.d.ts`：只在 9.3 的 API 事件结构发生实际差异时更新。
- Modify: `lib/onlyoffice-editor.ts`：只在 `sendCommand`、事件名、保存事件 payload 发生实际差异时做最小适配。
- Create: `docs/onlyoffice-9.3-upgrade-notes.md`：记录资源来源、tag、提取命令、验证矩阵和残余风险。

## Task 1: Establish Clean Upgrade Harness

**Files:**
- Create: `/tmp/onlyoffice-9.3-sources/`
- No repo file modifications.

- [ ] **Step 1: Stop background probes**

Run:

```bash
ps -o pid,ppid,stat,etime,cmd -C git
```

Expected: no stale `git ls-remote` process for ONLYOFFICE remains.

- [ ] **Step 2: Record current issue and repo baseline**

Run:

```bash
gh issue view 1 --repo agentbridges-ai/document --json number,title,state,body,comments,createdAt,updatedAt,url
git status --short --branch
git ls-files --eol | sed -n '1,120p'
```

Expected: issue title is `升级到onlyoffice-9.3版本`; status shows CRLF-related dirty files; EOL output shows `i/lf w/crlf` for text files.

- [ ] **Step 3: Decide isolation mechanism**

Run:

```bash
git worktree list
```

Expected: identify whether a sibling worktree can be created for implementation. Preferred implementation directory is `/tmp/document-onlyoffice-9-3-worktree` or another clean sibling outside `/mnt/z/projects/document`.

## Task 2: Fetch 9.3.1 Sources in Parallel Directory

**Files:**
- Create: `/tmp/onlyoffice-9.3-sources/web-apps`
- Create: `/tmp/onlyoffice-9.3-sources/sdkjs`
- Create: `/tmp/onlyoffice-9.3-sources/documentserver-release`

- [ ] **Step 1: Prepare source directory**

Run:

```bash
rm -rf /tmp/onlyoffice-9.3-sources
mkdir -p /tmp/onlyoffice-9.3-sources
```

Expected: directory exists and is empty.

- [ ] **Step 2: Clone web-apps tag**

Run:

```bash
git clone --depth 1 --branch v9.3.1.11 https://github.com/ONLYOFFICE/web-apps.git /tmp/onlyoffice-9.3-sources/web-apps
```

Expected: clone succeeds. If tag is unavailable, use GitHub API evidence that `v9.3.1.11` points to the same SHA as other 9.3.1 tags and retry with `v9.3.1.1`.

- [ ] **Step 3: Clone sdkjs tag**

Run:

```bash
git clone --depth 1 --branch v9.3.1.11 https://github.com/ONLYOFFICE/sdkjs.git /tmp/onlyoffice-9.3-sources/sdkjs
```

Expected: clone succeeds, or fallback to `v9.3.1.1` if the exact tag is unavailable.

- [ ] **Step 4: Capture DocumentServer release metadata**

Run:

```bash
gh release view v9.3.1 --repo ONLYOFFICE/DocumentServer --json tagName,name,publishedAt,assets,url > /tmp/onlyoffice-9.3-sources/documentserver-release/v9.3.1.json
```

Expected: JSON lists `ONLYOFFICE-DocumentServer-9.3.1` and package assets.

## Task 3: Locate Runtime Assets and Version Signals

**Files:**
- No repo file modifications.

- [ ] **Step 1: Find web-apps built assets**

Run:

```bash
find /tmp/onlyoffice-9.3-sources/web-apps -path '*documenteditor/main/app.js' -o -path '*spreadsheeteditor/main/app.js' -o -path '*presentationeditor/main/app.js' -o -path '*apps/api/documents/api.js' | sort
```

Expected: paths corresponding to current `public/web-apps/apps/...` exist.

- [ ] **Step 2: Find sdkjs built assets**

Run:

```bash
find /tmp/onlyoffice-9.3-sources/sdkjs -path '*word/sdk-all.js' -o -path '*cell/sdk-all.js' -o -path '*slide/sdk-all.js' -o -path '*common/AllFonts.js' | sort
```

Expected: paths corresponding to current `public/sdkjs/...` exist.

- [ ] **Step 3: Verify version signals**

Run:

```bash
head -5 /tmp/onlyoffice-9.3-sources/web-apps/apps/documenteditor/main/app.js
head -5 /tmp/onlyoffice-9.3-sources/sdkjs/word/sdk-all.js
rg -n "DocEditor.version|return '9\\.3|Version: 9\\.3|build:" /tmp/onlyoffice-9.3-sources/web-apps/apps/api/documents/api.js /tmp/onlyoffice-9.3-sources/web-apps/apps/*/main/app.js /tmp/onlyoffice-9.3-sources/sdkjs/*/sdk-all.js
```

Expected: web-apps and sdkjs report 9.3.x, not 9.4.x.

## Task 4: Audit Project Local Patches Against Upstream

**Files:**
- No repo file modifications.

- [ ] **Step 1: Compare current runtime file sets**

Run:

```bash
find public/web-apps public/sdkjs public/wasm/x2t -type f | sort > /tmp/current-onlyoffice-files.txt
find /tmp/onlyoffice-9.3-sources/web-apps/apps /tmp/onlyoffice-9.3-sources/web-apps/vendor /tmp/onlyoffice-9.3-sources/sdkjs -type f | sort > /tmp/upstream-onlyoffice-files.txt
```

Expected: both file lists exist.

- [ ] **Step 2: Locate custom bridge commands in upstream**

Run:

```bash
rg -n "asc_openDocument|asc_setImageUrls|asc_onSaveCallback|asc_writeFileCallback|event: 'onSave'|event: 'writeFile'|onAppReady|onDocumentReady" /tmp/onlyoffice-9.3-sources/web-apps/apps /tmp/onlyoffice-9.3-sources/sdkjs -g '!*.min.js'
```

Expected: 9.3 resources still contain the bridge commands used by `lib/onlyoffice-editor.ts`.

- [ ] **Step 3: Identify project-only resource omissions**

Run:

```bash
comm -23 /tmp/current-onlyoffice-files.txt /tmp/upstream-onlyoffice-files.txt | sed -n '1,200p'
```

Expected: output shows project-only files that must be retained, such as local fonts, PWA assets, or x2t files not present in web-apps/sdkjs sources.

## Task 5: Implement Replacement in an Isolated Worktree

**Files:**
- Modify: `public/web-apps/**`
- Modify: `public/sdkjs/**`
- Modify: `public/wasm/x2t/**` only if a verified 9.3 x2t source is available.
- Modify: `docs/onlyoffice-9.3-upgrade-notes.md`

- [ ] **Step 1: Create clean worktree**

Run:

```bash
git worktree add /tmp/document-onlyoffice-9-3-worktree HEAD
```

Expected: clean worktree exists and `git -C /tmp/document-onlyoffice-9-3-worktree status --short` is empty.

- [ ] **Step 2: Copy web-apps resources**

Run from `/tmp/document-onlyoffice-9-3-worktree`:

```bash
rsync -a --delete /tmp/onlyoffice-9.3-sources/web-apps/apps/ public/web-apps/apps/
rsync -a --delete /tmp/onlyoffice-9.3-sources/web-apps/vendor/ public/web-apps/vendor/
```

Expected: `public/web-apps/apps/api/documents/api.js` and three editor app bundles are updated to 9.3.x.

- [ ] **Step 3: Copy sdkjs resources**

Run from `/tmp/document-onlyoffice-9-3-worktree`:

```bash
rsync -a --delete /tmp/onlyoffice-9.3-sources/sdkjs/ public/sdkjs/
```

Expected: `public/sdkjs/word/sdk-all.js`, `cell/sdk-all.js`, and `slide/sdk-all.js` report 9.3.x.

- [ ] **Step 4: Preserve project-owned assets**

Run from `/tmp/document-onlyoffice-9-3-worktree`:

```bash
git status --short public/fonts public/img public/libs public/manifest.json public/sw.js
```

Expected: no unrelated project-owned assets were deleted or replaced by ONLYOFFICE copying.

- [ ] **Step 5: Add upgrade notes**

Create `docs/onlyoffice-9.3-upgrade-notes.md` with:

```markdown
# ONLYOFFICE 9.3 Upgrade Notes

## Target

- DocumentServer release: v9.3.1
- web-apps tag: v9.3.1.11
- sdkjs tag: v9.3.1.11

## Resource Policy

The project vendors browser runtime assets under `public/web-apps` and `public/sdkjs`.
Upstream sources are fetched outside the repository and copied as runtime assets only.

## Validation Matrix

- TypeScript check: pending
- Production build: pending
- DOCX open/save: pending
- XLSX open/save: pending
- PPTX open/save: pending
- CSV conversion/open/save: pending

## Rollback

Revert the resource replacement commit or restore the previous `public/web-apps` and `public/sdkjs` trees from git.
```

Expected: the notes document records exact resource provenance.

## Task 6: Minimal API Adaptation

**Files:**
- Modify: `types/editor.d.ts` only if observed payload shape changed.
- Modify: `lib/onlyoffice-editor.ts` only if observed event/command contract changed.

- [ ] **Step 1: Type-check before code adaptation**

Run from `/tmp/document-onlyoffice-9-3-worktree`:

```bash
pnpm run lint:ts
```

Expected: TypeScript either passes or fails with concrete type/API errors unrelated to vendored minified assets.

- [ ] **Step 2: Verify command contract statically**

Run from `/tmp/document-onlyoffice-9-3-worktree`:

```bash
rg -n "asc_openDocument|asc_setImageUrls|asc_onSaveCallback|asc_writeFileCallback|event: 'onSave'|event: 'writeFile'" public/web-apps/apps public/sdkjs -g '!*.min.js'
```

Expected: current `lib/onlyoffice-editor.ts` commands are still present. If any command is missing, update only the adapter code needed for the new 9.3 contract.

- [ ] **Step 3: Keep failures explicit**

If save/open/writeFile payload shape changed, update `types/editor.d.ts` and `lib/onlyoffice-editor.ts` with explicit validation and thrown errors. Do not add fallback mock success or silent no-op callbacks.

Expected: missing or invalid editor events fail visibly in console and caller promise.

## Task 7: Verification Gates

**Files:**
- Modify: `docs/onlyoffice-9.3-upgrade-notes.md`

- [ ] **Step 1: Run static gate**

Run from `/tmp/document-onlyoffice-9-3-worktree`:

```bash
pnpm run lint:ts
```

Expected: PASS.

- [ ] **Step 2: Run production build**

Run from `/tmp/document-onlyoffice-9-3-worktree`:

```bash
pnpm run build
```

Expected: PASS and `dist/` is generated.

- [ ] **Step 3: Run local browser smoke**

Run from `/tmp/document-onlyoffice-9-3-worktree`:

```bash
pnpm run dev -- --host 127.0.0.1
```

Expected: Vite serves the app. In browser console, `DocsAPI.DocEditor.version()` returns 9.3.x after API script loads.

- [ ] **Step 4: Execute document smoke matrix**

Use local fixtures or create small files:

```text
DOCX: create/open -> type text -> save -> downloaded file opens
XLSX: create/open -> edit cell -> save -> downloaded file opens
PPTX: create/open -> edit slide -> save -> downloaded file opens
CSV: open CSV -> internal XLSX conversion -> save as CSV -> downloaded file contains edited value
```

Expected: all four paths work without console errors from missing editor assets or x2t initialization.

- [ ] **Step 5: Update upgrade notes**

Update `docs/onlyoffice-9.3-upgrade-notes.md` validation matrix from `pending` to exact PASS/FAIL with command output summaries and browser smoke observations.

Expected: notes capture both automated and manual evidence.

## Task 8: Merge Back or Handoff

**Files:**
- Current dirty main worktree remains untouched until implementation result is reviewed.

- [ ] **Step 1: Review isolated diff**

Run:

```bash
git -C /tmp/document-onlyoffice-9-3-worktree status --short
git -C /tmp/document-onlyoffice-9-3-worktree diff --stat
```

Expected: diff is dominated by `public/web-apps/**` and `public/sdkjs/**`, plus upgrade notes and any minimal adapter changes.

- [ ] **Step 2: Decide integration route**

If current `/mnt/z/projects/document` still has CRLF dirty state, do not copy worktree changes into it blindly. Use one of:

```bash
git -C /tmp/document-onlyoffice-9-3-worktree diff --binary > /tmp/onlyoffice-9.3.patch
```

or commit in the isolated worktree and cherry-pick after normalizing the main worktree.

Expected: integration method preserves a reviewable diff and avoids line-ending churn.

## Self-Review

**Spec coverage:** The issue only says to upgrade to ONLYOFFICE 9.3. This plan covers source identification, pull location, vendored resource replacement, minimal adapter changes, and verification gates.

**Placeholder scan:** No implementation step uses “TBD” or unspecified “handle errors”; all commands and expected outcomes are explicit.

**Type consistency:** The adapter names match existing project code: `DocsAPI.DocEditor`, `sendCommand`, `onAppReady`, `onDocumentReady`, `onSave`, `writeFile`, `asc_openDocument`, `asc_onSaveCallback`.

