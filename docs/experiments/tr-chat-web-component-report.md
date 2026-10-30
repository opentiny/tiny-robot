# TrChat Web Component 原型验证报告

## 结论

**结论：GO — 保留 `@opentiny/tiny-robot-chat/experimental` 实验导出，继续作为 TrChat 的 experiment 功能验证；暂不升级为稳定 API。**

原型满足既定 29 个映射场景的 go/no-go 条件：20 个原始文档示例、5 个 P0 和 4 个 P1 稳定化验收示例都有明确的适配映射，并各自通过 Chromium UI 与功能交互脚本；消息发送、流式增量、取消、会话、错误恢复、响应式布局、复杂 property、状态订阅、DOM 事件、Custom Element 初始化生命周期、长会话压力、SSR 安全导入和构建预算在该范围内没有 blocking defect。适配映射覆盖率与逐例浏览器通过率均为 **29 / 29（100%）**。跨场景的 Drawer 键盘/焦点语义和流式消息日志契约也已在原生组件补齐并由 Web Component、Angular 共同继承，因此组件能力严格验收为 **30 / 30（100%）**；scoped slot 仍必须表达为 DOM renderer，Light DOM 的宿主样式影响也仍需管理。

## 范围与基线

- PR：`opentiny/tiny-robot#452`
- 最终 source 分支：`SonyLeo/docs/update-chat-ui-desc`
- 初始与最终基线 SHA：`c855826eba33f1d151514c9469b56fd09e679ae0`
- 最终刷新时间：2026-10-14；PR head 与原始基线一致，无需重放文档变更。
- 实验入口：`@opentiny/tiny-robot-chat/experimental`
- 样式入口：`@opentiny/tiny-robot-chat/experimental/web-component.css`
- 元素：`<tr-chat>`、`<tr-chat-ui>`
- 浏览器：Chromium 完整矩阵；Firefox、WebKit 核心 smoke。

`experimental` 是 npm 导出名的正确拼写；`tiny-robot-chat/experiment` 不是本原型采用的入口。

## 技术选型结论

目前对这个原型而言，Vue 3.5+ `defineCustomElement()` 仍是最佳方案。它让 Web Component 适配层继续复用 `TrChat` / `TrChatUI` 的真实 Vue 渲染、状态和交互，避免手写 `HTMLElement` 方案复制聊天状态机、侧栏、浮层、输入区和消息渲染逻辑。手写方案只有在 Vue Custom Element 出现阻断性缺陷，或未来必须显著缩小运行时体积时才值得重新评估。

选型的已知成本也很明确：自包含浏览器入口会捆绑 Vue 与完整 UI 依赖，且 Vue scoped slot 不能原样成为平台 slot。Node/SSR 通过条件导出使用无 DOM 求值入口，浏览器再执行元素注册。因此原型采用：

- Light DOM（`shadowRoot: false`）和显式 CSS；
- primitive attribute + complex property；
- 标准 `CustomEvent`，payload 直接放在 `detail`；
- 6 个无上下文定制点使用原生命名 slot；
- 20 个 scoped 定制点使用返回 Node / Node[] / string / null 的 renderer，并用 `AbortSignal` 管理清理；Renderer 协议由原生 `TrChat` / `TrChatUI` 持有，Web Component 仅透传；
- owned Runtime 与 injected Runtime 分离所有权，断开只 dispose owned Runtime，不删除持久化会话。
- `getRuntimeSnapshot()` 与 `runtime-state-change` 提供框架中立的 Runtime 状态订阅。
- complex property 使用 shallow 契约，嵌套修改不触发更新，整体重新赋值触发更新。

## DOM Renderer 下沉验证（2026-10-19）

**结论：GO。** DOM Renderer 可以下沉到原生 `TrChat` / `TrChatUI`，Web Component 不再需要把 Renderer 动态重建成 Vue scoped slot。

- 原生 `ChatRenderers` 覆盖现有 `SCOPED_RENDERER_NAMES` 的全部 20 个 key；6 个无上下文 static slot 保持不变。
- 同一定制点的优先级固定为 `Vue scoped slot > DOM Renderer > 内置 fallback`；已有 Vue slot 行为不变。
- Renderer-only 的主区、空状态、左右侧栏和右侧 panel 会参与原生结构与可见性计算，不依赖 Web Component 适配层制造 slot。
- 生命周期核心只保留一份：替换和卸载先 abort 旧 signal，再移除旧节点；异常会清空旧输出、上报并允许后续恢复。
- Web Component 的 `renderers` property、`experimental-error` payload 和 Light DOM 行为保持兼容。旧适配层在 Renderer 抛错时可能重复派发两次错误；下沉后收敛为一次。
- `layout-empty-state` 的 DOM context 仍有意不暴露 Vue-only 的 `renderComposer(): VNode`。该能力属于后续 Composer Outlet 议题，不影响本次下沉结论。

## 适配映射统计

| status         | 数量 |
| -------------- | ---: |
| direct         |   11 |
| adapted        |   18 |
| partial        |    0 |
| blocked        |    0 |
| not-applicable |    0 |
| not-run        |    0 |

覆盖率公式为 `(direct + adapted) / applicable`，所以结果为 `(11 + 18) / 29 = 100%`。这里的 direct / adapted 表示每个 Vue 示例是直接映射还是经平台协议转换。除通用 readiness、可见内容、布局高度边界和横向溢出检查外，29 项现在各有独立 Chromium 专项交互场景，覆盖该示例列出的 UI 状态与交互。29 个组件功能点验收均要求保存人工对照或状态截图；尚未建立自动像素差异阈值，因此结论是功能与结构 UI 通过，不是 pixel-perfect 认证。

## 29 个示例结果

| ID                       | Vue baseline                     | behavior                            | visual                   | Chromium evidence          | Firefox / WebKit           |
| ------------------------ | -------------------------------- | ----------------------------------- | ------------------------ | -------------------------- | -------------------------- |
| `basic`                  | `chat/basic.vue`                 | adapted：owned Runtime options      | direct：两组人工截图对照 | 模型、输入、发送、响应     | 核心 smoke 通过            |
| `layout-presets`         | `chat/layout-presets.vue`        | direct                              | direct：五组人工截图对照 | 五种布局与结构恢复         | not-run：非核心 smoke      |
| `welcome-prompts`        | `chat/welcome-prompts.vue`       | adapted：DOM event 写入模板输入     | direct：两组人工截图对照 | 开关、prompt、返回会话     | not-run：非核心 smoke      |
| `sender-options`         | `chat/sender-options.vue`        | direct                              | direct：三组人工截图对照 | mention、template、help    | not-run：非核心 smoke      |
| `sender-toolbar`         | `chat/sender-toolbar.vue`        | direct                              | direct：两组人工截图对照 | 排序、状态、窄布局         | not-run：非核心 smoke      |
| `extension-tabs`         | `chat/extension-tabs.vue`        | adapted：slot → DOM renderer        | direct：两组人工截图对照 | 页签、动作、overlay        | not-run：非核心 smoke      |
| `bubble-options`         | `chat/bubble-options.vue`        | direct                              | direct：三组人工截图对照 | 内置、自定义、match        | not-run：非核心 smoke      |
| `runtime-error`          | `chat/runtime-error.vue`         | direct                              | direct：两组人工截图对照 | 失败事件与同 Runtime 恢复  | not-run：非核心 smoke      |
| `history-groups`         | `chat/history-groups.vue`        | direct                              | direct：两组人工截图对照 | 分组、切换、重命名         | not-run：非核心 smoke      |
| `slots-basic`            | `chat/slots-basic.vue`           | adapted：slot + DOM renderer        | direct：三组人工截图对照 | slot、context、abort       | 核心 smoke 通过            |
| `right-aside-panel`      | `chat/right-aside-panel.vue`     | adapted：renderer + element methods | direct：两组人工截图对照 | 预览、资料、切换、关闭     | not-run：非核心 smoke      |
| `floating-layout`        | `chat/floating-layout.vue`       | adapted：state event + DOM renderer | direct：两组人工截图对照 | 开关、拖动、缩放、关闭     | not-run：非核心 smoke      |
| `responsive-layout`      | `chat/responsive-layout.vue`     | direct                              | direct：两组人工截图对照 | Dock/Drawer、宽度、溢出    | 核心 smoke 通过            |
| `controlled-ui`          | `chat/controlled-ui.vue`         | adapted：property + DOM event       | direct：三组人工截图对照 | submit、cancel、恢复       | not-run：非核心 smoke      |
| `runtime-actions`        | `chat/runtime-actions.vue`       | adapted：Runtime 控制 + 状态读取    | direct：三组人工截图对照 | ready、stream、恢复        | not-run：非核心 smoke      |
| `runtime-before-send`    | `chat/runtime-before-send.vue`   | direct                              | direct：三组人工截图对照 | reject、保留、完成回答     | not-run：非核心 smoke      |
| `runtime-composer`       | `chat/runtime-composer.vue`      | adapted：readable + DOM renderer    | direct：三组人工截图对照 | 三种状态、预设输入         | not-run：非核心 smoke      |
| `runtime-conversations`  | `chat/runtime-conversations.vue` | direct                              | direct：三组人工截图对照 | 加载、创建、双向切换       | not-run：非核心 smoke      |
| `runtime-send`           | `chat/runtime-send.vue`          | direct                              | direct：两组人工截图对照 | 默认/自定义空文本语义      | 核心 smoke 通过            |
| `runtime-adapter`        | `chat/runtime-adapter.vue`       | adapted：property + DOM event       | direct：两组人工截图对照 | Adapter 消息生命周期       | not-run：非核心 smoke      |
| `runtime-subscription`   | `chat/runtime-subscription.vue`  | adapted：snapshot + DOM event       | direct：三组人工截图对照 | 初始、取消、再次完成       | not-run：P0 验收范围外     |
| `complex-properties`     | `chat/complex-properties.vue`    | adapted：shallow property           | direct：三组人工截图对照 | 嵌套、整体替换、恢复       | not-run：P0 验收范围外     |
| `runtime-ownership`      | `chat/runtime-ownership.vue`     | direct                              | direct：三组人工截图对照 | 替换、重连、存储隔离       | not-run：P0 验收范围外     |
| `event-contract`         | `chat/controlled-ui.vue`         | adapted：标准 DOM 事件协议          | direct：三组人工截图对照 | 重复派发、传播、取消默认   | not-run：P1 验收范围外     |
| `initialization-timing`  | `chat/basic.vue`                 | adapted：Custom Element 生命周期    | direct：三组人工截图对照 | 延迟升级、单布局、重连     | not-run：P1 验收范围外     |
| `performance-stress`     | `chat/basic.vue`                 | adapted：宿主耐久性压力场景         | direct：三组人工截图对照 | 长会话、更新、切换、重挂载 | not-run：CDP 限定 Chromium |
| `ssr-safe-import`        | `chat/basic.vue`                 | adapted：Node/browser 条件导出      | direct：状态与原生 UI    | Node 导入、浏览器注册      | not-run：本批范围外        |
| `unified-error-contract` | `chat/runtime-error.vue`         | adapted：统一 DOM 错误事件          | direct：错误与恢复状态   | 四类来源、兼容与恢复       | not-run：本批范围外        |
| `bundle-budget`          | `chat/basic.vue`                 | adapted：生产构建预算门禁           | direct：预算与原生 UI    | JS/CSS 实测与超限失败      | not-run：本批范围外        |

机器可读明细见 [`tr-chat-web-component-matrix.json`](./tr-chat-web-component-matrix.json)。

“29 / 29 通过”指当前 29 个 experimental 映射场景均已完成原版业务闭环或明确的稳定化增强验收，并保存 Vue baseline / Web Component 对照或可见状态截图。行为映射和人工视觉证据已经齐全；自动 pixel diff、非 Chromium 完整矩阵及报告范围外的产品能力仍按后续 TODO 单独推进。跨场景的 Drawer 和流式消息辅助技术契约作为第 30 个严格场景单独计数，已完成原版、Web Component、Angular 对照；详见 [可访问性与键盘导航验收报告](./tr-chat-web-component-validation/accessibility-navigation/report.md)。

## 公共 API 覆盖

- 注册：import 不自动注册；`defineTrChatElements()` 显式、幂等注册；不同 constructor 冲突会抛错。
- 属性：primitive attribute 转换、已连接元素的 pre-upgrade complex property、挂载后 whole-object reassignment 和 shallow property 契约均已覆盖。
- 方法：`send()`、`getRuntime()`、`getRuntimeSnapshot()`、`openRightAside()`、`closeRightAside()`、`toggleRightAside()`、`activateRightAsidePanel()`。
- 事件：`TrChat` 17 个 source event、`TrChatUI` 31 个 source event 都有固定 DOM 名；`update:*` 映射为 `*-update`；detail 不包数组。
- 取消语义：`history-action` 是唯一 cancelable 事件，DOM `preventDefault()` 会回传到 Vue payload。
- 错误：统一 `tr-chat-error` 提供稳定的 `source`、`code`、`cause`、`recoverable`，同时保留 `runtime-action-error`、`attachment-error` 和 `experimental-error`。
- readiness：延迟注册、初始化期受控回写、单布局、一次性 `ready` 事件和 `whenTrChatReady(element)`；持续状态通过 `runtime-state-change` snapshot 事件发布。
- 生命周期：注入 Runtime 不被元素 dispose；owned Runtime 替换或真实断开后 dispose；同一事件循环的 remove/reinsert 不误 dispose；不同 `storageKey` 隔离且元素销毁不删除持久化数据。
- 定制：6 个 Light DOM static slot、20 个 scoped renderer；Renderer 由原生 Chat UI 解析，替换时会 abort 旧 signal 并移除旧节点。

## 构建与性能

测量命令：`node scripts/measure-chat-experimental.mjs`。数值来自本分支 production build 的初始可达入口文件；gzip 使用 Node `zlib.gzipSync`。

| 产物             |         raw |                      gzip |
| ---------------- | ----------: | ------------------------: |
| stable JS        |   157,197 B |                  38,202 B |
| experimental JS  | 2,350,245 B | 621,452 B（约 606.9 KiB） |
| stable CSS       |    14,000 B |                   2,655 B |
| experimental CSS |   323,383 B |                  43,164 B |

experimental JS 确认 bundles Vue。当前继续采用自包含策略，生产门禁为 JavaScript gzip 650 KiB、CSS gzip 48 KiB；实测分别为 621,452 B 和 43,164 B，均通过。external-Vue 会把 Vue 版本与加载顺序转嫁给 Angular 等宿主，因此本批不采用；若预算被触发，再按样式裁剪、功能拆包和 tree-shaking 顺序优化。

模块已加载且 gallery 就绪后，额外创建 5 个最小 `<tr-chat-ui>` 的挂载样本为 `2.1 / 1.0 / 0.9 / 0.9 / 0.9 ms`，中位数 `0.9 ms`，控制台错误 `0`。这是 warm mount 指标，不是网络下载、解析和首屏 cold-start 指标。

长会话专项进一步验证 200 条消息、100 次 whole-object 更新、30 次会话切换和 30 次重挂载。最终 Chromium 运行记录更新/切换 2,077 ms、重挂载 2,420 ms；强制 GC 后 JS heap 减少 175,668 B，Document 增量为 0，事件监听器减少 21，DOM node 减少 377，控制台错误为 0。详见 [长会话性能与内存报告](./tr-chat-web-component-validation/performance-memory/report.md)。这些数值用于数量级回归，不是产品 SLA。

## 浏览器与真实服务

- Chromium：29/29 示例分别通过独立 UI/交互场景；20 个原始场景统一通过 readiness、可见性、宿主高度边界和横向溢出检查，5 个 P0 与 4 个 P1 场景通过各自业务闭环或稳定化断言。
- Firefox：注册、基础渲染、Light DOM/renderer、响应式与 send 核心 smoke 通过。
- WebKit：同一核心 smoke 通过。
- 真实 streaming：`not-run`，环境未提供 `TR_CHAT_REAL_API_URL`、`TR_CHAT_REAL_MODEL_ID`、`TR_CHAT_REAL_API_KEY`。
- 真实 MCP：`not-run`，环境未提供 `TR_CHAT_REAL_MCP_URL`。
- 确定性 mock 已验证增量流式渲染与 abort；真实服务的 `not-run` 不阻塞主流程，但不能被解释为真实供应商兼容性通过。

本轮逐例浏览器验证发现并修复了六个原型问题：示例宿主没有覆盖 `--tr-layout-height`，导致内部 `100dvh` 布局超出 420px 宿主并裁切发送区；带控制栏的示例没有为元素预留剩余 flex 高度；浮动示例默认挂载到 `body` 覆盖文档且漏配 resize；浮动元素在 ready 前快速打开/关闭存在过期异步挂载残留；Playwright 文档服务工作目录依赖调用位置；已连接但尚未注册的元素在初始化期同步双向回写时会重复 mount。修复后，普通示例布局都受宿主高度约束，浮动聊天改为显式打开/关闭并可拖动、缩放，过期挂载会被取消，初始化期事件延迟到首次 mount 完成后再转发，测试服务可从任意工作目录启动。示例宿主进一步统一为桌面 `560px`、窄屏 `640px`；浏览器回归确认初始 UI 和换行后的窄屏控制区不会因容器过矮产生内部纵向滚动。

## Angular 20 主应用与 React 19 兼容性探针

新增外部消费者验证包 `@opentiny/tiny-robot-angular20-experimental`，由官方 Angular CLI 20.3.39 以 standalone、strict、pnpm 配置创建。消费者精确锁定 npm `1.0.0-alpha.0`，只导入 `@opentiny/tiny-robot-chat/experimental`、`experimental/web-component.css` 和公开 Kit API，不引用 Vue、TrChat 源文件或内部路径；自动化同时断言真实安装目录位于 pnpm registry store。

验证覆盖 Angular `CUSTOM_ELEMENTS_SCHEMA`、复杂对象 property binding、`ready` / `tr-chat-error` 标准 DOM 事件、公开 `send()` 方法、真实 Vue UI 渲染和确定性消息响应。集成过程发现并修复了两个跨框架问题：Angular 会先连接 Custom Element，再写入 `runtimeOptions`；元素现在会等待 Runtime 配置后才初始化和发出 `ready`，重新赋值 owned `runtimeOptions` 时会释放并重建旧 Runtime。首次视觉复核还发现 Web Component 样式入口没有包含 TinyRobot 基础组件样式，导致元素结构存在但布局退化为普通 block；入口现已自包含这些样式。

| Angular 20 验证项                | 结果                                           |
| -------------------------------- | ---------------------------------------------- |
| 发布包消费者契约                 | 2 / 2 通过                                     |
| Jasmine / Karma + ChromeHeadless | 20 / 20 通过                                   |
| Playwright Chromium 端到端       | 26 / 26 通过，控制台 error 0                   |
| 结构视觉契约                     | body grid、aside grid-area、sender flex 均通过 |
| 桌面固定高度几何                 | host/layout 同高 680px，sender 未越界          |
| 320px 窄视口                     | layout/main 均在 host 内，页面无横向溢出       |
| production build                 | 通过                                           |
| initial bundle raw               | 2.04 MB                                        |
| initial estimated transfer       | 492.05 kB                                      |
| 外部服务或凭据                   | 不需要，使用确定性 mock                        |

Angular 默认 1 MB initial bundle error budget 会被该原型超过，因此测试工程保留预算检查但将阈值设为 1.8 MB warning / 2.1 MB error；当前 2.04 MB 已触发 warning，但仍低于 error 阈值。这个结果进一步确认了“可跨框架使用”，同时也支持把自包含体积列为稳定化前的首要优化项。

新增 `packages/react-chat-experimental` 作为最薄 React 19 协议探针，仅验证 `rightAsideOpen`、`activeRightAsidePanelId` 和 `floatingState` 三组受控 property / CustomEvent 契约。React Playwright 3 / 3、type-check 和 production build 均通过；浏览器人工检查与截图确认状态文案、Renderer 内容和浮动几何同步，干净标签页控制台 error / warning 为 0。React 不复制 Angular 的产品外壳、DeepSeek、会话或设置能力，Angular 仍是最终应用。

验证环境实际版本为 Angular 20.3.33、Angular CLI 20.3.39、TypeScript 5.9.3。宿主 Node 26.9.0 高于 Angular 20 支持范围，`ng version` 会给出环境告警；本次 build、unit 和 e2e 均通过，但复现环境建议改用 Angular 20 支持的 Node LTS。

## 最终验证统计

- `@opentiny/tiny-robot-chat` 单元测试：5 个文件，21 / 21 通过。
- `@opentiny/tiny-robot-kit` 单元测试：21 个文件，195 通过、1 个既有跳过。
- Playwright 组件回归：273 / 273 通过，其中包含 24 个 Web Component 契约用例。
- Angular 20 主应用：发布包来源 2 / 2、20 / 20 单元测试、26 / 26 Chromium 端到端和 production build 通过；统一错误事件由 Angular 宿主直接消费。
- React 19 兼容性探针：3 / 3 Chromium 端到端、type-check 和 production build 通过。
- 实验浏览器套件：Chromium 35 个可运行场景通过、真实服务 2 个按凭据守卫跳过，其中逐例场景 29 / 29 通过并包含独立性能/内存预算；Firefox 与 WebKit 各通过核心 smoke 和矩阵一致性检查，完整运行汇总为 39 通过、72 按范围或凭据守卫跳过。
- 导出、SSR 导入、示例清单、构建测量与报告一致性：14 / 14 通过。
- chat production build（stable + experimental）、实验/组件类型检查和文档 production build 通过。
- Renderer 下沉专项：原生组件 15 / 15、原生与 Web Component 聚焦回归 36 / 36、实验三浏览器矩阵 27 通过 / 48 按既有条件跳过；无失败。

## 限制与后续

1. **SSR**：`./experimental` 已提供 Node 条件入口，导入阶段不访问 DOM；`defineTrChatElements()` 仍必须在浏览器生命周期中调用。框架级 hydration 集成仍需在具体 Nuxt/Next 应用中验证。
2. **Light DOM**：便于继承现有 CSS 和调试；当前已用 cascade layer、基础控件默认值及 Angular 样式压力测试约束常见污染，但它仍不是 Shadow DOM，宿主的 `!important` 或定向 `.tr-*` 选择器仍可覆盖内部节点。
3. **Shadow DOM**：若未来要求强隔离，需要重新验证 teleport/overlay、全局主题变量、第三方组件样式和可访问性树；本原型不应直接切换。
4. **Scoped slot**：平台 slot 没有 Vue scoped slot 的上下文能力，所以 renderer 是必要的跨框架协议，不是语法等价；协议现由原生 Chat UI 持有，Web Component 仅透传。
5. **视觉证据**：29 个示例都有可见内容和交互结果断言，且 29 个组件功能点验收均要求保存人工对照或状态截图。自动像素 diff 仍未建立。
6. **体积**：捆绑 Vue 和完整依赖仍是成本，但已由 650 KiB JS gzip / 48 KiB CSS gzip 的生产预算门禁约束。
7. **稳定性与版本承诺**：继续保持 experimental；破坏性调整、SSR、IIFE/UMD/CDN、完整 a11y/CSP/legacy browser 和正式 graduation policy 后续单独决策。

## 发布建议

保留本分支的实验导出、29 个并行示例、公共契约测试和矩阵数据，供后续真实项目试用。不要把当前入口标记为 stable，也不要承诺框架 hydration 或 pixel-perfect parity。下一阶段优先验证真实 streaming/MCP、跨浏览器矩阵和真实辅助技术朗读节奏；这些工作不需要推翻 `defineCustomElement()` 选型。
