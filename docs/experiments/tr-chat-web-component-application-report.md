# TrChat Web Component Angular 20 应用级验证报告

## 执行摘要

**结论：应用级试用 GO，稳定生产发布仍为 NO-GO。**

`packages/angular20-chat-experimental/` 已从单按钮集成探针扩展为可独立浏览的 Angular 20 聊天应用。它仅通过 `@opentiny/tiny-robot-chat/experimental` 和 `@opentiny/tiny-robot-chat/experimental/web-component.css` 消费 TrChat，并用本地确定性 SSE mock 完成聊天主流程，不向外部模型发送数据。

应用级能力矩阵共 **24 项**：

| 分类             | 数量 | 占全部矩阵 |
| ---------------- | ---: | ---------: |
| 直接可用         |   15 |      62.5% |
| 宿主适配后可用   |    3 |      12.5% |
| 当前不可生产使用 |    4 |      16.7% |
| 与 TrChat 无关   |    2 |       8.3% |

排除 2 项与 TrChat 无关的产品业务后，当前可用能力为 `(15 + 3) / 22 = 81.8%`。矩阵中 18 项已实现能力均由浏览器主流程覆盖；剩余 4 项并非 UI 缺位，而是消息操作完整语义、附件、真实联网搜索和真实 MCP 尚未形成可生产闭环。

本轮实际结果：Angular unit **2 / 2**、Angular Chromium E2E **5 / 5**、TrChat unit **21 / 21**、TinyRobot Kit **196 passed / 1 skipped**、Web Component 公共契约 **19 / 19**、实验浏览器矩阵 **27 passed / 48 conditional skips**。Angular production initial bundle 为 **1.98 MB raw / 479.59 kB estimated transfer**；VitePress production build 通过。

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

| 项目            | 实际值                                                     |
| --------------- | ---------------------------------------------------------- |
| 验证日期        | 2026-10-16（Asia/Shanghai）                                |
| source baseline | `0f6fa41881adebd6b682e442b4c339ac3e645c36`                 |
| PR              | `opentiny/tiny-robot#458`，Draft，base `develop`           |
| Node            | 26.11.1；Angular CLI 明确标记为 unsupported                |
| pnpm            | 10.34.5                                                    |
| Angular / CLI   | 20.3.34 / 20.3.40                                          |
| TypeScript      | 5.9.3                                                      |
| Playwright      | 1.62.0                                                     |
| 自动化浏览器    | Chromium 155；实验核心 smoke 另含 Firefox 与 WebKit        |
| 对照页面        | 已登录 `https://chat.deepseek.com/`，桌面和 390 × 844 视口 |

Angular 20 不支持当前 Node 26.11.1；本轮 build、unit 和 E2E 均通过，但复现和推广应使用 Angular 20 支持的 Node LTS。

## 方法

1. 在已登录 DeepSeek 页面只读观察桌面和 390px 结构：桌面固定会话栏，窄屏覆盖式抽屉，主区顶部标题、消息区、底部输入器、深度思考、智能搜索、附件入口和消息操作栏。
2. 不执行 DeepSeek 真实发送、停止或重试。真实第三方通信要求动作时确认；本轮主要验证不依赖它，因此对应项标记 `not-run`。
3. Angular 应用使用 owned Runtime、公开 Custom Element property / method / event，以及本地 `fetch` 边界的确定性 SSE mock。mock 根据真实 provider request body 返回流式 OpenAI-compatible chunks，可验证深度思考和智能搜索开关是否进入请求。
4. Playwright 在桌面和 390px 验证真实 composer、增量响应、停止、会话 CRUD、搜索、刷新持久化和设置外壳；同时检查控制台错误和横向溢出。
5. 公共契约、示例矩阵、类型检查、unit、component、production build 和 docs build 均从当前最终工作树实际执行。

## 应用级能力追踪矩阵

|   # | 能力             | DeepSeek 可见行为                | Angular 行为与 TrChat / WC 承载方式                                  | 分类             | 结果    | 限制与证据                                                               |
| --: | ---------------- | -------------------------------- | -------------------------------------------------------------------- | ---------------- | ------- | ------------------------------------------------------------------------ |
|   1 | 桌面聊天布局     | 固定侧栏、主消息区、底部输入器   | `<tr-chat>` 提供布局，Angular 只提供页面外壳                         | 直接可用         | pass    | E2E 验证 `.tr-layout__body` grid 与 sender；桌面可视复核通过             |
|   2 | 欢迎空态         | 新会话居中欢迎与输入器           | `ui.layout.emptyState`、welcome、prompts、composer                   | 直接可用         | pass    | E2E 看到“欢迎使用 TrChat”和真实 composer                                 |
|   3 | 会话列表         | 侧栏显示历史、分组和当前项       | Runtime conversations + TrChat history 平铺列表                      | 直接可用         | pass    | 两个会话同时显示，选中项随切换更新；本应用未实现分组标题                 |
|   4 | 新建会话         | 新建后回到空态，首次发送生成标题 | 宿主调用公开 Runtime `clearActiveConversation()`；首次 send 创建会话 | 直接可用         | pass    | E2E 从已有消息回到欢迎空态，再生成第二会话                               |
|   5 | 切换会话         | 选择历史项恢复消息               | TrChat history 调用 Runtime `switchConversation()`                   | 直接可用         | pass    | E2E 切回 Alpha 会话并恢复用户消息                                        |
|   6 | 重命名会话       | 会话菜单进入标题编辑             | 默认 history menu + Runtime `renameConversation()`                   | 直接可用         | pass    | E2E 从菜单重命名为 `Renamed Alpha`                                       |
|   7 | 删除会话         | 会话菜单删除条目                 | cancelable history action + Runtime `deleteConversation()`           | 直接可用         | pass    | E2E 删除 Beta 条目后列表移除                                             |
|   8 | 会话搜索         | 侧栏搜索筛选云端历史             | Angular 读取公开 Runtime conversations，回写 `historyData` property  | 宿主适配后可用   | pass    | 搜索 `Beta` 后 history 仅保留 1 项；不承诺服务端全文搜索                 |
|   9 | 文本输入         | 会话内固定输入器                 | TrChat sender                                                        | 直接可用         | pass    | E2E 直接填写 `.tr-sender-editor`，不使用外部探针按钮                     |
|  10 | 发送消息         | 用户消息入列并触发回答           | TrChat submit → owned Runtime → provider protocol                    | 直接可用         | pass    | 用户气泡和 assistant 气泡均由真实组件渲染                                |
|  11 | 流式响应         | 回答逐步显示                     | provider Runtime + 本地 SSE mock                                     | 直接可用         | pass    | mock 分 5 个 content chunks 和 finish chunk；E2E 观察增量文本            |
|  12 | 停止回答         | 生成时发送按钮变为停止           | TrChat loading UI → Runtime `abort()` → AbortSignal                  | 直接可用         | pass    | E2E 在首个 chunk 后停止，request state 为 `aborted`                      |
|  13 | 深度思考         | 输入器功能开关                   | model capability + `model-feature-change` + provider request plugin  | 直接可用         | pass    | active class 与响应中的 `enable_thinking` 结果同时验证                   |
|  14 | 智能搜索         | 输入器功能开关                   | model capability + provider request plugin                           | 直接可用         | pass    | active class 与响应中的 `enable_search` 结果同时验证；不等于真实联网检索 |
|  15 | 消息展示         | Markdown、角色气泡和工具栏       | TrChat bubble / message renderer                                     | 直接可用         | pass    | E2E 验证 user / assistant 角色气泡和流式内容                             |
|  16 | 消息操作完整语义 | 复制、重试、赞踩、朗读、分享     | 可通过 bubble event、浏览器 API 或业务服务承载                       | 当前不可生产使用 | partial | DeepSeek 仅做可见盘点；Angular 未实现全部操作及后台语义                  |
|  17 | 持久化           | 刷新后恢复历史与消息             | owned Runtime `storageKey` + localStorage + `onLoad` 恢复最新会话    | 直接可用         | pass    | E2E 完整刷新后恢复 `Persist this conversation`                           |
|  18 | 390px 响应式     | 会话栏变为覆盖式抽屉             | TrChat container responsive + Angular shell media query              | 宿主适配后可用   | pass    | E2E 无横向溢出；可视复核抽屉遮罩、主区和设置面板                         |
|  19 | 顶部栏           | 标题、新建、搜索、分享等产品操作 | Angular shell；需要时调用公开 Runtime                                | 宿主适配后可用   | pass    | 标题、搜索、新建、设置均有真实行为；未模拟分享                           |
|  20 | 设置外壳         | 主题、语言、朗读音色和数据入口   | Angular dialog mock                                                  | 与 TrChat 无关   | pass    | 主题属性、语言和音色选择经 E2E 验证；不修改真实设置                      |
|  21 | 附件上传与解析   | 输入器附件入口、上传和后台解析   | 需要宿主上传、权限、存储与解析服务                                   | 当前不可生产使用 | not-run | 未上传文件；本应用没有附件业务闭环                                       |
|  22 | 真实联网搜索     | 开关影响模型和搜索后台           | 需要真实 provider / search service                                   | 当前不可生产使用 | not-run | 确定性 request flag 已验证；真实网络结果未验证                           |
|  23 | 真实 MCP         | 工具选择和执行依赖 MCP 服务      | Runtime MCP adapter + 外部 MCP server                                | 当前不可生产使用 | not-run | 未提供 `TR_CHAT_REAL_MCP_URL`                                            |
|  24 | 账号与云端数据   | 登录、设备、账号、跨设备历史     | 产品账号和后台系统                                                   | 与 TrChat 无关   | n/a     | 明确排除，不应由 TrChat 或 WC 负责                                       |

## 覆盖率与验证数据

### 自动化结果

| 范围                     | 命令                                                                                                                  | 实际结果                               |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| Angular unit             | `pnpm -F @opentiny/tiny-robot-angular20-experimental test`                                                            | 2 / 2 passed                           |
| Angular application E2E  | `pnpm -F @opentiny/tiny-robot-angular20-experimental test:e2e`                                                        | 5 / 5 passed                           |
| Angular production build | `pnpm -F @opentiny/tiny-robot-angular20-experimental build`                                                           | passed，1 个既有 bundle budget warning |
| TrChat unit              | `pnpm -F @opentiny/tiny-robot-chat test`                                                                              | 21 / 21 passed                         |
| TinyRobot Kit unit       | `pnpm -F @opentiny/tiny-robot-kit test`                                                                               | 196 passed，1 skipped                  |
| WC 公共契约 component    | `pnpm -F tiny-robot-test exec playwright test -c playwright-ct.config.ts component/chat-experimental --reporter=line` | 19 / 19 passed                         |
| WC 实验浏览器矩阵        | `pnpm -F tiny-robot-test test:experimental`                                                                           | 27 passed，48 conditionally skipped    |
| type-check               | chat、experimental、component                                                                                         | 3 / 3 commands passed                  |
| 全组件 production build  | `pnpm build:components`                                                                                               | passed                                 |
| docs production build    | `pnpm -F docs build`                                                                                                  | passed                                 |

实验矩阵的 48 个 skip 是预期范围控制：18 个逐例专项场景只在 Chromium 完整执行，Firefox / WebKit 运行核心 smoke；真实 streaming 和 MCP 按环境变量守卫。

### 构建与性能

| 产物             |         raw |    gzip / estimated transfer |
| ---------------- | ----------: | ---------------------------: |
| stable JS        |   130,232 B |                33,402 B gzip |
| experimental JS  | 2,284,963 B |               608,124 B gzip |
| stable CSS       |    13,828 B |                 2,641 B gzip |
| experimental CSS |   322,867 B |                42,998 B gzip |
| Angular initial  |     1.98 MB | 479.59 kB estimated transfer |

Angular build 仍超过 1.8 MB warning budget，但低于 2 MB error budget。5 次 warm `<tr-chat-ui>` mount 为 `1.9 / 1.1 / 1.0 / 0.9 / 0.9 ms`，中位数 **1.0 ms**，控制台错误 **0**。这不是网络、解析和 cold start 指标。

## 能力分类结论

### 直接可用

聊天布局、欢迎空态、会话列表、会话 CRUD、真实输入发送、流式响应、停止、模型功能开关、消息展示和本地持久化都能通过 `<tr-chat>` owned Runtime 直接承载。Angular 不需要复制 Vue 状态机，也不需要引用 TrChat 内部源码。

### 宿主适配后可用

会话搜索、应用顶部栏和完整页面响应式需要宿主业务。适配点是标准 property、CustomEvent 和公开 Runtime action；Angular 未引入 Vue，也未使用 internal import。设置外壳同样由 Angular 实现，但它属于产品业务而不是 TrChat 能力。

### 当前不可生产使用

- 消息操作只确认了可见结构和事件承载方向，没有验证复制、重试、评价、朗读、分享的完整语义和服务依赖。
- 附件没有上传、鉴权、存储、解析和错误恢复闭环。
- 智能搜索只验证了 provider request flag；真实联网结果未执行。
- 真实 MCP 未提供端点。
- experimental JS gzip 仍为约 608 kB，且入口不是 SSR-safe import。

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
5. **真实服务**：真实模型 streaming、联网搜索、附件和 MCP 均为 `not-run`，不能从 mock 结果推导供应商兼容性。
6. **视觉**：桌面和 390px 做了结构、几何和人工可视复核，没有建立 DeepSeek 与 Angular 的像素 diff。
7. **运行环境**：Node 26.11.1 不在 Angular 20 支持范围。
8. **mock 边界**：当前全局 fetch 拦截仅用于独立示例；生产应用应使用真实后端、代理或专用 mock layer。
9. **历史分组**：DeepSeek 的分组标题只做了可见盘点；Angular 应用验证了平铺会话列表，没有把分组标题计入通过能力。

## 结论与建议

当前实验已经证明：TrChat 转为 Web Component 后，可以在 Angular 20 中承载实际聊天应用的核心交互，而不只是“能挂载、能调用一个方法”的集成探针。应用试用可以继续，stable promotion 仍应等待真实服务、消息操作和附件闭环，以及 bundle / SSR 风险处理。

建议按以下顺序推进：

1. 在受控非敏感环境执行真实 streaming 和真实搜索 smoke，并记录供应商错误、停止语义和恢复行为。
2. 明确消息操作与附件的宿主协议、权限边界和失败模型，再决定哪些进入 TrChat 公共 API。
3. 优化 experimental bundle：评估 external Vue、样式裁剪、按功能拆包和更细粒度 tree-shaking。
4. 若推广 Angular 消费，增加框架类型增强或轻量 wrapper；不要在此之前承诺 stable API。
5. 后续单独验证 SSR、CSP、完整 a11y、cold start 和长时间内存行为。

## 可复核证据

- Angular 应用：`packages/angular20-chat-experimental/src/app/`
- 确定性 SSE provider：`packages/angular20-chat-experimental/src/mock-chat-api.ts`
- Angular E2E：`packages/angular20-chat-experimental/e2e/chat-experimental.spec.ts`
- WC 公共契约：`packages/test/component/chat-experimental/`
- 18 个文档示例矩阵：`packages/test/experimental/chat-web-component.examples.spec.ts`
- 原型决策：`docs/experiments/tr-chat-web-component-decisions.md`
- 原型矩阵：`docs/experiments/tr-chat-web-component-matrix.json`
- 原型报告：`docs/experiments/tr-chat-web-component-report.md`
- 构建测量：`node scripts/measure-chat-experimental.mjs`

未提交截图、trace、video 或原始 runner 输出；报告中的数字均来自本轮最终工作树实际执行。
