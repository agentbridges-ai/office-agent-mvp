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

### Phase 0: 基线锁定与差异审计

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

### Phase 1: Native x2t 编译验证

- [ ] **P1-1**: 在 Linux native 编译 ONLYOFFICE/core v9.3.0.140 的 x2t
  - 参考: CryptPad Dockerfile 依赖链
  - 验证: `./x2t /tmp/convert.xml` 对 DOCX→PDF/XLSX→PDF 退出 0
- [ ] **P1-2**: 验证 x2t XML 参数契约
  - m_sFileFrom/m_sFileTo/m_nFormatFrom/m_nFormatTo 必填
  - m_sAllFontsPath/m_sFontDir/m_bDontSaveAdditional 可选
  - 格式枚举与 OfficeFileFormats.h 一致

### Phase 2: WASM 构建

- [ ] **P2-1**: 基于 CryptPad Dockerfile 重建 Emscripten 构建
  - 固定 emsdk 版本并记录
  - 确认 build_tools 版本 (CryptPad 用 v8.3.0.91 vs core v9.3.0.140 可能有 mismatch)
  - 编译参数: USE_ICU, ALLOW_MEMORY_GROWTH, Closure Compiler, ERROR_ON_UNDEFINED_SYMBOLS=0
- [ ] **P2-2**: 验证 WASM 产物
  - `_main1` 导出、`ccall`、`FS` 可用
  - x2t.wasm 尺寸对比、Brotli 压缩
- [ ] **P2-3**: 替换当前 CryptPad artifact 为自建产物
  - 更新 `public/wasm/x2t/` 文件
  - `locateFile` patch 重新应用
  - 更新 docs 和 gate 中的 hashes

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
