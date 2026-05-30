# ONLYOFFICE 9.3 适配 — 待办与进度

> 状态回写规则: 每完成一项更新状态为 `[x]`，每发现阻塞更新 `[!]`。
> 关键节点提交时标注 commit hash。

## 已完成: Browser-Local 9.3 Adaptation (PR #4)

- [x] L1 — Editor Runtime: full-vendor 9.3.1 web-apps/sdkjs
- [x] L2 — Adapter Bridge: T7c/Iid/zWc save hooks smoke-verified
- [x] L3 — x2t WASM: CryptPad v9.3.0+0 artifact with locateFile patch
- [x] G1 — bridge contract gate
- [x] G2 — risk gate (full-vendor + PPTX aligned)
- [x] G3 — format table gate (20 required 9.3 IDs)
- [x] G4 — FS sandbox gate (static)
- [x] G5 — path behavior gate (runtime sanitizer test)
- [x] G6 — docs/artifact consistency gate
- [x] DOCS — all docs converged to closed-plan state
- [x] SMOKE — 11/11 PASS, 0 failures

提交基线: `984c8df5`

---

## Claim Boundary — 宣称边界

> 以下定义了本项目 "ONLYOFFICE 9.3 browser-local adaptation" 的完成边界。
> 每一项完成声明必须有对应证据（gate / CDP smoke / Playwright E2E / hash provenance / 源码 diff 审计）。
> 没有证据的只能写 claim boundary，不能宣称完成。

### 项目定位

本项目是一个 **browser-local ONLYOFFICE editor**，不是 DocumentServer 复刻。
合理宣称范围：内置 9.3 runtime + adapter bridge + x2t 9.3 WASM 在浏览器本地
打开、编辑、保存主路径可用，关键风险有 gate/smoke/E2E/provenance 覆盖。

### 四个不变量

| # | 不变量 | 验证方式 |
|---|--------|---------|
| 1 | **版本同源** — Editor runtime 9.3.1，x2t 对齐 core v9.3.0.140，格式 ID/字体入口/save hook 不含 7.x | gate:format_table, gate:docs_consistency, smoke 11/11 |
| 2 | **主链闭环** — 新建/打开/编辑/保存 DOCX/XLSX/PPTX/CSV 可用，失败时显式失败 | CDP smoke 11/11, Playwright E2E 5/5 |
| 3 | **本地安全边界** — x2t WASM 只写受控 /working 路径，文件名/字体路径/格式参数不能任意 FS path 或 XML 注入 | gate:fs_sandbox, gate:path_behavior, gate:api_boundary |
| 4 | **证据先于声明** — 每个完成项至少一个证据 | 见下方证据矩阵 |

### 可以宣称完成的

| 项 | 证据 |
|----|------|
| Editor Runtime 9.3.1 full-vendor (web-apps/sdkjs) | version check smoke/E2E, .deb extraction provenance |
| Adapter Bridge 主链 (T7c/Iid/zWc save hooks) | 11/11 CDP smoke save scenarios |
| x2t 9.3 WASM artifact (core v9.3.0.140) | bit-identical self-build, `docs/cryptpad-delta.md` |
| 7-gate verification system | `pnpm run gate:onlyoffice` all PASS |
| 11-scenario CDP smoke harness | `pnpm run smoke:onlyoffice` 11/11 PASS |
| Playwright E2E 6/6 PASS | `pnpm run test:e2e:smoke` 6/6 PASS |
| DOCX/XLSX 下载捕获 + 内容验证 | 6/6 PASS: DOCX (25429 bytes + typed text), XLSX (7854 bytes) |
| convertLocal 真转换 (空 bin → DOCX, 9024 bytes) | E2E test |
| maxInputBytes 边界拒绝 | E2E test |
| x2t build pipeline 入库 | `tools/x2t-wasm/` (Dockerfile + scripts + provenance.json), 待 repo 内重跑验证 |
| 生产路径决策: P1 migration deferred | 双 X2TConverter 实例冲突; 旧主链保留, x2t-api.ts 为 optional API |

### 不能宣称完成的

| 项 | 原因 | 后续 |
|----|------|------|
| **full DocumentServer API compatibility** | /converter, /command, callback status 2/3/6/7 不属于 browser-local editor 范围 | 独立立项 P6 |
| **all ONLYOFFICE 9.3 formats supported** | FB2/OFD 已知未链接; HWP/VSDX/iWork 等未验证 | P4 扩展格式 |
| **full font fidelity** | manifest.json / hash-lock / WOFF2 策略 / CJK/RTL/emoji 未闭环 | 独立立项 P5 |
| **PDF export** | 字体管线未完成, PDF 输出质量未验证 | P5 后 |
| **repo-owned x2t build pipeline** | 当前 `/tmp/cryptpad-x2t` 自构建成功但未入库 `tools/x2t-wasm/` | 独立立项 P4 |

### 验证命令

```bash
pnpm run verify:onlyoffice9      # gates + build + 11/11 CDP smoke
pnpm run test:e2e:smoke          # 5/5 Playwright E2E
pnpm run verify:onlyoffice9:e2e  # both of the above
```

### 核心取舍

> 不为了"架构统一"强迁移生产路径到 x2t-api.ts。
> 保留已验证的旧主链 (lib/document-converter.ts)，
> 把 x2t-api.ts 定位为可选受控 API 和未来重构入口。

---

## 后续: x2t 自主构建 Pipeline (独立立项)

### Phase 0: 基线锁定与差异审计 [x] `6443117b`

- [x] **P0-1**: 审查 CryptPad v9.3.0+0 对 upstream core 的 56 文件变更 → `docs/cryptpad-delta.md`
  - 分类: must-port (14), optional-trim (8), skip (1), risk-needs-review (4)
  - 关键发现: build_tools v8.3.0.91 vs core v9.3.0.140 mismatch (known CryptPad quirk,不影响 bit-identical 构建); native ref 8.3.3 vs wasm 9.3
- [x] **P0-2**: 提取 CryptPad 构建依赖清单 → 已内嵌在 `docs/cryptpad-delta.md` 的 Dependency Chain 节
  - emsdk 4.0.11, build_tools v8.3.0.91, Ubuntu 22.04, qmake6
  - 21 个依赖库逐阶段构建
- [x] **P0-3**: 审查 CryptPad 裁剪决策 → `docs/cryptpad-delta.md` Critical Findings #6-#7
  - Fb2File/OFDFile 从 link deps 中移除 — 这两个格式在 WASM artifact 中不可用
  - Dockerfile 中 3 个 sed 修改 (isatty/duplicate freetype/duplicate zlib) 都是防重复符号
- [x] **P0-4**: 审查 wrap-main.cpp → `docs/cryptpad-delta.md` Critical Findings #5
  - `main1(char* xmlPath)` → `main(2, argv)`，无错误处理/生命周期/FS 清理
  - 当前 `lib/document-converter.ts` 已处理 JS 侧关注点

### Phase 1+2 合并: Docker 构建 x2t WASM [x] `b9c442b6`

**策略**: CryptPad Dockerfile 的 `fb2file`/`log-symbols` 损坏引用不在 `build→output` 链上，直接 `docker build --target output` 可跳过。28 个库阶段全部在依赖链中。Native 和 WASM 编译共享同一 Dockerfile 前几个阶段。

- [x] **P12-1**: 执行 `docker build --target output -o build .` — ✅ 完成 `b9c442b6` (1h10m)
  - 修复: Dockerfile 用预构建 `emscripten/emsdk:4.0.11` 替代 git clone + `./emsdk install`
  - mirror `docker.1ms.run` 就绪; ubuntu:22.04 + emsdk 镜像成功拉取
  - 现场: /tmp/docker-build.log 696KB, 28 库阶段进行中
  - 工作目录: `/tmp/cryptpad-x2t`
  - 预计耗时: 1-2h (28 个静态库 + Emscripten 链接)
  - 产物: `x2t.js`, `x2t.wasm`, `x2t.wasm.br`, `x2t.zip`
- [x] **P12-2**: 验证 WASM 产物 — bit-identical to CryptPad pre-built, `_main1`/`ccall`/`FS` OK
- [x] **P12-3**: 重新应用 `locateFile` patch — confirmed applied, no `currentScript.getAttribute`
- [x] **P12-4**: 跑 11-scenario smoke 验证 — 11/11 PASS, 0 failures
- [x] **P12-5**: 更新 docs 和 gate 中的 hashes — gz hash 已更新, wasm/br/js unchanged (bit-identical)
- [x] **P12-6**: 验证 x2t XML 参数契约 — ✅ matches X2tConverter/README.md (m_sFileFrom/To, m_nFormatFrom/To, m_sAllFontsPath/m_sFontDir)
- [x] **P12-7**: 格式枚举与 `OfficeFileFormats.h` 交叉验证 — ✅ hex scheme (0x0040 base), all 20 IDs match

### 原 Phase 1: Native x2t (已合并到 P12 — Docker 容器内验证)
### 原 Phase 2: WASM 构建 (已合并到 P12)

### Phase 3: API Wrapper 收敛

- [x] **P3-1**: 设计受控 `X2TConvertOptions` / `X2TConvertResult` 接口 → `lib/x2t-api.ts` (`bc01dbdf`)
  - `initX2T(options?)` + `convertLocal(request)` — 无裸 FS/ccall 暴露
  - 支持: password/codePage/delimiter/formatFrom/formatTo/fontsManifestPath/fontsDir
- [x] **P3-3**: 更新 gate → `bin/check_x2t_api_boundary.mjs`
- [x] **P0-API**: x2t-api.ts boundary → maxInputBytes enforced, font path validated (`37b86f57`)

### P1: 生产路径迁移 (P3-2) — DEFERRED/REJECTED for now
- [~] 让 `lib/converter.ts` / `lib/document-converter.ts` 主链走 `x2t-api.ts`
  - **Why reverted**: 双 X2TConverter 实例冲突 (converter.ts 用 singleton，x2t-api.ts 用独立 new X2TConverter())，
    第二个实例无法复用 warm window.Module（onRuntimeInitialized 已触发）。
  - **Current state**: 旧主链保留，x2t-api.ts 作为可选 API 受 gate 保护。
  - **Revisit条件**: X2TConverter 重构为真正的全局 singleton 或在 worker 中跑 x2t。
- [x] Gate：不再允许业务边界直接 FS.writeFile 或 ccall('main1') — api boundary gate 已收窄为仅保护可选 API

### P2: Repo-owned x2t build [~] — pipeline 已入库, 待重跑验证
- [x] 把 `/tmp/cryptpad-x2t` 构建上下文变成 `tools/x2t-wasm/` (`ea82fe83` follow-up)
  - Dockerfile + embuild.sh + build.sh + pre-js.js + wrap-main.cpp + patches/harfbuzz.patch
  - `scripts/clone-core.sh` — fetch ONLYOFFICE/core at v9.3.0.140
  - `scripts/verify-artifact.sh` — cross-check build output against `public/wasm/x2t/` hashes
  - `provenance.json` — build metadata, patch list, artifact sha256
  - `.gitignore` excludes `core/` (686MB)
- [ ] 从 repo 内复跑完整 build (预计 1-2h, 需要 Docker + 686MB core clone)
- [x] CryptPad diff 分类: must-port / trim / risk / local-patch — 见 `docs/cryptpad-delta.md`

### P3: 字体管线补齐
- [ ] 9.3 同源工具生成 AllFonts.js + manifest.json + hash-lock.json
- [ ] WOFF2 策略 + CJK/RTL/emoji 验证 (9.0.4 已加入 WOFF2)

### P4: 扩展格式与转换 API
- [ ] Conversion API 兼容层 (/converter, shardkey, 错误码 -1..-10)
- [ ] 密码文档 E2E, CSV native hard-fail 模式

### Phase 4: 字体管线 [x] — 9.3 字体引擎已就绪
- `libfont/engine/fonts.wasm` + `AllFonts.js`(100行) + 24 TTF
- `allfontsgen` from 9.3.1 .deb verified (`docker/Dockerfile.allfontsgen` for font expansion)

### Phase 5+6: Improvement Tickets (核心完成) [x]

- [x] P5-5: CSV native x2t — `tryNativeCsvConvert()` (`bcd17600`)
- [x] P5-3: 密码 doc 基础设施 — `officecrypto-tool` + encrypted sample + scenario (`03ddc1ff`)
- [x] P5-4: 大文件 — `createLargeDocxSample` 1000 paragraphs (`861598eb`)
- [x] P5-6/P5-7: Playwright E2E — `tests/e2e/onlyoffice-9.3-fidelity.spec.ts` + `playwright.config.ts` (`cd84d29a`)
  - 6/6 PASS: DOCX (typed text verified), convertLocal (9024 bytes), maxInputBytes rejection, XLSX (7854 bytes), second context DOCX, 9.3.1 version

---

## 剩余待办 — 按优先级排序

> 所有项均为独立可推进。状态标记: `[ ]` 待做, `[~]` 进行中, `[x]` 完成, `[!]` 阻塞。

### R1: 密码文档 E2E [ ] — 优先级最高

**目标**: Playwright 验证加密 DOCX 的打开/解密/保存全链路。

**现有基础设施**:
- `officecrypto-tool` npm 包已安装 (`package.json:64`)
- `bin/onlyoffice-smoke/samples.mjs` 已有 `createPasswordProtectedDocx()` (密码: `onlyoffice-9.3-test`)
- `lib/x2t-api.ts` 已支持 `m_sPassword` 参数
- CDP smoke 已有 `.protected.docx` scenario

**待做**:
- [ ] **R1-1**: 在 E2E spec 中新增 `open password-protected DOCX` 测试
  - 用 `officecrypto-tool` 在测试中生成加密 DOCX 或使用 smoke 的 sample server
  - 调用 `convertLocal({ password: 'onlyoffice-9.3-test' })` 解密并转换
  - 验证输出内容与原文匹配
- [ ] **R1-2**: 验证错误密码被正确拒绝
  - 错误密码 → x2t 返回非零错误码 → convertLocal 抛错
- [ ] **R1-3**: 通过后更新 Claim Boundary can-claim 表

**预计耗时**: 1-2h

---

### R2: 字体管线补齐 [ ] — manifest + hash-lock + 验证

**目标**: 将字体从"可用资源"升级为"已验证管线"。

**现有基础设施**:
- 24 TTF 字体 (`public/fonts/`) — Liberation(4) + DejaVu(8) + Noto CJK(8) + Comic Neue(4)
- `AllFonts.js` — 100 行手动编写, 9.3 兼容 `__all_fonts_js_version__ = 2`
- `docker/Dockerfile.allfontsgen` — 从 Nextcloud 构建 allfontsgen 工具
- 9.3.1 .deb 中包含预编译 allfontsgen

**待做**:
- [ ] **R2-1**: 生成 `fonts/manifest.json`
  - 字段: family, style, weight, stretch, coverage (Latin/CJK/RTL/emoji), license, source
  - 24 个现有字体逐项填写
  - 标注 CJK 覆盖: Noto Sans/Serif SC/TC/JP/KR (8 fonts, variable)
- [ ] **R2-2**: 生成 `fonts/hash-lock.json`
  - 每个 TTF 的 sha256
  - AllFonts.js 的 sha256
  - lock 文件自身的 schema version
- [ ] **R2-3**: WOFF2 策略文档
  - 评估: 当前 TTF 直接 serving，WOFF2 可减少 ~40% 体积
  - 9.0.4 已加入 WOFF2 支持 — 确认 9.3.1 字体引擎是否支持 WOFF2
  - 决策: 是否转换为 WOFF2（增加构建步骤但减少加载时间）
- [ ] **R2-4**: CJK/RTL/emoji 验证清单
  - CJK: Noto Sans/Serif SC 渲染测试 (中文简体)
  - Emoji: 当前字体集无 emoji font — 是否需要?
  - RTL: 当前字体集无 Arabic/Hebrew — 是否需要?
- [ ] **R2-5**: `bin/verify-font-pack.mjs` 脚本
  - 检查 manifest.json 中所有字体文件存在
  - 检查 hash-lock.json 与实际 sha256 一致
  - 检查 AllFonts.js 中声明的字体都在 fonts/ 目录中
- [ ] **R2-6**: 如需要扩展字体 (emoji/RTL/Arabic)
  - 用 `docker/Dockerfile.allfontsgen` 或 .deb allfontsgen 重新生成 AllFonts.js
  - 更新 manifest + hash-lock
- [ ] **R2-7**: 通过后更新 Claim Boundary — 字体管线从 cannot-claim 移至 can-claim

**预计耗时**: 2-4h。核心是 R2-1/R2-2/R2-5（自动化 script），R2-6 是可选扩展。

**参考**:
- allfontsgen 参数: `--input=<font-dir> --allfonts-web=<AllFonts.js> --images=<dir> --selection=<font_selection.bin> --output-web=<fonts-dir> --use-system=true`
- allfontsgen 来源: DocumentServer .deb 的 `server/tools/allfontsgen` 或 Nextcloud `documentserver_community`

---

### R3: Repo x2t 构建验证 [ ] — P2 收尾

**目标**: 从 `tools/x2t-wasm/` 完整复跑构建，确认 bit-identical 输出。

**现有基础设施**:
- `tools/x2t-wasm/` — Dockerfile + patches + scripts + provenance.json (`c7133e53`)
- `scripts/clone-core.sh` — 拉取 ONLYOFFICE/core v9.3.0.140
- `scripts/verify-artifact.sh` — 比对构建产物与 `public/wasm/x2t/` sha256
- `/tmp/cryptpad-x2t/` 成功自构建证据 (1.1GB, 包含 686MB core)

**待做**:
- [ ] **R3-1**: 执行 `cd tools/x2t-wasm && ./scripts/clone-core.sh`
  - 从 GitHub 拉取 ONLYOFFICE/core v9.3.0.140 (~686MB)
  - 需网络连接
- [ ] **R3-2**: 执行 `docker build --target output -o build .`
  - 28 个库阶段 + Emscripten 链接 (~1-2h)
  - 验证 emsdk 4.0.11 镜像可用
  - 验证 mirror `docker.1ms.run` 可用 (如 Docker Hub 不可达)
- [ ] **R3-3**: 执行 `./scripts/verify-artifact.sh build/`
  - x2t.js sha256 必须匹配 `e0abb599...`
  - x2t.wasm sha256 必须匹配 `e166c252...`
  - x2t.wasm.br sha256 必须匹配 `8dfeb638...`
  - x2t.wasm.gz 允许差异 (gzip 时间戳不定)
- [ ] **R3-4**: 如果 bit-identical 确认，更新 todo.md P2 为 [x]
- [ ] **R3-5**: 如果 hash 不匹配，记录差异并分析原因 (编译器版本/emsdk 版本/时间戳)
- [ ] **R3-BLOCKER**: 需要 Docker 环境 + 686MB 磁盘空间 + 稳定网络

**预计耗时**: 2-4h（大部分是 Docker 构建等待 + clone 时间）

---

### R4: XLSX 内容验证 + DOCX/XLSX 并发 [ ]

**目标**: XLSX E2E 质量对齐 DOCX（内容验证），恢复并发测试。

**现有基础设施**:
- XLSX 下载捕获通过 (7854 bytes)
- DOCX 下载 + 内容验证通过 (25429 bytes, typed text in word/document.xml)
- `extractFileFromZip()` 已实现

**待做**:
- [ ] **R4-1**: XLSX 内容验证
  - 在 XLSX 测试中插入数据
  - 保存后解包 XLSX，检查 `xl/worksheets/sheet1.xml` 包含输入值
  - 注意: `frame.Api` 不可用（诊断证实），需使用 `Asc.editor` API 或 CDP userGesture 方式
- [ ] **R4-2**: 恢复 DOCX/XLSX 并发测试
  - 原问题: XLSX `waitForEditorReady` 在第二上下文超时
  - 修复后 (Asc.editor.asc_Save 检测) 可尝试
  - 两个独立 browser context 同时打开 DOCX + XLSX
  - 验证两者都成功加载并保存
- [ ] **R4-3**: 通过后更新 E2E 计数

**预计耗时**: 1-2h

---

### R5: Conversion API 兼容层 [ ] — 独立立项, 低优先级

**目标**: 可选 — 提供与 DocumentServer `POST /converter` 兼容的 API 层。

**背景**: 当前项目定位是 browser-local editor，Conversion API 是服务器端关注点。
如果未来需要 headless 模式或 server-side 部署，再启动此项目。

**x2t-api.ts 已覆盖的核心参数** (对照 DocumentServer 9.3 `/converter` API):

| 参数 | 支持 | 说明 |
|------|:---:|------|
| `filetype` | ✅ | inputName 扩展名自动检测 |
| `outputtype` | ✅ | outputName 扩展名 |
| `password` | ✅ | m_sPassword |
| `codePage` | ✅ | CSV/TXT 编码 |
| `delimiter` | ✅ | CSV 分隔符 (0=none, 1=tab, 2=;, 3=:, 4=,, 5=space) |
| `async` | ❌ | 异步转换 (需 Web Worker) |
| `key` | ❌ | 缓存 key (WASM 内不需要) |
| `url` | ❌ | 远程 URL 下载 (需 fetch 层) |
| `token` | ❌ | JWT 认证 |
| `thumbnail` | ❌ | 缩略图 |
| `watermark` | ❌ | 水印 |
| `region` | ❌ | 本地化 |
| `pdf` / `documentLayout` / `spreadsheetLayout` | ❌ | 布局控制 |

**DocumentServer 标准错误码**:
`-1`未知, `-2`超时, `-3`转换, `-4`下载, `-5`密码, `-6`数据库, `-7`输入, `-8`令牌, `-9`密码缺失, `-10`过大

**待做** (如决定推进):
- [ ] **R5-1**: 设计 API 接口 (`POST /converter` JSON → 文件 ID)
- [ ] **R5-2**: `async` 模式 (Web Worker)
- [ ] **R5-3**: `url` 远程下载 + `token` 认证
- [ ] **R5-4**: 错误码映射 (x2t 返回码 → -1..-10)
- [ ] **R5-5**: `thumbnail` / `watermark` / 布局参数
- [ ] **R5-6**: 全格式输入/输出验证 (65+ 格式)

**建议**: 作为独立仓库 `document-conversion-service`。**暂不纳入当前迭代。**

**预计耗时**: 独立大项目 (40-80h)

---

### R6: 跟进 PR [ ] — after PR #4 merged

- [ ] 整理 PR 描述 (完整提交历史 + Claim Boundary)
- [ ] 确保 CI 可跑 `pnpm run verify:onlyoffice9 && pnpm run test:e2e:smoke`
- [ ] 处理 PR review 反馈
- [ ] 合并后关闭相关 issue

---

## DEFINITIVE DONE — Browser-Local 9.3 Adaptation

核心适配目标 100% 完成:
- [x] 9.3.1 editor runtime (full-vendor)
- [x] T7c/Iid/zWc save bridges (smoke-verified)
- [x] x2t WASM 9.3.0.140 (self-built, bit-identical)
- [x] 7-gate verification system
- [x] 11-scenario CDP smoke harness
- [x] 6/6 Playwright E2E (DOCX content + convertLocal + XLSX download)
- [x] Documentation + Claim Boundary + provenance
