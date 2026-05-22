# ONLYOFFICE 9.3 适配影响边界分析

## 目标输入

- Issue: https://github.com/agentbridges-ai/document/issues/1
- Issue 标题: 升级到onlyoffice-9.3版本
- 目标版本: 9.3 系列，默认先适配 `v9.3.1`
- 当前基线: `web-apps 7.4.1` + `sdkjs 7.5.0`
- 执行计划: `docs/superpowers/plans/2026-05-20-onlyoffice-9-3-adaptation.md`

## 控制拓扑

### 总体设计部

本轮总体设计部由当前适配任务承担，负责维护以下事实:

- 9.3 适配目标不能漂移到 9.4。
- 当前项目仍是纯前端、本地浏览器编辑器。
- 资源替换必须可回滚、可审计、可验证。
- 当前主工作树存在 CRLF 噪声，不能直接作为资源替换执行面。

### 控制结构

| 层级 | 本轮权限 | 说明 |
| --- | --- | --- |
| 上游资源层 | 可观测、可平行拉取 | 拉取 ONLYOFFICE 9.3.1 资源到 `/tmp`，不直接混入项目 |
| vendored runtime 层 | 可替换 | `public/web-apps/**`、`public/sdkjs/**`、必要时 `public/wasm/x2t/**` |
| 项目适配层 | 最小修改 | 只在 9.3 事件或 payload 变化时修改 `lib/onlyoffice-editor.ts` 和 `types/editor.d.ts` |
| 应用业务层 | 默认冻结 | 不改 URL 参数、上传入口、PWA 逻辑、UI 主流程 |
| CI/发布层 | 默认冻结 | 不改 GitHub Actions、Docker、release 流程 |

### 跨模块协调

主要耦合链路:

```text
index.ts / lib/converter.ts
  -> lib/onlyoffice-editor.ts
  -> public/web-apps/apps/api/documents/api.js
  -> public/web-apps/apps/{documenteditor,spreadsheeteditor,presentationeditor}/main/*
  -> public/sdkjs/{word,cell,slide,common}/**
  -> public/wasm/x2t/**
```

任一资源层变动都可能外溢到:

- 编辑器 iframe 初始化
- `sendCommand` 命令名
- `onSave` / `writeFile` 事件 payload
- 文档打开、保存、转换
- 字体、主题、图标、locale、CSS 路径解析

### 冻结边界

本轮默认冻结:

- URL 参数契约: `locale`、`src`、`file`
- 公开导出 API: `lib/converter.ts` 当前导出面
- PWA 与 service worker 策略
- Docker 与 CI 配置
- 项目 README 的使用语义
- 安全策略: 不添加 mock 成功、不吞错、不静默 fallback

解冻条件:

- 9.3 资源确实改变了对应契约。
- 有最小复现或静态证据证明必须改。
- 修改后能通过对应 L0/L1/L2 验证。

## 控制面 / 数据面 / 状态面

### 主落点: 数据面

本次升级主要改动用户实际编辑数据的执行路径:

- 文档二进制加载到编辑器
- 编辑器内编辑状态
- 保存事件导出为 bin
- x2t 转换回目标格式

### 次级落点: 控制面

升级流程本身触碰控制面:

- 版本选择: 9.3.1 优先，必要时回退到 9.3.0
- 执行位置: 平行拉取 + 隔离 worktree
- 验证门禁: lint、build、浏览器 smoke、文件格式矩阵
- 回滚触发: 9.4 混入、资源缺失、事件缺失、x2t 初始化失败

### 状态面

本轮不引入持久化状态变更。唯一状态风险是工作区状态:

- 当前主工作树 `i/lf w/crlf`，会污染 diff。
- progress 文档作为任务状态事实源，必须随进度回写。

## 黑盒输入-输出影响矩阵

| 控制输入 | 目标输出 | 影响方向 | 外溢风险 |
| --- | --- | --- | --- |
| 替换 `public/web-apps/**` 为 9.3.1 | API bridge 与 editor UI 升级 | 版本前进 | iframe 路径、locale、CSS、事件名变化 |
| 替换 `public/sdkjs/**` 为 9.3.1 | 编辑内核升级 | 版本前进 | SDK 与 web-apps 版本不匹配会导致运行时错误 |
| 替换 `public/wasm/x2t/**` | 转换能力对齐 9.3 | 兼容性上升 | WASM 包来源不清会导致初始化或转换失败 |
| 修改 `lib/onlyoffice-editor.ts` | 适配 9.3 事件契约 | 收敛 | 若过度兼容会隐藏真实失败 |
| 使用隔离 worktree | 降低当前脏状态干扰 | 噪声下降 | 集成回主工作树时需要补丁或 cherry-pick |

## 解耦矩阵

| 输出 | 主要输入 | 必须成组调整 | 不能顺手调整 |
| --- | --- | --- | --- |
| `DocsAPI.DocEditor.version()` 为 9.3.x | `public/web-apps/apps/api/documents/api.js` | web-apps apps + vendor | 应用 URL 契约 |
| Word 编辑可用 | `web-apps/documenteditor` + `sdkjs/word` | common sdkjs、字体、主题 | 保存格式策略 |
| Sheet 编辑可用 | `web-apps/spreadsheeteditor` + `sdkjs/cell` | formula lang、common sdkjs | CSV 业务规则 |
| Slide 编辑可用 | `web-apps/presentationeditor` + `sdkjs/slide` | themes、common sdkjs | UI 主流程 |
| 转换可用 | `public/wasm/x2t/**` | x2t js + wasm + 压缩变体 | mock 转换成功 |

## 复杂性转移账本

| 复杂性原位置 | 新位置 | 收益 | 新成本 | 失效模式 |
| --- | --- | --- | --- | --- |
| 当前项目内直接 vendored 旧资源 | 平行上游资源目录 + 隔离 worktree | 避免污染主工作树，便于审计 | 多一个同步和集成步骤 | 资源复制遗漏 |
| 运行时兼容问题 | 分层验证矩阵 | 尽早发现 web-apps/sdkjs/x2t 不匹配 | 需要浏览器 smoke | 静态通过但真实编辑失败 |
| 上游版本选择不明确 | 明确锁定 9.3.1，必要时回退 9.3.0 | 避免误升 9.4 | 需要记录 provenance | 混入非 9.3 资源 |

## 验证分层

### L0 快回路

- `rg` 检查版本头与 `DocsAPI.DocEditor.version`
- `rg` 检查 `asc_openDocument`、`asc_setImageUrls`、`asc_onSaveCallback`、`asc_writeFileCallback`
- `pnpm run lint:ts`

### L1 中回路

- `pnpm run build`
- Vite 本地启动后确认 API script 能加载
- 浏览器控制台确认版本为 9.3.x

### L2 慢回路

- DOCX 创建、打开、保存
- XLSX 创建、打开、保存
- PPTX 创建、打开、保存
- CSV 打开、内部转换、保存为 CSV
- 检查控制台无缺资源、WASM 初始化、保存事件 payload 错误

## 回滚与停止条件

立即停止:

- 发现 9.4 资源进入替换路径。
- 9.3 资源不包含当前 bridge 必需命令，且没有明确官方替代。
- x2t 9.3 来源无法确认，且替换会破坏现有转换。
- 当前主工作树 CRLF 噪声未隔离但准备直接覆盖资源。

回滚路径:

- 平行资源失败: 删除 `/tmp/onlyoffice-9.3-sources`。
- 隔离 worktree 失败: 删除 `/tmp/document-onlyoffice-9-3-worktree`。
- 已生成 patch 失败: 丢弃 patch 或恢复上一个 commit。

