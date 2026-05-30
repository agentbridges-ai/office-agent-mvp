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
| Playwright E2E 9/9 PASS | `pnpm run test:e2e:smoke` — DOCX typed-text + convertLocal + XLSX structure + concurrent + password decrypt/reject + version |
| DOCX/XLSX 下载捕获 + 内容验证 | 6/6 PASS: DOCX (25429 bytes + typed text), XLSX (7854 bytes) |
| convertLocal 真转换 (空 bin → DOCX, 9024 bytes) | E2E test |
| maxInputBytes 边界拒绝 | E2E test |
| 密码文档解密 + 错误密码拒绝 | E2E test: decrypt 1248 bytes, wrong password → x2t error code 91 |
| 字体管线 (manifest + hash-lock + verify) | `fonts/manifest.json` + `fonts/hash-lock.json` + `bin/verify-font-pack.mjs`, 24 match 0 mismatch |
| x2t build pipeline 验证 | `tools/x2t-wasm/` — WASM bit-identical (347 steps, x2t.wasm/x2t.wasm.br MATCH) |
| 生产路径决策: P1 migration deferred | 双 X2TConverter 实例冲突; 旧主链保留, x2t-api.ts 为 optional API |

### 不能宣称完成的

| 项 | 原因 | 后续 |
|----|------|------|
| **full DocumentServer API compatibility** | /converter, /command, callback status 2/3/6/7 不属于 browser-local editor 范围 | 独立立项 P6 |
| **all ONLYOFFICE 9.3 formats supported** | FB2/OFD 已知未链接; HWP/VSDX/iWork 等未验证 | P4 扩展格式 |
| **full font fidelity** | ~~was: manifest/hash-lock/WOFF2/CJK/RTL missing~~ | R2 completed: manifest + hash-lock + verify; emoji/RTL expansion deferred |
| ~~repo-owned x2t build pipeline~~ | ~~was: /tmp only~~ | R3 verified: WASM bit-identical, JS glue non-deterministic (Emscripten), patch series for vanilla core deferred |

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

### P2: Repo-owned x2t build [x] — pipeline 已验证, WASM bit-identical

- [x] 把 `/tmp/cryptpad-x2t` 构建上下文变成 `tools/x2t-wasm/` (`c7133e53`)
  - Dockerfile + embuild.sh + build.sh + pre-js.js + wrap-main.cpp + patches/harfbuzz.patch
  - `scripts/clone-core.sh` / `scripts/build-with-core.sh` / `scripts/verify-artifact.sh`
  - `provenance.json` — build metadata, patch list, artifact sha256
  - `.gitignore` excludes `core/` (668MB)
- [x] 从 repo 复跑构建确认 (`db69e0ae`)
  - 构建方式: `docker build --file tools/x2t-wasm/Dockerfile --target output -o tools/x2t-wasm/build /tmp/cryptpad-x2t`
  - **x2t.wasm**: bit-identical ✅ `e166c252...`
  - **x2t.wasm.br**: bit-identical ✅ `8dfeb638...`
  - **x2t.js**: mismatch ⚠️ — Emscripten JS glue 非确定性，功能等价
- [x] CryptPad diff 分类: must-port / trim / risk / local-patch — 见 `docs/cryptpad-delta.md`
- [ ] 长期待做: 将 CryptPad 56 文件变更制成 patch series，使 vanilla ONLYOFFICE/core 可直接构建

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

### R1: 密码文档 E2E [x] — 完成 `cd84d29a+`

**目标**: Playwright 验证加密 DOCX 的打开/解密/保存全链路。

**现有基础设施**:

**待做**:
- [x] **R1-1**: 在 E2E spec 中新增 `open password-protected DOCX` 测试
  - ✅ `convertLocal({ password })` 成功解密: 1248 bytes decrypted.docx
  - `lib/x2t-api.ts` `m_sPassword` XML 参数注入验证通过
- [x] **R1-2**: 验证错误密码被正确拒绝
  - ✅ 错误密码 → x2t 返回 error code 91 → convertLocal 正确抛错
- [x] **R1-3**: 通过后更新 Claim Boundary can-claim 表

---

### R2: 字体管线补齐 [x] — manifest + hash-lock + 验证 完成

- [x] **R2-1**: `fonts/manifest.json` — 24 fonts, family/style/weight/coverage/license/source
  - 19 registered (in AllFonts.js), 5 unregistered (on disk, available)
  - Coverage: Latin/Cyrillic/Greek complete, CJK (SC/TC/JP/KR) complete, Arabic/Hebrew basic (DejaVu)
- [x] **R2-2**: `fonts/hash-lock.json` — sha256 for all 24 TTF files (24 match, 0 mismatch)
- [x] **R2-3**: WOFF2 strategy — documented in manifest.json: not converted, evaluate during next font refresh. 9.3.1 supports WOFF2.
- [x] **R2-4**: CJK/RTL/emoji — documented in manifest.json coverageSummary
  - CJK: complete (Noto Sans/Serif SC/TC/JP/KR variable fonts)
  - Emoji: NOT covered (no emoji font)
  - RTL: DejaVu Sans has basic Arabic/Hebrew glyphs
- [x] **R2-5**: `bin/verify-font-pack.mjs` — 3 checks: manifest font presence, hash-lock integrity, AllFonts.js references. PASSES.
- [ ] **R2-6** (optional): Expand fonts (emoji/RTL/Arabic) — deferred, not blocking
- [x] **R2-7**: Claim Boundary updated

**验证**: `node bin/verify-font-pack.mjs --root .` → 24 match, 0 mismatch

---

### R3: Repo x2t 构建验证 [x] — 完成

- [x] **R3-1**: CryptPad core 确认可用 (668MB, 含 6 个 empty stub + 56 文件变更)
- [x] **R3-2**: `docker build --file tools/x2t-wasm/Dockerfile --target output -o tools/x2t-wasm/build /tmp/cryptpad-x2t` — 347 steps (全部 CACHED), 输出 59.5MB
- [x] **R3-3**: sha256 验证:
  - ✅ x2t.wasm: MATCH `e166c252...` (bit-identical)
  - ✅ x2t.wasm.br: MATCH `8dfeb638...` (bit-identical)
  - ⚠️ x2t.js: MISMATCH — Emscripten JS glue 非确定性 (时间戳/随机 ID), WASM 二进制完全一致
- [x] **R3-4**: P2 标记完成 — WASM 二进制 bit-identical 确认
- [x] **R3-5**: 差异已记录 — JS glue 差异源于 Emscripten 构建非确定性，不影响功能

**关键发现**: Dockerfile 需要 CryptPad 的 modified core (含 6 个 `_empty.cpp` stub)，vanilla ONLYOFFICE/core v9.3.0.140 不可直接使用。长期需将 56 文件变更制作为 patch series，或追踪 CryptPad 的 core fork。

---

### R4: XLSX 内容验证 + DOCX/XLSX 并发 [x] — 完成

- [x] **R4-1**: XLSX 结构验证 — `xl/worksheets/sheet1.xml` 提取成功 (1476 chars), 包含 `<worksheet>` / `<sheetData>`
  - Note: `frame.Api` 不可用 (诊断已证实), 数据插入需 CDP userGesture 方式 — deferred
- [x] **R4-2**: DOCX/XLSX 并发测试 — 两个独立 browser context 并行打开 (1.9s), 两者都成功加载
- [x] **R4-3**: E2E 计数更新 — 9/9 PASS

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
