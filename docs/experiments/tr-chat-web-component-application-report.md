# TrChat Web Component Angular 20 应用级验证报告

## 2026-10-30 综合应用增量

Angular 应用已进一步贯通历史仓库、原生 MCP `tools/call`、TinyRobot Kit Skills、文本/图片附件、多模态 payload、消息操作和场景状态看板，形成 **7 / 7** 本地确定性综合业务场景。应用已改为精确消费 npm `1.0.0-alpha.0`，并用实际安装路径证明未回退到 workspace。最新自动化为发布包消费者契约 **2 / 2**、Angular unit **20 / 20**、Chromium E2E **26 / 26**；浏览器完成桌面和直接 390px 视觉复核，并保存截图。完整证据、环境变量与边界说明见 [Angular 综合应用验收报告](./tr-chat-web-component-validation/angular-comprehensive-app/report.md)。

该增量证明高级能力可以在同一 Angular Web Component 应用中组合运行，但不把本地 mock 结果等同于真实 DeepSeek、外部 MCP、生产附件后端或后台评价服务，因此下方 **21 / 25（84.0%）** 的生产能力口径保持不变。

## 执行摘要

**结论：应用级试用 GO，稳定生产发布仍为 NO-GO。**

`packages/angular20-chat-experimental/` 已从单按钮集成探针扩展为可独立浏览的 Angular 20 聊天应用。它仅通过 `@opentiny/tiny-robot-chat/experimental` 和 `@opentiny/tiny-robot-chat/experimental/web-component.css` 消费 TrChat，并用本地确定性 SSE mock 完成聊天主流程，不向外部模型发送数据。

应用级能力矩阵共 **27 项**：

| 分类             | 数量 | 占全部矩阵 |
| ---------------- | ---: | ---------: |
| 直接可用         |   15 |      55.6% |
| 宿主适配后可用   |    6 |      22.2% |
| 当前不可生产使用 |    4 |      14.8% |
| 与 TrChat 无关   |    2 |       7.4% |

排除 2 项与 TrChat 无关的产品业务后，严格完成能力为 `21 / 25 = 84.0%`；4 项未形成生产闭环的是消息操作后台与原位重试、附件上传与解析、真实联网搜索和真实外部 MCP。组件内消息操作 UI、附件 UI、消息协议透传及本地 MCP 管理不再与外部服务能力混为一项。

本轮最新结果：发布包消费者契约 **2 / 2**、Angular unit **20 / 20**、Angular Chromium E2E **26 / 26**；除既有消息操作能力外，已新增 Light DOM 样式压力、最薄类型消费契约、直接 390px 入口与统一 `tr-chat-error` 错误事件验收。移动端 Drawer 的 dialog 关系、初始关闭、焦点进入/恢复、Escape 和消息日志 `aria-busy` 均已在 Angular 真实宿主通过。Web Component 公共契约 **26 / 26** 通过；此前记录的 TrChat unit **21 / 21**、TinyRobot Kit **196 passed / 1 skipped** 继续保留。当前 Chromium 实验浏览器矩阵为 **35 passed / 2 credential-gated skips**，完整三浏览器运行汇总为 **39 passed / 72 scoped or credential-gated skips**。Angular production initial bundle、VitePress production build及其他最终验证结果见下方自动化表。

## 范围与非目标

### 范围

- 以已登录 DeepSeek Web 页面为功能和结构参照，不以像素级复刻为目标。
- 验证聊天布局、欢迎空态、会话生命周期、输入与发送、流式响应与停止、深度思考、智能搜索、消息展示、持久化和响应式行为。
- 由 Angular 模拟会话搜索、顶部栏、主题、语言和朗读音色设置外壳。
- 对缺少服务或凭据的能力使用确定性 mock、`not-run` 或明确限制，不阻塞其余验证。

### 非目标

- 不复刻 DeepSeek 的登录、账号、设备、未成年人模式和云端数据管理。
- 不上传私人文件，不使用敏感消息，不修改、共享、导出或删除 DeepSeek 数据。
- 不把仅显示 UI、没有真实行为的功能判定为通过。
- 不以像素级还原为验收标准。
- SSR / hydration 不作为本轮阻塞项。

## 环境

| 项目             | 实际值                                                               |
| ---------------- | -------------------------------------------------------------------- |
| 验证日期         | 2026-10-28（Asia/Shanghai）                                          |
| source baseline  | PR #475 HEAD `227b140518f50c4491efb48601809d1ad62d9125`              |
| package baseline | npm `1.0.0-alpha.0`                                                  |
| PR               | `opentiny/tiny-robot#458`，Draft，叠加于 #475，base `release/v1.0.x` |
| Node             | 22.23.4；本机 26.11.1 不受 Angular 20 支持且会触发 esbuild `SIGABRT` |
| pnpm             | 10.34.5                                                              |
| Angular / CLI    | 20.3.34 / 20.3.40                                                    |
| TypeScript       | 5.9.3                                                                |
| Playwright       | 1.62.0                                                               |
| 自动化浏览器     | Chromium 155；实验核心 smoke 另含 Firefox 与 WebKit                  |
| 对照页面         | 已登录 `https://chat.deepseek.com/`，桌面和 390 × 844 视口           |

本轮 build、unit 和 E2E 使用 Node 22.23.4。Node 26.11.1 下同一工作树在 Angular/esbuild 构建阶段稳定 `SIGABRT`，因此复现、CI 和推广必须使用 Angular 20 支持的 Node LTS。

## 方法

1. 在已登录 DeepSeek 页面只读观察桌面和 390px 结构：桌面固定会话栏，窄屏覆盖式抽屉，主区顶部标题、消息区、底部输入器、深度思考、智能搜索、附件入口和消息操作栏。
2. 不执行 DeepSeek 真实发送、停止或重试。真实第三方通信要求动作时确认；本轮主要验证不依赖它，因此对应项标记 `not-run`。
3. Angular 应用使用 owned Runtime、公开 Custom Element property / method / event，以及本地 `fetch` 边界的确定性 SSE mock。mock 根据真实 provider request body 返回流式 OpenAI-compatible chunks，可验证深度思考和智能搜索开关是否进入请求。
4. Playwright 在桌面和 390px 验证真实 composer、增量响应、停止、会话 CRUD、搜索、刷新持久化和设置外壳；同时检查控制台错误和横向溢出。
5. 公共契约、示例矩阵、类型检查、unit、component、production build 和 docs build 均从当前最终工作树实际执行。

## 应用级能力追踪矩阵

|   # | 能力               | DeepSeek 可见行为                    | Angular 行为与 TrChat / WC 承载方式                                  | 分类             | 结果    | 限制与证据                                                               |
| --: | ------------------ | ------------------------------------ | -------------------------------------------------------------------- | ---------------- | ------- | ------------------------------------------------------------------------ |
|   1 | 桌面聊天布局       | 固定侧栏、主消息区、底部输入器       | `<tr-chat>` 提供布局，Angular 只提供页面外壳                         | 直接可用         | pass    | E2E 验证 `.tr-layout__body` grid 与 sender；桌面可视复核通过             |
|   2 | 欢迎空态           | 新会话居中欢迎与输入器               | `ui.layout.emptyState`、welcome、prompts、composer                   | 直接可用         | pass    | E2E 看到“欢迎使用 TrChat”和真实 composer                                 |
|   3 | 会话列表           | 侧栏显示历史、分组和当前项           | Runtime conversations + TrChat history 平铺列表                      | 直接可用         | pass    | 两个会话同时显示，选中项随切换更新；本应用未实现分组标题                 |
|   4 | 新建会话           | 新建后回到空态，首次发送生成标题     | 宿主调用公开 Runtime `clearActiveConversation()`；首次 send 创建会话 | 直接可用         | pass    | E2E 从已有消息回到欢迎空态，再生成第二会话                               |
|   5 | 切换会话           | 选择历史项恢复消息                   | TrChat history 调用 Runtime `switchConversation()`                   | 直接可用         | pass    | E2E 切回 Alpha 会话并恢复用户消息                                        |
|   6 | 重命名会话         | 会话菜单进入标题编辑                 | 默认 history menu + Runtime `renameConversation()`                   | 直接可用         | pass    | E2E 从菜单重命名为 `Renamed Alpha`                                       |
|   7 | 删除会话           | 会话菜单删除条目                     | cancelable history action + Runtime `deleteConversation()`           | 直接可用         | pass    | E2E 删除 Beta 条目后列表移除                                             |
|   8 | 会话搜索           | 侧栏搜索筛选云端历史                 | Angular 读取公开 Runtime conversations，回写 `historyData` property  | 宿主适配后可用   | pass    | 搜索 `Beta` 后 history 仅保留 1 项；不承诺服务端全文搜索                 |
|   9 | 文本输入           | 会话内固定输入器                     | TrChat sender                                                        | 直接可用         | pass    | E2E 直接填写 `.tr-sender-editor`，不使用外部探针按钮                     |
|  10 | 发送消息           | 用户消息入列并触发回答               | TrChat submit → owned Runtime → provider protocol                    | 直接可用         | pass    | 用户气泡和 assistant 气泡均由真实组件渲染                                |
|  11 | 流式响应           | 回答逐步显示                         | provider Runtime + 本地 SSE mock                                     | 直接可用         | pass    | mock 分 5 个 content chunks 和 finish chunk；E2E 观察增量文本            |
|  12 | 停止回答           | 生成时发送按钮变为停止               | TrChat loading UI → Runtime `abort()` → AbortSignal                  | 直接可用         | pass    | E2E 在首个 chunk 后停止，request state 为 `aborted`                      |
|  13 | 深度思考           | 输入器功能开关                       | model capability + `model-feature-change` + provider request plugin  | 直接可用         | pass    | active class 与响应中的 `enable_thinking` 结果同时验证                   |
|  14 | 智能搜索           | 输入器功能开关                       | model capability + provider request plugin                           | 直接可用         | pass    | active class 与响应中的 `enable_search` 结果同时验证；不等于真实联网检索 |
|  15 | 消息展示           | Markdown、角色气泡和工具栏           | TrChat bubble / message renderer                                     | 直接可用         | pass    | E2E 验证 user / assistant 角色气泡和流式内容                             |
|  16 | 消息操作 UI        | 复制、重试、赞踩、朗读、分享         | DOM Renderer + Web Speech / Share / Clipboard + 公开 `send()`        | 宿主适配后可用   | pass    | 负向原因、互斥、朗读/停止、分享成功/拒绝/取消/回退和状态保持均通过       |
|  17 | 消息操作服务闭环   | 后台评价、渠道分享、原位重试         | 需要宿主后台、渠道与消息替换协议                                     | 当前不可生产使用 | not-run | 当前反馈为会话内状态，重试为重发；未验证后台评价、远程分享或原位替换     |
|  18 | 持久化             | 刷新后恢复历史与消息                 | owned Runtime `storageKey` + localStorage + `onLoad` 恢复最新会话    | 直接可用         | pass    | E2E 完整刷新后恢复 `Persist this conversation`                           |
|  19 | 390px 响应式       | 会话栏变为覆盖式抽屉                 | TrChat container responsive + Angular shell media query              | 宿主适配后可用   | pass    | E2E 无横向溢出；Drawer dialog、焦点、Escape、遮罩和截图均通过            |
|  20 | 顶部栏             | 标题、新建、搜索、分享等产品操作     | Angular shell；需要时调用公开 Runtime                                | 宿主适配后可用   | pass    | 标题、搜索、新建、设置均有真实行为；回答分享由消息操作承担               |
|  21 | 设置外壳           | 主题、语言、朗读音色和数据入口       | Angular dialog mock                                                  | 与 TrChat 无关   | pass    | 主题属性、语言和音色选择经 E2E 验证；不修改真实设置                      |
|  22 | 附件选择与消息透传 | 输入器选择、展示、移除和随消息提交   | 原版 `TrAttachments` / `UploadButton` + 受控 property / DOM events   | 宿主适配后可用   | pass    | 真实文件多选、移除、payload 和成功后清空均通过                           |
|  23 | 附件上传与解析     | 鉴权、上传、存储、解析和失败恢复     | 需要宿主文件服务                                                     | 当前不可生产使用 | not-run | 本地 Demo 只证明附件协议，不推导生产文件服务                             |
|  24 | 真实联网搜索       | 开关影响模型和搜索后台               | 需要真实 provider / search service                                   | 当前不可生产使用 | not-run | 确定性 request flag 已验证；真实网络结果未验证                           |
|  25 | MCP 管理与本地协议 | 服务安装、详情、工具发现、启停和卸载 | Runtime MCP adapter + 同源确定性 JSON-RPC endpoint                   | 宿主适配后可用   | pass    | 本地 endpoint 覆盖 initialize 与 tools/list；管理主流程通过              |
|  26 | 真实外部 MCP       | 鉴权、远端工具执行和错误恢复         | Runtime MCP adapter + 外部 MCP server                                | 当前不可生产使用 | not-run | 未验证真实 endpoint、跨域、超时、断线和资源释放                          |
|  27 | 账号与云端数据     | 登录、设备、账号、跨设备历史         | 产品账号和后台系统                                                   | 与 TrChat 无关   | n/a     | 明确排除，不应由 TrChat 或 WC 负责                                       |

## 覆盖率与验证数据

### 自动化结果

| 范围                     | 命令                                                                                                                  | 实际结果                           |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Published alpha consumer | `node --test scripts/verify-published-alpha-consumers.test.js`                                                        | 2 / 2 passed                       |
| Angular unit             | `pnpm -F @opentiny/tiny-robot-angular20-experimental test`                                                            | 20 / 20 passed                     |
| Angular application E2E  | `pnpm -F @opentiny/tiny-robot-angular20-experimental exec playwright test --reporter=line`                            | 26 / 26 passed                     |
| Angular production build | `pnpm -F @opentiny/tiny-robot-angular20-experimental build`                                                           | passed，2 个非阻塞 budget warnings |
| TrChat unit              | `pnpm -F @opentiny/tiny-robot-chat test`                                                                              | 21 / 21 passed                     |
| TinyRobot Kit unit       | `pnpm -F @opentiny/tiny-robot-kit test`                                                                               | 196 passed，1 skipped              |
| WC 公共契约 component    | `pnpm -F tiny-robot-test exec playwright test -c playwright-ct.config.ts component/chat-experimental --reporter=line` | 26 / 26 passed                     |
| WC 实验浏览器矩阵        | `pnpm -F tiny-robot-test test:experimental`                                                                           | 39 passed，72 scoped/gated skipped |
| type-check               | chat、experimental、component                                                                                         | 3 / 3 commands passed              |
| 全组件 production build  | `pnpm build:components`                                                                                               | passed                             |
| docs production build    | `pnpm -F docs build`                                                                                                  | passed                             |

Chromium 中 2 个真实服务 skip 分别是真实 streaming 与真实 MCP，按环境变量守卫；其他 skip 来自完整逐例矩阵仅在 Chromium 运行以及 Chromium-only CDP 性能计数器。Firefox / WebKit 核心 smoke 与矩阵一致性本轮均重新通过。

### 构建与性能

| 产物             |         raw |    gzip / estimated transfer |
| ---------------- | ----------: | ---------------------------: |
| stable JS        |   157,197 B |                38,202 B gzip |
| experimental JS  | 2,350,245 B |               621,452 B gzip |
| stable CSS       |    14,000 B |                 2,655 B gzip |
| experimental CSS |   323,383 B |                43,164 B gzip |
| Angular initial  |     2.05 MB | 494.07 kB estimated transfer |

Angular build 仍超过 1.8 MB initial warning budget，`app.css` 也超过 4 kB warning budget 188 bytes；实验应用 error budget 保持 2.1 MB，当前 2.05 MB 产物仍通过构建。5 次 warm `<tr-chat-ui>` mount 为 `1.9 / 1.1 / 1.0 / 0.9 / 0.9 ms`，中位数 **1.0 ms**，控制台错误 **0**。这不是网络、解析和 cold start 指标。

## 能力分类结论

### 直接可用

聊天布局、欢迎空态、会话列表、会话 CRUD、真实输入发送、流式响应、停止、模型功能开关、消息展示和本地持久化都能通过 `<tr-chat>` owned Runtime 直接承载。Angular 不需要复制 Vue 状态机，也不需要引用 TrChat 内部源码。

### 宿主适配后可用

会话搜索、应用顶部栏、完整页面响应式、Bubble 消息操作、附件受控状态和本地 MCP endpoint 需要宿主业务。适配点是标准 property、CustomEvent 和公开 Runtime action；Angular 未引入 Vue，也未使用 internal import。设置外壳同样由 Angular 实现，但它属于产品业务而不是 TrChat 能力。

### 当前不可生产使用

- 消息操作 UI 已验证复制、正负反馈与原因、朗读/停止、Web Share/剪贴板回退和重发式重试；后台评价服务、真实渠道分享与原位重试仍未形成生产闭环。
- 附件 UI 与消息透传已通过；上传、鉴权、存储、解析和错误恢复仍无生产闭环。
- 智能搜索只验证了 provider request flag；真实联网结果未执行。
- MCP 管理与同源 JSON-RPC 发现已通过；真实外部 MCP 未提供端点。
- experimental 浏览器入口仍为自包含构建，当前 JS gzip 606.9 KiB、CSS gzip 42.2 KiB，已纳入 650 KiB / 48 KiB 自动化预算；Node 条件入口已支持 SSR-safe import，框架 hydration 仍未验证。

### 与 TrChat 无关

登录、账号、设备、未成年人模式、云端会话同步和数据管理属于产品后台。主题、语言、音色等设置页面可以由宿主围绕 TrChat 提供，但不应据此扩大 TrChat 的核心职责。

## 缺陷与最终修复

- Angular 示例不再依赖外部 “Send from Angular” 探针；所有发送、停止和会话操作都来自真实应用 UI。
- 确定性 mock 改为 provider-compatible SSE，因此同一条链路同时覆盖流式、AbortSignal、model capabilities 和 request feature body。
- Runtime 加载本地会话后，Angular 通过公开 `onLoad` 和 Runtime action 恢复最新会话，刷新持久化成为完整用户流程。
- fresh workspace 在 TypeScript 5.9 下曾无法生成 Kit DTS：dispose 分支把必需的 `saveMessages` 函数当作可选值检查。最终代码只检查 `autoSaveMessages`；既有 lifecycle 测试继续保护 dispose flush，Kit build 和全组件 build 均通过。
- 未改变 experimental 公共 API。

## 限制与风险

1. **experimental 稳定性**：当前 API 不承诺稳定兼容性。
2. **体积**：自包含 WC 捆绑 Vue 和完整 UI 依赖，是推广前最优先的工程风险。
3. **SSR**：入口仍依赖浏览器 DOM；Next、Nuxt 和 hydration 未验证。
4. **Light DOM**：宿主 CSS 可影响内部元素，需要应用级样式治理或隔离策略。
5. **真实服务**：真实模型 streaming、联网搜索、附件后端和外部 MCP 均为 `not-run`，不能从本地协议结果推导供应商兼容性。
6. **视觉**：桌面和 390px 做了结构、几何和人工可视复核，没有建立 DeepSeek 与 Angular 的像素 diff。
7. **运行环境**：Node 26.11.1 不在 Angular 20 支持范围。
8. **mock 边界**：当前全局 fetch 拦截仅用于独立示例；生产应用应使用真实后端、代理或专用 mock layer。
9. **历史分组**：DeepSeek 的分组标题只做了可见盘点；Angular 应用验证了平铺会话列表，没有把分组标题计入通过能力。

## 结论与建议

当前实验已经证明：TrChat 转为 Web Component 后，可以在 Angular 20 中承载实际聊天应用的核心交互，而不只是“能挂载、能调用一个方法”的集成探针。应用试用可以继续，stable promotion 仍应等待真实服务、消息操作后台与附件后端闭环，以及 bundle / SSR 风险处理。

建议按以下顺序推进：

1. 在受控非敏感环境执行真实 streaming 和真实搜索 smoke，并记录供应商错误、停止语义和恢复行为。
2. 补齐后台评价、真实渠道分享和原位重试语义，并为附件定义上传权限、失败和恢复模型。
3. 优化 experimental bundle：评估 external Vue、样式裁剪、按功能拆包和更细粒度 tree-shaking。
4. 若推广 Angular 消费，增加框架类型增强或轻量 wrapper；不要在此之前承诺 stable API。
5. 后续单独验证 SSR hydration、CSP、Firefox / WebKit 全量矩阵、真实屏幕阅读器语音节奏和 cold start。

## 可复核证据

- Angular 应用：`packages/angular20-chat-experimental/src/app/`
- 确定性 SSE provider：`packages/angular20-chat-experimental/src/mock-chat-api.ts`
- Angular E2E：`packages/angular20-chat-experimental/e2e/chat-experimental.spec.ts`
- MCP 管理验收：`docs/experiments/tr-chat-web-component-validation/angular-mcp-management/report.md`
- Bubble 消息操作验收：`docs/experiments/tr-chat-web-component-validation/angular-message-operations/report.md`
- 负向反馈验收：`docs/experiments/tr-chat-web-component-validation/angular-negative-feedback/report.md`
- 回答朗读验收：`docs/experiments/tr-chat-web-component-validation/angular-read-aloud/report.md`
- 回答分享验收：`docs/experiments/tr-chat-web-component-validation/angular-share/report.md`
- Sender 附件验收：`docs/experiments/tr-chat-web-component-validation/angular-attachments/report.md`
- WC 公共契约：`packages/test/component/chat-experimental/`
- 20 个文档示例矩阵：`packages/test/experimental/chat-web-component.examples.spec.ts`
- 原型决策：`docs/experiments/tr-chat-web-component-decisions.md`
- 原型矩阵：`docs/experiments/tr-chat-web-component-matrix.json`
- 原型报告：`docs/experiments/tr-chat-web-component-report.md`
- 构建测量：`node scripts/measure-chat-experimental.mjs`

已保存验收截图；未提交 trace、video 或原始 runner 输出。报告中的数字来自本轮最终工作树实际执行。
