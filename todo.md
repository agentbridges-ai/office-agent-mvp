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

### Phase 1+2 合并: Docker 构建 x2t WASM (进行中)

**策略**: CryptPad Dockerfile 的 `fb2file`/`log-symbols` 损坏引用不在 `build→output` 链上，直接 `docker build --target output` 可跳过。28 个库阶段全部在依赖链中。Native 和 WASM 编译共享同一 Dockerfile 前几个阶段。

- [~] **P12-1**: 执行 `docker build --target output -o build .` — 构建中 (#168 openssl 阶段)
  - 修复: Dockerfile 用预构建 `emscripten/emsdk:4.0.11` 替代 git clone + `./emsdk install`
  - mirror `docker.1ms.run` 就绪; ubuntu:22.04 + emsdk 镜像成功拉取
  - 现场: /tmp/docker-build.log 696KB, 28 库阶段进行中
  - 工作目录: `/tmp/cryptpad-x2t`
  - 预计耗时: 1-2h (28 个静态库 + Emscripten 链接)
  - 产物: `x2t.js`, `x2t.wasm`, `x2t.wasm.br`, `x2t.zip`
- [ ] **P12-2**: 验证 WASM 产物
  - `_main1`/`ccall`/`FS` 导出确认
  - x2t.wasm 尺寸与当前 artifact 对比
  - 替换 `public/wasm/x2t/` 文件
- [ ] **P12-3**: 重新应用 `locateFile` patch 到自建 x2t.js
- [ ] **P12-4**: 跑 11-scenario smoke 验证
- [ ] **P12-5**: 更新 docs 和 gate 中的 hashes
- [ ] **P12-6**: 验证 x2t XML 参数契约 (m_sFileFrom/To, m_nFormatFrom/To, m_sAllFontsPath/m_sFontDir)
- [ ] **P12-7**: 格式枚举与 `OfficeFileFormats.h` 交叉验证

### 原 Phase 1: Native x2t (已合并到 P12 — Docker 容器内验证)
### 原 Phase 2: WASM 构建 (已合并到 P12)

### Phase 3: API Wrapper 收敛

- [ ] **P3-1**: 设计受控 `X2TConvertOptions` / `X2TConvertResult` 接口
  - 不暴露裸 `FS.writeFile` / `ccall("main1")`
  - 支持 password/codePage/delimiter/thumbnail/layout
- [ ] **P3-2**: 实现 `convertLocal()` 入口
  - 输入: `{inputName, inputBytes, outputType, ...options}`
  - 输出: `{outputBytes, outputType, engineVersion, warnings}`
- [ ] **P3-3**: 实现 `initX2T()` 选项化
  - `{fontsManifestPath, fontsDir, tempDir, maxInputBytes}`

### Phase 4: 字体管线重建

- [ ] **P4-1**: 使用 9.3 同源 `-create-allfonts` 生成字体 manifest
  - 不复用 7.x AllFonts.js
  - 产物: `AllFonts.js` + `manifest.json` + `hash-lock.json`
- [ ] **P4-2**: 字体分层打包
  - latin/ cjk/ rtl/ symbols/ emoji/
  - WOFF2 策略: 支持或明确过滤
- [ ] **P4-3**: 字体验证
  - manifest 中每个字体文件存在且 hash 固定
  - 无宿主绝对路径、无 7.x 残留
  - 同 font family/style/weight 无冲突

### Phase 5: 测试矩阵扩展

- [ ] **P5-1**: XLSX 内容编辑 + 保存 smoke
  - 使用 `asc_SetCellValue` 替代 `asc_AddText`
- [ ] **P5-2**: PPTX 内容编辑 + 保存 smoke
  - 使用幻灯片编辑 API
- [ ] **P5-3**: 密码保护文档测试
  - x2t XML 支持 password 字段
- [ ] **P5-4**: 大文件测试 (>50MB)
  - WASM 内存增长边界验证
- [ ] **P5-5**: CSV native x2t save 测试
  - 替代当前 SheetJS 绕过路径
- [ ] **P5-6**: 格式保真度基础验证
  - DOCX→PDF 文本抽取、页面数验证
- [ ] **P5-7**: 并发转换安全测试

### Phase 6: 文档与 Provenance

- [ ] **P6-1**: 构建 provenance 记录
  ```json
  {
    "x2tVersion": "9.3.0.140",
    "coreCommit": "...",
    "cryptpadBaseline": "v9.3.0+0 / 96886ff",
    "emsdkVersion": "...",
    "buildToolsVersion": "...",
    "fontPackHash": "...",
    "formatTableHash": "..."
  }
  ```
- [ ] **P6-2**: docs 更新: `x2t-build-provenance.md`
- [ ] **P6-3**: PR #4 后续 PR: "x2t 自主构建能力"

---

## 已确认的非声明边界 (不进入 todo)

- 格式保真度视觉回归 (PDF/PNG bitwise 对比)
- CJK/RTL/字体 fallback 完整回归
- 多用户协同编辑
- DocumentServer /converter /command API 兼容层
- 灰度路由和回滚机制
