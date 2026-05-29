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

## 后续: x2t 自主构建 Pipeline (独立立项)

### Phase 0: 基线锁定与差异审计 [x] `6443117b`

- [x] **P0-1**: 审查 CryptPad v9.3.0+0 对 upstream core 的 56 文件变更 → `docs/cryptpad-delta.md`
  - 分类: must-port (14), optional-trim (8), skip (1), risk-needs-review (4)
  - 关键发现: build_tools v8.3.0.91 vs core v9.3.0.140 mismatch; native ref 8.3.3 vs wasm 9.3
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
- [ ] **P3-2**: API 迁移 → improvement ticket (旧 API verified, 不影响功能)
- [x] **P3-3**: 更新 gate → `bin/check_x2t_api_boundary.mjs`

### Phase 4: 字体管线 [x] — 9.3 字体引擎已就绪
- `libfont/engine/fonts.wasm` + `AllFonts.js`(100行) + 24 TTF
- `allfontsgen` from 9.3.1 .deb verified (`docker/Dockerfile.allfontsgen` for font expansion)

### Phase 5+6: Improvement Tickets (非核心)
- [ ] P5-3: 密码 doc smoke (x2t-api.ts supports m_sPassword, needs encrypted sample)
- [x] P5-5: CSV native x2t — `tryNativeCsvConvert()` (`bcd17600`)
- [x] P5-3: 密码 doc 基础设施 — `officecrypto-tool` + encrypted sample + scenario (`03ddc1ff`)
- [x] P5-4: 大文件 — `createLargeDocxSample` 1000 paragraphs (`861598eb`)
- [ ] P5-6: 保真度 → text extraction comparison after save
- [ ] P5-7: 并发 → multi-instance X2TConverter stress test
- [ ] P6-3: 跟进 PR (after PR #4 merged)

---

## DEFINITIVE DONE — Browser-Local 9.3 Adaptation

核心适配目标 100% 完成:
- [x] 9.3.1 editor runtime (full-vendor)
- [x] T7c/Iid/zWc save bridges (smoke-verified)
- [x] x2t WASM 9.3.0.140 (self-built, bit-identical)
- [x] 6-gate verification system
- [x] 11-scenario CDP smoke harness
- [x] Format table + FS sandbox
- [x] Documentation + provenance
