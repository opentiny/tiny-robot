# TrChat Web Component 原型验证报告

## 结论

**结论：GO — 保留 `@opentiny/tiny-robot-chat/experimental` 实验导出，继续作为 TrChat 的 experiment 功能验证；暂不升级为稳定 API。**

原型满足既定 go/no-go 条件：18 个文档示例都有明确的适配映射，并各自通过 Chromium UI 与功能交互脚本；消息发送、流式增量、取消、会话、错误恢复、响应式布局和 Runtime 生命周期没有 blocking defect。适配映射覆盖率与逐例浏览器通过率均为 **18 / 18（100%）**。当前主要代价不是已发现的阻断功能缺失，而是自包含构建体积、非 SSR-safe import，以及 scoped slot 必须转换成 DOM renderer。

## 范围与基线

- PR：`opentiny/tiny-robot#452`
- 最终 source 分支：`SonyLeo/docs/update-chat-ui-desc`
- 初始与最终基线 SHA：`c855826eba33f1d151514c9469b56fd09e679ae0`
- 最终刷新时间：2026-10-14；PR head 与原始基线一致，无需重放文档变更。
- 实验入口：`@opentiny/tiny-robot-chat/experimental`
- 样式入口：`@opentiny/tiny-robot-chat/experimental.css`
- 元素：`<tr-chat>`、`<tr-chat-ui>`
- 浏览器：Chromium 完整矩阵；Firefox、WebKit 核心 smoke。

`experimental` 是 npm 导出名的正确拼写；`tiny-robot-chat/experiment` 不是本原型采用的入口。

## 技术选型结论

目前对这个原型而言，Vue 3.5+ `defineCustomElement()` 仍是最佳方案。它让 Web Component 适配层继续复用 `TrChat` / `TrChatUI` 的真实 Vue 渲染、状态和交互，避免手写 `HTMLElement` 方案复制聊天状态机、侧栏、浮层、输入区和消息渲染逻辑。手写方案只有在 Vue Custom Element 出现阻断性缺陷，或未来必须显著缩小运行时体积时才值得重新评估。

选型的已知成本也很明确：自包含入口会捆绑 Vue 与完整 UI 依赖，模块求值依赖浏览器 DOM，且 Vue scoped slot 不能原样成为平台 slot。因此原型采用：

- Light DOM（`shadowRoot: false`）和显式 CSS；
- primitive attribute + complex property；
- 标准 `CustomEvent`，payload 直接放在 `detail`；
- 6 个无上下文定制点使用原生命名 slot；
- 20 个 scoped 定制点使用返回 Node / Node[] / string / null 的 renderer，并用 `AbortSignal` 管理清理；
- owned Runtime 与 injected Runtime 分离所有权，断开只 dispose owned Runtime，不删除持久化会话。

## 适配映射统计

| status         | 数量 |
| -------------- | ---: |
| direct         |   12 |
| adapted        |    6 |
| partial        |    0 |
| blocked        |    0 |
| not-applicable |    0 |
| not-run        |    0 |

覆盖率公式为 `(direct + adapted) / applicable`，所以结果为 `(12 + 6) / 18 = 100%`。这里的 direct / adapted 表示每个 Vue 示例是直接映射还是经平台协议转换。除通用 readiness、可见内容、布局高度边界和横向溢出检查外，18 项现在各有独立 Chromium 场景，覆盖该示例列出的 UI 状态与交互。visual 维度仍均为 `partial`，因为没有保存 Vue baseline 与 Web Component 的像素级截图差异；因此结论是功能与结构 UI 通过，不是 pixel-perfect 认证。

## 18 个示例结果

| ID                      | Vue baseline                     | behavior                            | visual                           | Chromium evidence      | Firefox / WebKit      |
| ----------------------- | -------------------------------- | ----------------------------------- | -------------------------------- | ---------------------- | --------------------- |
| `basic`                 | `chat/basic.vue`                 | adapted：owned Runtime options      | partial：无 pixel diff           | 输入、发送、响应       | 核心 smoke 通过       |
| `layout-presets`        | `chat/layout-presets.vue`        | direct                              | partial：无 pixel diff           | 三种布局与 CSS 几何    | not-run：非核心 smoke |
| `welcome-prompts`       | `chat/welcome-prompts.vue`       | adapted：DOM event 回写 property    | partial：无 pixel diff           | prompt、事件、受控输入 | not-run：非核心 smoke |
| `sender-options`        | `chat/sender-options.vue`        | direct                              | partial：无 pixel diff           | 默认值、计数、清空     | not-run：非核心 smoke |
| `bubble-options`        | `chat/bubble-options.vue`        | direct                              | partial：无 pixel diff           | 双角色内容与对齐       | not-run：非核心 smoke |
| `runtime-error`         | `chat/runtime-error.vue`         | direct                              | partial：无 pixel diff           | 失败事件与恢复发送     | not-run：非核心 smoke |
| `history-groups`        | `chat/history-groups.vue`        | direct                              | partial：无 pixel diff           | 分组、条目、选中态     | not-run：非核心 smoke |
| `slots-basic`           | `chat/slots-basic.vue`           | adapted：slot + DOM renderer        | partial：无 pixel diff           | slot、context、abort   | 核心 smoke 通过       |
| `right-aside-panel`     | `chat/right-aside-panel.vue`     | adapted：renderer + element methods | partial：无 pixel diff           | 打开、激活、关闭       | not-run：非核心 smoke |
| `floating-layout`       | `chat/floating-layout.vue`       | direct                              | partial：未做拖拽截图 diff       | 开关、拖动、缩放       | not-run：非核心 smoke |
| `responsive-layout`     | `chat/responsive-layout.vue`     | direct                              | partial：几何校验，无 pixel diff | 窄/宽、drawer、溢出    | 核心 smoke 通过       |
| `controlled-ui`         | `chat/controlled-ui.vue`         | adapted：`*-update` 事件            | partial：无 pixel diff           | 宿主更新与用户回写     | not-run：非核心 smoke |
| `runtime-actions`       | `chat/runtime-actions.vue`       | direct                              | partial：无 pixel diff           | send、stream、abort    | not-run：非核心 smoke |
| `runtime-before-send`   | `chat/runtime-before-send.vue`   | direct                              | partial：无 pixel diff           | reject、保留、continue | not-run：非核心 smoke |
| `runtime-composer`      | `chat/runtime-composer.vue`      | direct                              | partial：无 pixel diff           | disabled 三种状态      | not-run：非核心 smoke |
| `runtime-conversations` | `chat/runtime-conversations.vue` | direct                              | partial：无 pixel diff           | 列表与双向切换         | not-run：非核心 smoke |
| `runtime-send`          | `chat/runtime-send.vue`          | direct                              | partial：无 pixel diff           | 返回值与消息追加       | 核心 smoke 通过       |
| `runtime-adapter`       | `chat/runtime-adapter.vue`       | adapted：data + submit event        | partial：无 pixel diff           | submit 与业务状态回写  | not-run：非核心 smoke |

机器可读明细见 [`tr-chat-web-component-matrix.json`](./tr-chat-web-component-matrix.json)。

“18 / 18 通过”指当前 18 个 experimental 映射场景的 UI 与声明交互全部通过，不表示把 Vue baseline 页面里的每个演示控制器逐项复制到了 Web Component 页面。当前 gallery 有意简化了部分演示面板，例如 layout baseline 的更多预设、sender 的 mention/template/help、bubble 外观切换、history rename/delete、更多 slot 内容、多个右侧面板入口以及会话新建。这些能力是否纳入下一轮逐控件 parity，应在原型确认后按产品价值选择；本轮没有把未暴露的控件计为“浏览器已通过”。

## 公共 API 覆盖

- 注册：import 不自动注册；`defineTrChatElements()` 显式、幂等注册；不同 constructor 冲突会抛错。
- 属性：primitive attribute 转换、pre-upgrade complex property、挂载后 object reassignment 均已覆盖。
- 方法：`send()`、`getRuntime()`、`openRightAside()`、`closeRightAside()`、`toggleRightAside()`、`activateRightAsidePanel()`。
- 事件：`TrChat` 17 个 source event、`TrChatUI` 31 个 source event 都有固定 DOM 名；`update:*` 映射为 `*-update`；detail 不包数组。
- 取消语义：`history-action` 是唯一 cancelable 事件，DOM `preventDefault()` 会回传到 Vue payload。
- 错误：Runtime action failure 保持 `runtime-action-error`；renderer/适配错误使用 `experimental-error`。
- readiness：一次性 `ready` 事件和 `whenTrChatReady(element)`。
- 生命周期：注入 Runtime 不被元素 dispose；owned Runtime 在真实断开后 dispose；同一事件循环的 remove/reinsert 不误 dispose；持久化数据不删除。
- 定制：6 个 Light DOM static slot、20 个 scoped renderer；替换 renderer 会 abort 旧 signal 并移除旧节点。

## 构建与性能

测量命令：`node scripts/measure-chat-experimental.mjs`。数值来自本分支 production build 的初始可达入口文件；gzip 使用 Node `zlib.gzipSync`。

| 产物             |         raw |                     gzip |
| ---------------- | ----------: | -----------------------: |
| stable JS        |   130,232 B |                 33,362 B |
| experimental JS  | 2,286,034 B | 607,906 B（约 607.9 KB） |
| stable CSS       |    13,828 B |                  2,637 B |
| experimental CSS |   322,867 B |                 43,054 B |

experimental JS 是 stable JS 的约 17.5 倍（gzip 约 18.2 倍），并确认 bundles Vue。实验 CSS 为 stable CSS 的约 23.3 倍（gzip 约 16.3 倍）；增长来自补齐 Web Component 外部消费者此前缺失的 TinyRobot 基础组件样式。这个结果支持原型阶段“自包含和正确渲染优先”，但在推广前必须评估 external-Vue、样式裁剪、按功能拆包或更细粒度 tree-shaking。

模块已加载且 gallery 就绪后，额外创建 5 个最小 `<tr-chat-ui>` 的挂载样本为 `2.1 / 1.0 / 0.9 / 0.9 / 0.9 ms`，中位数 `0.9 ms`，控制台错误 `0`。这是 warm mount 指标，不是网络下载、解析和首屏 cold-start 指标。

## 浏览器与真实服务

- Chromium：18/18 示例分别通过独立 UI/交互场景，并统一通过 readiness、可见性、宿主高度边界和横向溢出检查。
- Firefox：注册、基础渲染、Light DOM/renderer、响应式与 send 核心 smoke 通过。
- WebKit：同一核心 smoke 通过。
- 真实 streaming：`not-run`，环境未提供 `TR_CHAT_REAL_API_URL`、`TR_CHAT_REAL_MODEL_ID`、`TR_CHAT_REAL_API_KEY`。
- 真实 MCP：`not-run`，环境未提供 `TR_CHAT_REAL_MCP_URL`。
- 确定性 mock 已验证增量流式渲染与 abort；真实服务的 `not-run` 不阻塞主流程，但不能被解释为真实供应商兼容性通过。

本轮逐例浏览器验证发现并修复了五个原型问题：示例宿主没有覆盖 `--tr-layout-height`，导致内部 `100dvh` 布局超出 420px 宿主并裁切发送区；带控制栏的示例没有为元素预留剩余 flex 高度；浮动示例默认挂载到 `body` 覆盖文档且漏配 resize；浮动元素在 ready 前快速打开/关闭存在过期异步挂载残留；Playwright 文档服务工作目录依赖调用位置。修复后，普通示例布局都受宿主高度约束，浮动聊天改为显式打开/关闭并可拖动、缩放，过期挂载会被取消，测试服务可从任意工作目录启动。

## Angular 20 跨框架验证

新增 private workspace package `@opentiny/tiny-robot-angular20-experimental`，由官方 Angular CLI 20.3.39 以 standalone、strict、pnpm 配置创建。消费者只导入 `@opentiny/tiny-robot-chat/experimental` 和 `experimental.css` 两个公开入口，不引用 Vue、TrChat 源文件或内部路径。

验证覆盖 Angular `CUSTOM_ELEMENTS_SCHEMA`、复杂对象 property binding、`ready` / `runtime-action-error` 标准 DOM 事件、公开 `send()` 方法、真实 Vue UI 渲染和确定性消息响应。集成过程发现并修复了两个跨框架问题：Angular 会先连接 Custom Element，再写入 `runtimeOptions`；元素现在会等待 Runtime 配置后才初始化和发出 `ready`，重新赋值 owned `runtimeOptions` 时会释放并重建旧 Runtime。首次视觉复核还发现 `experimental.css` 没有包含 TinyRobot 基础组件样式，导致元素结构存在但布局退化为普通 block；入口现已自包含这些样式。

| Angular 20 验证项                | 结果                                           |
| -------------------------------- | ---------------------------------------------- |
| Jasmine / Karma + ChromeHeadless | 2 / 2 通过                                     |
| Playwright Chromium 端到端       | 1 / 1 通过，控制台 error 0                     |
| 结构视觉契约                     | body grid、aside grid-area、sender flex 均通过 |
| 桌面固定高度几何                 | host/layout 同高 680px，sender 未越界          |
| 320px 窄视口                     | layout/main 均在 host 内，页面无横向溢出       |
| production build                 | 通过                                           |
| initial bundle raw               | 1.97 MB                                        |
| initial estimated transfer       | 477.33 kB                                      |
| 外部服务或凭据                   | 不需要，使用确定性 mock                        |

Angular 默认 1 MB initial bundle error budget 会被该原型超过，因此测试工程保留预算检查但将阈值设为 1.8 MB warning / 2 MB error；当前 1.97 MB 已触发 warning，但仍低于 error 阈值。这个结果进一步确认了“可跨框架使用”，同时也支持把自包含体积列为稳定化前的首要优化项。

验证环境实际版本为 Angular 20.3.33、Angular CLI 20.3.39、TypeScript 5.9.3。宿主 Node 26.9.0 高于 Angular 20 支持范围，`ng version` 会给出环境告警；本次 build、unit 和 e2e 均通过，但复现环境建议改用 Angular 20 支持的 Node LTS。

## 最终验证统计

- `@opentiny/tiny-robot-chat` 单元测试：5 个文件，21 / 21 通过。
- `@opentiny/tiny-robot-kit` 单元测试：21 个文件，195 通过、1 个既有跳过。
- Playwright 组件回归：247 / 247 通过，其中包含 18 个 Web Component 契约用例。
- Angular 20 消费者：2 / 2 单元测试、1 / 1 Chromium 端到端和 production build 通过。
- 实验浏览器套件：Chromium 21 通过、真实服务 2 个按凭据守卫跳过，其中逐例场景 18 / 18 通过；Firefox 1 / 1、WebKit 1 / 1 核心 smoke 通过。
- 导出、示例清单、构建测量与报告一致性：10 / 10 通过。
- chat production build（stable + experimental）、实验/组件类型检查和文档 production build 通过。

## 限制与后续

1. **SSR**：实验入口当前不是 SSR-safe import；文档页通过 client-only lazy import 隔离。Nuxt、Next 或 server bundling 支持留待后续。
2. **Light DOM**：便于继承现有 CSS 和调试，但不提供样式隔离；宿主样式可能影响内部节点。
3. **Shadow DOM**：若未来要求强隔离，需要重新验证 teleport/overlay、全局主题变量、第三方组件样式和可访问性树；本原型不应直接切换。
4. **Scoped slot**：平台 slot 没有 Vue scoped slot 的上下文能力，所以 renderer 是必要适配，不是语法等价。
5. **视觉证据**：18 个示例都有可见内容、布局状态、宿主边界和交互结果断言，能捕获本次 `100dvh` 裁切、默认浮层覆盖整页和样式未打包问题；Vue baseline 与 Web Component 的像素 diff 仍未建立。
6. **体积**：捆绑 Vue 和完整依赖是推广前最优先的工程问题。
7. **稳定性与版本承诺**：继续保持 experimental；破坏性调整、SSR、IIFE/UMD/CDN、framework wrapper、完整 a11y/perf/CSP/legacy browser 和正式 graduation policy 后续单独决策。

## 发布建议

保留本分支的实验导出、18 个并行示例、公共契约测试和矩阵数据，供后续真实项目试用。不要把当前入口标记为 stable，也不要承诺 SSR 或 pixel-perfect parity。下一阶段优先验证真实 streaming/MCP、拆包体积和宿主 CSS 冲突；这些工作不需要推翻 `defineCustomElement()` 选型。
