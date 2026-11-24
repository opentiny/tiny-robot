---
outline: [2, 3]
---

<script setup>
import vanillaGlobalUrl from '../../../packages/components/dist/vanilla/vanilla.global.js?url'

if (typeof window !== 'undefined') {
  window.__tinyRobotVanillaDemoGlobalUrl = vanillaGlobalUrl
}
</script>

# QuickAssist 智能帮助

QuickAssist 是一个与框架无关的智能帮助组件，用于为页面提供轻量 AI 触发与输入交互。用户选中页面文字（或由应用主动调用 API）后，可查看推荐问题、编辑提问，并将最终问题与有限上下文（配置 `sanitizeContext` 后为脱敏上下文）交给应用已有的 AI 对话面板。

快速跳转：[立即体验](#example-basic) · [安装与引入](#安装与引入) · [接入对话面板](#example-chat-panel) · [API 参考](#api) · [常见问题](#常见问题)

## 概览

### 适用场景

- 控制台、文档页、详情页等场景，希望用户划词后直接针对所选概念向 AI 提问；
- 指标卡片、工具按钮、代码编辑器等场景，希望由应用代码主动触发轻量提问入口；
- 需要与框架解耦（Vue、Angular、React 或原生 HTML），并复用应用现有 AI 对话面板与模型服务。

### 职责边界与支持范围

::: tip 组件边界
QuickAssist 只负责触发入口、输入浮层、推荐问题和有限上下文采集（业务脱敏需配置 `sanitizeContext`）；**不负责**展示 AI 回答、流式渲染、重试、多轮对话或模型调用，这些均由应用已有的 AI 对话面板承担。
:::

| 能力项 | 支持情况与说明 |
| --- | --- |
| 桌面端原生划词 | 支持鼠标拖选与键盘 `Shift` 选词（默认仅正向划词触发） |
| 移动端 | 暂不支持移动端原生长按划词链路；程序主动调用 `activate()`（如点击按钮）不受原生划词链路限制 |
| iframe | 父文档实例不会自动监听子 iframe 内的选区。可在子 iframe 内独立创建实例；同源场景也可由宿主传入该 iframe 的 `Document` 作为 `root`，并通过 `configureVanillaTheme(config, iframeDocument)` 同步主题。跨源 iframe 受同源策略限制 |
| Shadow DOM | `root` 仅接受 `Document`，不接受 `ShadowRoot`；原生划词监听不穿透 Shadow DOM 选区 |
| CSP（内容安全策略） | CDN 方式会自动动态注入 `<style>`；若页面 CSP 禁止动态样式注入，请改用 NPM 方式并显式引入 CSS |
| 选区保留高亮 | 输入框聚焦期间的原文灰色高亮通过 CSS Custom Highlight API 绘制，不修改原文 DOM；不支持该 API 的浏览器会自动降级为无保留高亮，不影响主流程 |

## 安装与引入

::: info 版本支持
QuickAssist 自 TinyRobot **0.5.2** 版本提供，支持通过 `@opentiny/tiny-robot/vanilla` 或 `dist/vanilla/vanilla.global.js` 引入。以下 NPM 与 CDN 示例均使用 `0.5.2`。
:::

### NPM 方式

```bash
npm install @opentiny/tiny-robot@0.5.2
```

从 `@opentiny/tiny-robot/vanilla` 导入，并显式加载组件样式：

```ts
import { createQuickAssist } from '@opentiny/tiny-robot/vanilla'
import '@opentiny/tiny-robot/vanilla/style.css'
```

QuickAssist 的 `/vanilla` 运行时代码不依赖 Vue、Angular 等框架运行时，打包产物不会包含框架代码。需要注意：`@opentiny/tiny-robot` 整包仍声明了 `vue`、`@opentiny/tiny-robot-kit`、`dompurify`、`markdown-it` 等 `peerDependencies`；在非 Vue 项目中安装时，包管理器可能会提示或按配置处理这些 peer 依赖，请按所在项目的包管理策略处理。

### CDN 方式

通过 CDN 或自有静态目录加载 `vanilla.global.js` 后，使用全局对象 `window.TinyRobotVanilla` 创建实例，组件会自动注入样式，无需单独引入 CSS：

```html
<script src="https://cdn.jsdelivr.net/npm/@opentiny/tiny-robot@0.5.2/dist/vanilla/vanilla.global.js"></script>
<script>
  const quickAssist = window.TinyRobotVanilla.createQuickAssist({
    adapter: {
      submit(request) {
        // 替换为应用自己的“打开 AI 面板并发送”逻辑，同时传入 prompt 与 context
        console.log('QuickAssist submit:', {
          query: request.query,
          prompt: request.prompt,
          context: request.context,
        })
      },
    },
  })
</script>
```

该脚本是无框架组件集合的统一入口，导出 `createQuickAssist`、`configureVanillaTheme` 等 API。

## 快速开始

<span id="代码示例"></span>

### 基础用法 {#example-basic}

使用 `createQuickAssist` 创建实例并传入必填的 `adapter.submit(request)`。组件会在用户提交后先关闭划词界面，再调用 `adapter.submit`；若异步提交抛错，会通过 `onEvent` 发出 `stage: 'adapter'` 的 `error` 事件，不会重新打开界面。

<demo vue="../../demos/quick-assist/basic.vue" title="基础用法" description="从左向右选中文字并提交，观察 adapter.submit(request) 收到的核心字段。" />

::: warning 首次接入必读
- **默认 `prompt` 规则**：默认情况下 `request.prompt` 等价于 `suggestion?.prompt ?? query`，**不会自动将选中原文 `context.text` 拼接进 `prompt`**。接入时应同时消费 `request.prompt` 与 `request.context`；若现有对话接口只接受一段文本，请通过 [`buildPrompt`](#example-build-prompt) 拼入 `context.text`。
- **脱敏前提**：默认采集仅做内置 DOM 排除（表单、编辑器、`[data-sensitive]` 等）与限长裁剪，**不会自动识别或替换业务敏感 ID**；业务字段和文本脱敏仅在配置 [`sanitizeContext`](#example-context) 后执行。
- **生命周期清理**：单页应用在路由离开当前页面时调用 `quickAssist.close()`，组件或页面销毁时调用 `quickAssist.destroy()`。
:::

### 接入对话面板 {#example-chat-panel}

下面的示例将 QuickAssist 与 TinyRobot 的 `TrBubbleList`、`TrSender` 联动，并用本地模拟回复代替后端：选中示例正文中的文字并提交后，对话面板自动展开并发送 `prompt` 与经过 `sanitizeContext` 脱敏后的 `context`。

<demo vue="../../demos/quick-assist/vue-chat.vue" title="Vue 对话面板接入" description="划词后打开 TinyRobot 对话面板，并自动提交 prompt 与脱敏上下文。" />

### HTML 接入 {#example-html}

下面的原生 HTML 示例通过全局脚本 `window.TinyRobotVanilla` 接入，并将提交的请求对象展示在模拟对话面板中。迁移到独立项目时，在 `<head>` 中先通过 `<script src=".../vanilla.global.js"></script>` 引入构建产物或已发布 CDN 脚本即可——示例中若检测到已存在 `window.TinyRobotVanilla` 会自动跳过文档站预览加载器（也可直接删除注释第 1 段的预览适配代码）。

<demo html="../../demos/quick-assist/vanilla.html" title="HTML 接入" description="通过全局脚本接入，划词后查看提交给应用的完整请求内容。" />

### 交互与上下文数据流

![QuickAssist 交互与上下文数据流：触发入口或直接打开输入浮层，准备上下文后手动发送或点击推荐，再构造 prompt 并交给应用对话面板。](/images/quick-assist-flow.svg)

## 划词与触发

### 划词范围与长度限制 {#example-selection-scope}

通过 `include`、`exclude` 和 `selection` 控制可触发区域、文本有效性及最大字数上限。试着分别选中允许区域、超限整句、排除区域与范围外文字，对比效果：

<demo vue="../../demos/quick-assist/selection-scope.vue" title="可选择区域与长度限制" description="仅指定区域内的有效选区显示入口，超限后禁用并提供字数提示。" />

核心规则如下：

- **生效范围（`include` / `exclude`）**：配置 `include` 后，选区中的所有文本节点都必须位于匹配区域内；`exclude` 会在内置排除规则基础上追加。
- **内置排除区域**：默认排除 `input`、`textarea`、`select`、`option`、可编辑的 `contenteditable` 区域、Monaco（`.monaco-editor`）、CodeMirror（`.CodeMirror` / `.cm-editor`）、QuickAssist 自身界面（`.tr-quick-assist`），以及 `[data-ai-selection="false"]`、`[data-sensitive]`、`[data-secret]`、`[data-password]`。普通只读 `contenteditable="false"` 区域允许划词，但若位于可编辑祖先或其他排除区域内仍会被排除。
- **默认文本校验与自定义校验**：内置规则默认拒绝空白、纯数字、纯标点/符号、明显 URL 和 UUID，不设最短字符限制，因此 `ECS`、`VPC`、`QoS` 等短技术词可正常触发。配置 `selection.validate(snapshot)` 可替代默认文本内容规则，但**不能绕过**最大长度、`include` / `exclude`、编辑器与敏感区域检查。
- **划词长度上限（`selection.maxTextLength`）**：默认为 **8000**（正整数），设为 `null` 表示不限制。计数先去除首尾空白，再按 Unicode 码点计算（内部空格与换行各计 1，单个补充平面 emoji 计 1，组合 emoji 按实际码点数计数）。该上限独立于输入框的 `input.maxLength`。
- **超限交互**：选区超出上限时，释放鼠标后仍显示置灰禁用的入口，并同步显示“划词字数超出限制 当前字数/上限”（文案可通过 `selection.maxTextLengthExceededMessage` 配置）。禁用入口不可通过点击、Enter 或程序打开，不会截断文本，也不会触发上下文或推荐请求。此规则同时适用于原生划词、`activate()` 和 `registerSource()`。

```ts
const quickAssist = createQuickAssist({
  adapter,
  include: ['#app'],
  exclude: ['[data-qa-ignore]', '.private-value'],
  selection: {
    maxTextLength: null, // 不限制划词长度（默认 8000）
    validate: (snapshot) => snapshot.text.trim().length > 0,
  },
})
```

### 划词方向与入口位置 {#example-direction-placement}

切换方向限制和优先位置，跨行选中文字观察入口对齐与翻转效果：

<demo vue="../../demos/quick-assist/direction-placement.vue" title="划词方向与首末行定位" description="切换方向限制和入口位置，跨行选中文字观察入口对齐。" />

- **划词方向（`selection.forwardOnly`）**：默认为 `true`，仅正向划词触发；设为 `false` 允许双向划词。方向按文档顺序判断（跨行向后选择仍视为正向，键盘 `Shift` 选词规则一致），面向横排常规阅读场景，不按 RTL 或竖排视觉方向判断；自定义 `selection.validate` 不会覆盖方向限制。
- **定位基准与翻转（`trigger.placement` / `trigger.offset`）**：输入浮层打开后沿用同一套定位与间距规则（默认 `offset: 8` px），按各自尺寸在空间不足时自动翻转并向视口内避让。

| `placement` 值 | 锚定行 | 水平对齐方式 |
| --- | --- | --- |
| `'bottom-end'`（默认） | 选中文字最后一行 | 入口左边缘对齐文字右边缘（向右下方展开） |
| `'bottom-start'` | 选中文字最后一行 | 入口右边缘对齐文字左边缘（向左下方展开） |
| `'bottom'` | 选中文字最后一行 | 相对末行水平居中 |
| `'top-end'` | 选中文字第一行 | 入口左边缘对齐文字右边缘（向右上方展开） |
| `'top-start'` | 选中文字第一行 | 入口右边缘对齐文字左边缘（向左上方展开） |
| `'top'` | 选中文字第一行 | 相对首行水平居中 |
| `'auto'` | 优先最后一行 | 优先在末行下方居中，空间不足时自动翻转 |

> 同一行内的多个内联文本片段会合并计算边界。调用 `updateOptions()` 修改 `selection` 或 `trigger` 时，提供的嵌套配置对象会整体替换原分组（详见 [`updateOptions`](#methods)）。

### 延迟显示入口 {#example-trigger-delay}

设置 `trigger.showDelay`（非负整数，单位毫秒，默认 `0`）可在选区稳定后延迟显示划词入口。连续拖选时会从最后一次有效选区重新计时并等待鼠标松开；选区失效、关闭、停用或销毁会取消待显示任务。延迟仅作用于划词入口，不影响点击后打开输入浮层。

<demo vue="../../demos/quick-assist/trigger-delay.vue" title="延迟显示划词入口" description="切换立即显示与延迟 300 毫秒，对比划词体验。" />

## 输入与推荐

### 输入区配置 {#example-input}

<demo vue="../../demos/quick-assist/input.vue" title="输入区配置" description="调整实例配置并划词体验，再用下方按钮对比实例默认与单次预填覆盖。" />

- **文案与无障碍**：`input.placeholder` 控制空输入占位文案；`input.maxLengthExceededMessage` 控制超限提示；`input.ariaLabel` 标识 `textarea` 的无障碍名称；`input.submitLabel` 用作图标发送按钮的无障碍名称与悬停标题；弹层对话框名称使用 `trigger.label`。
- **预填行为（`input.autoFill`）**：实例默认 `false`（打开输入框留空），设为 `true` 时自动预填选中文字。`activate({ autoFill })` 仅覆盖当次调用，不修改实例默认配置。无论是否预填，选区原文始终保留在 `context.text` 中。
- **自动伸缩（`input.maxRows`）**：默认 `2` 行，换行和自动折行都会动态调整高度并在删除后收缩，同时重新定位浮层；超出后内部滚动。
- **字数限制（`input.maxLength`）**：默认不限制且不显示计数（显式设为 `null` 或省略效果相同）。配置正整数后，从空值起持续显示 `当前字数 / 上限`（按 Unicode 码点计数）；允许粘贴超限文本，超限时字数变红、发送按钮禁用且 `Enter` 不可提交，悬停或聚焦发送区域展示超限提示。推荐问题独立提交，不受手动输入超限状态影响。

```ts
const assist = createQuickAssist({
  adapter,
  trigger: { label: '询问助手' },
  input: {
    maxRows: 2,
    maxLength: 10000,
    autoFill: false,
    placeholder: '告诉 AI 你想做什么',
    ariaLabel: '问题内容',
    submitLabel: '发送问题',
    maxLengthExceededMessage: '问题不能超过 10000 个字符',
  },
})

// 单次激活可覆盖本次预填策略，不影响实例默认设置
assist.activate({ text: '查看系统盘使用率', anchor: element, open: 'popover', autoFill: true })
```

### 静态与异步推荐 {#example-suggestions}

选中示例中的文字并点击入口，可以先看到静态推荐，随后合并异步返回的推荐；点击任一推荐项会直接提交，无需再次点击发送。

<demo vue="../../demos/quick-assist/recommendations.vue" title="静态与异步推荐" description="查看静态推荐与异步推荐的加载、合并与直接提交效果。" />

QuickAssist 支持四种推荐配置模式：

| 配置方式 | 打开输入浮层后的行为 |
| --- | --- |
| 省略 `suggestions` 与 `getSuggestions` | 立即显示两个内置默认模板：`id: 'explain'`（`解释 ${text}`）和 `id: 'use-case'`（`${text}适用场景`） |
| 仅配置 `suggestions` | 立即显示静态推荐；显式传 `[]` 表示隐藏默认模板，仅保留手动提问 |
| 仅配置 `getSuggestions` | 不显示内置默认模板；立即打开输入区，推荐区显示加载状态，返回后展示远程结果 |
| 两者都配置 | 先展示静态推荐，远程返回后合并；默认静态在前、远程追加，按 `id` 保留首次出现项，最后受 `maxSuggestions`（默认 `2`）裁剪 |

每条 `Suggestion` 包含稳定的 `id`、展示文案 `label`、提交内容 `prompt` 以及可选的 `meta` 元数据；静态项也支持使用工厂对象 `SuggestionFactory`（`id` + `getLabel(context)` + `getPrompt(context)`），在上下文准备完成（含可选 `sanitizeContext` 脱敏）后求值。点击推荐项提交时，`AIRequest.query` 为推荐项的 `label`（不受输入框内容影响），`AIRequest.suggestion` 包含被点击项；手动提交时 `query` 为去首尾空白的输入内容。

### 远程推荐与合并策略 {#example-remote-suggestions}

<span id="自定义合并策略-mergesuggestions"></span>

切换策略与模拟响应后重新划词，观察加载期间静态推荐与远程返回后的合并结果。接入真实接口时，将示例中的模拟延迟替换为 `fetch(url, { signal })` 并返回 `Suggestion[]` 即可。

<demo vue="../../demos/quick-assist/remote-recommendations.vue" title="远程推荐与覆盖策略" description="切换策略和模拟响应后重新划词，观察静态回退与合并效果。" />

`mergeSuggestions(base, incoming, context)` 是同步回调，在远程推荐返回并通过校验后执行：

- `base`：静态推荐经模板求值、按 `id` 去重并按 `maxSuggestions` 裁剪后的结果；
- `incoming`：过滤无效项后、尚未去重或裁剪的远程推荐数组；
- `context`：本次推荐使用的上下文副本（若配置了 `sanitizeContext` 则为脱敏后的上下文）。

常用合并策略：

| 目标 | `mergeSuggestions` 返回值 |
| --- | --- |
| 静态优先，追加未重复的远程项（默认） | `[...base, ...incoming]` |
| 远程整体替换静态问题（远程返回 `[]` 时清空） | `incoming` |
| 远程有结果时替换，返回 `[]` 时保留静态问题 | `incoming.length ? incoming : base` |
| 远程优先，同 `id` 覆盖静态项，同时保留其他静态项 | `[...incoming, ...base]` |

回调返回后，组件仍会执行格式校验、按 `id` 保留首次出现项并应用 `maxSuggestions` 上限。远程请求失败时**不会**调用 `mergeSuggestions`，组件会保留已显示的静态推荐并触发 `stage: 'suggestions'` 的 `error` 事件；**仅当没有可显示的推荐项时**（如仅配置 `getSuggestions`），组件内部推荐区才会展示 `messages.error` 文案（示例页面下方的状态栏为宿主监听 `onEvent` 自行渲染的提示）。

### 远程问题校验 {#远程问题校验-validatesuggestion}

组件会先检查远程响应是否为数组，再逐项检查 `id`、`label`、`prompt` 是否为非空字符串（纯空白无效），单条无效项会被过滤且不影响同批其他有效项。静态推荐及自定义合并结果若格式无效则会报错。

在此基础上，可配置同步回调 `validateSuggestion(suggestion, context): boolean` 对远程推荐进行业务规则校验（在基础校验后、合并前逐项执行）：

<demo vue="../../demos/quick-assist/suggestion-validation.vue" title="远程问题校验前后对比" description="对比原始问题与最终问题，查看空白、超长、不相关问题的过滤原因，以及全部无效时的静态回退。" />

- **入参与返回值**：`suggestion` 是已通过基础校验的单条推荐副本（用于判断保留与否，不用于修改内容）；`context` 为本次推荐上下文副本（若配置了 `sanitizeContext` 则为脱敏后的上下文）；返回 `true` 保留，`false` 丢弃。
- **`meta` 克隆限制**：推荐项的 `meta` 会经过结构化深拷贝（支持 `Date`、`Map`、`Set`、TypedArray 及循环引用，不支持函数、DOM 节点、响应式代理或共享内存）。远程项 `meta` 无法克隆时按无效项过滤。
- **整批失败与合法空结果的区别**：响应不是数组、非空响应全部被过滤、回调抛错或返回非布尔值（含 `Promise`）时，视为整批失败——不调用 `mergeSuggestions`，保留静态推荐并触发 `stage: 'suggestions'` 错误事件；接口主动返回 `[]` 则属于成功的空结果，继续走 `mergeSuggestions`。
- 模型原始输出的 JSON 解析、字段映射与缺失 `id` 生成应在 `getSuggestions` 内完成，组件统一接收 `Suggestion[]`。

### 推荐状态文案 {#example-suggestion-messages}

`messages` 仅控制推荐区域的三种状态文案（输入区文案在 [`input`](#example-input) 配置；发送错误由 `onEvent` 的 `stage: 'adapter'` 通知）：

| 字段 | 默认值 | 显示时机 |
| --- | --- | --- |
| `loading` | `'正在加载推荐…'` | 远程推荐加载中 |
| `empty` | `'暂无推荐'` | 无可显示推荐时（包含显式配置 `suggestions: []`） |
| `error` | `'推荐加载失败'` | 推荐准备或加载失败且无静态推荐可回退时 |

```ts
const quickAssist = createQuickAssist({
  adapter,
  messages: {
    loading: '正在获取推荐问题…',
    empty: '暂无推荐问题，可直接输入',
    error: '无法生成推荐问题',
  },
})
```

## 上下文与自定义发送内容

### 页面上下文与敏感数据 {#example-context}

上下文按 `base → nearby → getContext → sanitizeContext` 顺序构建。默认采集仅做内置 DOM 排除与限长裁剪，不会自动识别或替换业务敏感字段；配置 `sanitizeContext` 后，组件会在其完成脱敏后才调用推荐函数或 `adapter`。选中示例中的虚构租户编号并提交，观察选区文本、附近文本和业务字段被统一脱敏后的结果：

<demo vue="../../demos/quick-assist/context.vue" title="上下文与脱敏" description="选中虚构租户编号并提交，查看脱敏后的 prompt 与 context。" />

默认采集的基础上下文包含：

- `source`（原生划词为 `'selection'`）、`text` 和 `selection: { text }`；
- `page`：页面标题 `title` 与去除了查询参数（query）和片段标识（hash）的 `url`；
- `nearbyText`：从选区附近有限语义块中提取的限长文本（默认最多 500 字符）；未匹配到合适语义块时最多退回选中文本，绝不读取整页 `body.innerText` 或表单值。

上下文处理注意事项：

- **脱敏约束**：`sanitizeContext` 返回值必须保留 `source` 与 `text` 两个字符串字段，其余字段可按需删改；若用户手动输入或开启 `input.autoFill` 预填了敏感文本，还应在 `buildPrompt` 中对最终 `prompt` 做脱敏。
- **外发字段**：`sanitizeContext` 与 `buildPrompt` 都不会改写 `request.query`；手动提交时它是去除首尾空白的输入，点击推荐时为推荐项的 `label`。建议只发送已处理的 `prompt` 与 `context`；若需向外部服务转发完整 `request`，应额外脱敏或省略 `query`、`suggestion` 等可能包含敏感信息的字段。
- **可克隆约束**：不要在上下文中放入函数、DOM 节点、`Range`、选区快照或共享内存对象，否则会在拷贝阶段报错并阻止提交。
- **只读副本**：推荐函数与 `buildPrompt` 收到的是上下文副本，修改副本不会影响最终传给 `adapter` 的上下文。
- **双重防护**：请结合页面标记（`data-sensitive`、`data-ai-selection="false"`）与 `sanitizeContext` 共同拦截密钥、令牌、租户 ID、订单数据等敏感信息。

### 自定义附近文本 {#example-nearby-context}

默认附近文本提取会向上查找最近的内置语义块标签（`p`、`li`、`td`、`th`、`label`、`section`、`fieldset`），并自动跳过隐藏节点（含 `display: none`、`visibility: hidden`、`[hidden]`、`[aria-hidden="true"]`）、表单控件、编辑器和敏感排除区域。

- 仅需扩展候选容器时，优先配置 `nearbyContext.blockSelectors`（在内置集合上追加）以复用内置安全提取器；
- 需要完全自定义来源时，提供 `getNearbyContext(snapshot)`，并**优先读取已知安全的业务数据结构或白名单摘要**：

```ts
const SAFE_SECTION_SUMMARIES: Record<string, string> = {
  'ecs-billing': '云服务器支持包年包月、按需计费与竞价计费三种模式。',
}

const quickAssist = createQuickAssist({
  adapter,
  nearbyContext: { maxLength: 200, blockSelectors: ['.product-description'] },
  getNearbyContext(snapshot) {
    // 优先从已知安全的业务摘要读取，避免直接扫描含表单、CSS 隐藏节点或敏感内容的 DOM
    const sectionId = snapshot.anchorElement?.closest('[data-section-id]')?.getAttribute('data-section-id')
    return (sectionId && SAFE_SECTION_SUMMARIES[sectionId]) || snapshot.text
  },
})
```

::: warning 自定义提取的安全过滤责任
提供 `getNearbyContext` 会完全替代内置附近文本提取；组件仅对回调返回的字符串执行 `nearbyContext.maxLength` 长度裁剪和可选 `sanitizeContext` 处理，**不会**重新按内置 DOM 规则过滤该字符串。

切勿直接读取整段容器的 `textContent`（会读入 `display: none` / `visibility: hidden` 等 CSS 隐藏节点、`textarea` 等表单初始文本以及敏感子节点）。如确需自行扫描 DOM，应遍历原始 DOM，通过 `getComputedStyle` 排除隐藏节点，并跳过表单控件（`input`、`textarea`、`select`、`option`）、编辑器、`[contenteditable]`、`[hidden]`、`[aria-hidden="true"]` 及敏感排除区域。
:::

### 自定义发送内容 {#example-build-prompt}

默认情况下，提交给 `adapter` 的 `prompt` 为：

```ts
const defaultPrompt = suggestion?.prompt ?? query
```

它**不会自动把选中的原文 `context.text` 拼进 `prompt`**。如果你的对话后端只接收单段 `prompt` 文本，或希望统一附加产品、场景与选中原文，可通过同步钩子 `buildPrompt({ query, context, suggestion })` 构造最终发送内容，同时保留简洁的 `query` 用于界面展示。

<demo vue="../../demos/quick-assist/build-prompt.vue" title="自定义发送内容" description="对比手动输入与推荐项提交时的 query、prompt 和 context.text。" />

## 主动激活与编辑器集成

### 主动激活：按钮与自定义选区 {#example-activation}

通过 `activate()` 可主动提供文本和定位锚点，复用“入口 → 输入浮层 → 推荐与提交”的完整交互流程。传入 `open: 'popover'` 可跳过入口与 `trigger.showDelay`，直接打开并聚焦输入框（不触发 `trigger_show` / `trigger_click`，仍触发 `selection` 与 `popover_show`）。

示例默认点击激活，勾选“悬停指标时自动显示入口”可体验仅展示入口而不抢焦点的悬停触发：

<demo vue="../../demos/quick-assist/activation.vue" title="主动激活与自定义定位" description="点击按钮或指标卡片主动触发，切换直接输入与悬停入口，对比默认推荐与本次专属推荐。" />

**1. 元素锚点快捷形式（适合按钮、徽标、卡片）**

```ts
const explainButton = document.querySelector<HTMLButtonElement>('#explain')!

explainButton.addEventListener('click', () => {
  quickAssist.activate({
    text: '需要解释的业务术语',
    anchor: explainButton,
    open: 'popover', // 省略时默认先展示入口按钮
    meta: { feature: 'term-explanation' }, // source 默认为 'manual'
    suggestions: [
      {
        id: 'explain-term',
        getLabel: () => '解释这个术语',
        getPrompt: (context) => `请解释：${context.text}`,
      },
    ],
  })
})
```

单次激活支持以下覆盖参数，均只影响本次会话，不改变实例默认配置：

| 本次激活参数 | 行为 |
| --- | --- |
| 不传 `suggestions` / `getSuggestions` | 沿用实例默认推荐配置 |
| `suggestions: [...]` | 替换本次静态推荐，且默认不再调用实例的 `getSuggestions` |
| `suggestions: []` | 本次不显示推荐，保留手动提问 |
| `getSuggestions: fn` | 使用本次异步推荐函数，可与本次静态推荐组合使用 |
| `getSuggestions: null` | 本次禁用远程推荐，静态推荐按对应配置展示 |
| `autoFill: boolean` | 覆盖本次输入区预填行为，优先于实例 `input.autoFill` |
| `open: 'trigger' \| 'popover'` | 决定先展示入口还是直接打开输入浮层（默认 `'trigger'`） |

**2. 完整几何句柄形式（适合代码编辑器、图表、自定义画布）**

```ts
quickAssist.activate({
  source: 'editor',
  text: selectedCode,
  anchorElement: editorContainer,
  getRect: () => getCurrentSelectionRect(), // 返回相对视口的 CSS 像素矩形；不可见或失效返回 null
  verify: () => isCapturedSelectionStillValid(),
  getNearbyText: () => capturedNearbyCode,
  onInvalidate(notify) {
    // 覆盖 showDelay、入口与浮层阶段；通知后复检 verify + getRect，有效则重定位，否则关闭
    return subscribeToSelectionAndLayoutChanges(notify)
  },
  meta: { language: 'typescript', fileName: 'price.ts' },
})
```

使用要点：
- **坐标规范**：`getRect()` 须返回相对浏览器视口的 CSS 像素矩形（与 `getBoundingClientRect()` 一致；零宽但有高度的光标矩形同样有效），编辑器内部坐标需加上容器视口偏移并自行判断是否滚出可视裁剪区。
- **快照与启停**：`text`、`meta` 和 `getNearbyText()` 在激活时立即捕获；实例停用或销毁后调用 `activate()` 不生效。
- **失效检测边界（两种形式的区别）**：
  - **元素锚点快捷形式（`anchor`）**：组件内部自动安装 `ResizeObserver` 与祖先 `MutationObserver`，元素移除、祖先隐藏或尺寸塌缩时会**自动关闭**当前会话。
  - **完整几何句柄形式（`anchorElement` + `getRect`）**：组件仅在滚动、窗口 `resize` 及延迟显示到期时复检锚点；不会自动监听元素移除、编辑器模型变化或容器内部布局变化。需通过 `onInvalidate(notify)` 订阅宿主变化通知（或主动调用 `close()`），否则锚点移除后浮层会保留到下一次滚动或 `resize` 复检时才关闭。
- **校验范围**：主动激活遵循非空、最大长度与几何校验；`include` / `exclude`、`selection.forwardOnly`、原生 DOM 划词校验 `selection.validate` 与 `getNearbyContext` 仅作用于原生 DOM 划词。如需放宽主动激活的文本内容规则（例如允许代码符号），可配置 `selection.validateActivation`。

### Monaco 选中代码后主动解释 {#example-monaco}

普通原生划词默认排除 Monaco、CodeMirror 与输入框；在编辑器中，应用可通过监听编辑器选区事件并调用通用 `activate()` 接口完成集成，无需解除原生过滤规则。

<demo vue="../../demos/quick-assist/monaco.vue" title="Monaco 主动选区解释" description="选词完成后通过通用 activate() 接口定位到选区末端并展示代码专属推荐。" />

接入代码编辑器时的关键要点（完整可运行代码可展开上方示例源码查看）：

1. **拖选门控与防重入**：在 `pointerdown` 期间暂不激活，待 `pointerup` 或非输入法组合态的 `keyup` 后通过 `requestAnimationFrame` 读取最终选区，并用 `uri + version + range` 对相同选区去重，避免无关按键反复弹出。
2. **视口坐标与裁剪判断**：使用 `editor.getScrolledVisiblePosition(end)` 加上容器 `getBoundingClientRect()` 换算视口坐标；若选区滚出内容裁剪区域则返回 `null`。
3. **快照捕获与一致性校验**：在激活时截取选中代码及前后有限行作为 `getNearbyText`，并通过 `verify()` 校验模型实例、文档版本号和选区范围是否一致。
4. **生命周期联动**：监听选区变化、内容修改、滚动和布局变化及时调用 `quickAssist.close()`；组件卸载时释放所有监听、`quickAssist.destroy()` 以及编辑器实例。

### 注册自定义来源 {#example-register-source}

当页面存在多个自定义触发源，需要随 QuickAssist 实例统一启停、注销并做来源级会话隔离时，可使用高级接口 `registerSource()`；单个按钮或单编辑器场景直接使用 `activate()` 即可。

```ts
const button = document.querySelector<HTMLButtonElement>('#explain-metric')!
let stopListening: (() => void) | undefined

const unregister = quickAssist.registerSource({
  name: 'metric-click',
  activate(emit) {
    const onClick = () =>
      emit({
        source: 'metric-click',
        text: '实例 CPU 使用率',
        anchorElement: button,
        getRect: () => (button.isConnected ? button.getBoundingClientRect() : null),
      })
    button.addEventListener('click', onClick)
    stopListening = () => button.removeEventListener('click', onClick)
  },
  deactivate() {
    stopListening?.()
    stopListening = undefined
  },
})

// 不再需要该来源时注销，会移除其监听并关闭属于该来源的当前会话
// unregister()
```

实例调用 `disable()` 或 `destroy()` 时会自动触发已注册来源的 `deactivate()`；重新 `enable()` 时会再次调用 `activate()`，因此订阅与清理应成对实现。来源需要主动清理自身会话时，可调用 `emit(null)`。

## 生命周期与事件监听

### 生命周期与路由 {#example-lifecycle}

以下示例演示通过 `enable()`、`disable()` 控制划词监听，以及模拟 SPA 路由切换时调用 `close()`；页面或宿主组件卸载时应调用 `destroy()`。

<demo vue="../../demos/quick-assist/lifecycle.vue" title="启停与关闭会话" description="通过按钮控制划词启停状态，并模拟路由切换关闭当前会话。" />

QuickAssist 会自动响应浏览器的 `popstate` 与 `hashchange` 事件关闭当前界面；使用前端路由库（基于 `history.pushState`）时，应在路由钩子中手动调用 `quickAssist.close()`。

<span id="vue"></span>

**Vue 集成**

```ts
import { onBeforeUnmount, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { createQuickAssist } from '@opentiny/tiny-robot/vanilla'
import '@opentiny/tiny-robot/vanilla/style.css'
import type { QuickAssistInstance } from '@opentiny/tiny-robot/vanilla'

const router = useRouter()
let quickAssist: QuickAssistInstance | undefined
let removeAfterEach: (() => void) | undefined

onMounted(() => {
  quickAssist = createQuickAssist({ adapter })
  removeAfterEach = router.afterEach(() => quickAssist?.close())
})

onBeforeUnmount(() => {
  removeAfterEach?.()
  quickAssist?.destroy()
})
```

<span id="angular"></span>

**Angular 集成**

```ts
import { AfterViewInit, Component, OnDestroy, inject } from '@angular/core'
import { NavigationStart, Router } from '@angular/router'
import { filter, Subscription } from 'rxjs'
import { createQuickAssist } from '@opentiny/tiny-robot/vanilla'
import '@opentiny/tiny-robot/vanilla/style.css'
import type { QuickAssistInstance } from '@opentiny/tiny-robot/vanilla'

@Component({ selector: 'app-shell', template: '<main id="app">...</main>' })
export class AppShellComponent implements AfterViewInit, OnDestroy {
  private readonly router = inject(Router)
  private routeSubscription?: Subscription
  private quickAssist?: QuickAssistInstance

  ngAfterViewInit() {
    this.quickAssist = createQuickAssist({
      include: ['#app'],
      adapter: {
        submit: (request) => this.openAssistantAndSend(request.prompt, request.context),
      },
    })
    this.routeSubscription = this.router.events
      .pipe(filter((event): event is NavigationStart => event instanceof NavigationStart))
      .subscribe(() => this.quickAssist?.close())
  }

  ngOnDestroy() {
    this.routeSubscription?.unsubscribe()
    this.quickAssist?.destroy()
  }

  private openAssistantAndSend(prompt: string, context: unknown) {
    // 接入应用已有的 AI 对话面板与发送方法
  }
}
```

> SSR 环境下请仅在浏览器挂载生命周期内创建实例。如果页面多个模块同时使用 QuickAssist，建议按区域职责划分：优先在全局布局复用单实例，并通过 `activate()` / `registerSource()` 接入局部特殊区域；若确需创建多个实例，请使用互不重叠的 `include` 选择器并在各区域卸载时调用 `destroy()`，避免同一选区同时触发多个入口。

### 事件监听 {#example-events}

通过 `onEvent(event)` 统一接收交互与错误事件，使用 `event.type` 区分类型，并用 `event.sessionId` 关联同一次划词会话。

<demo vue="../../demos/quick-assist/events.vue" title="事件监听与会话日志" description="观察完整交互事件、会话编号、关闭原因和模拟提交错误。" />

提交时会先触发 `close`（`reason: 'submit'`），再触发 `submit` 并调用适配器；若适配器抛错或返回被拒绝的 Promise，随后触发 `stage: 'adapter'` 的 `error`。`submit` 仅表示请求已交给适配器，不表示模型已完成回答。事件元数据不包含选区原文、`query`、`prompt` 或完整上下文；错误对象应按应用自身的日志安全规范处理。

## 主题与外观定制

### 主题配置 {#example-theme}

无框架组件内置亮暗两套配色，默认跟随 `html[data-tr-color-mode]`（识别 `light` / `dark`，缺失或无效时回退亮色）。已使用 TinyRobot `ThemeProvider` 的项目默认无需额外配置。

其他系统在应用初始化时调用 `configureVanillaTheme()` 指定主题来源即可，无需向组件实例传参：

```ts
import { configureVanillaTheme } from '@opentiny/tiny-robot/vanilla'

configureVanillaTheme({
  source: { type: 'attribute', attribute: 'data-cf-theme' },
})
```

<div class="qa-theme-demo">

<demo html="../../demos/quick-assist/theme.html" title="主题切换" description="切换亮色、暗色或跟随系统，选中文字查看入口和浮层；独立项目预先引入 vanilla.global.js 后会自动复用全局对象。" />

</div>

其他常用模式：

```ts
configureVanillaTheme({ source: { type: 'class' } }) // 跟随 html.dark，否则亮色
configureVanillaTheme({ colorMode: 'dark' }) // 固定暗色（也支持 'light'）
configureVanillaTheme({ colorMode: 'auto' }) // 跟随操作系统配色
configureVanillaTheme({}) // 恢复默认 TinyRobot 主题来源
```

- 配置按 `Document` 共享，对同一文档中**已有及后续创建的所有 Vanilla 组件**生效，主题切换不会清空正在编辑的问题。
- 每次调用均与内置默认值合并，不累积上次配置；`source` 与 `colorMode` 互斥，不能同时设置。
- 配色优先级：**组件 `--tr-quick-assist-*` 变量覆盖 → 宿主 `--tr-*` 主题变量 → 内置默认配色**。浮层挂载在 `body` 下，自定义变量应写在 `html`、`body` 或 `.tr-quick-assist` 全局样式中。

### 自定义元素属性 {#example-attrs}

通过 `attrs` 为组件内部元素追加安全的 DOM 属性（如测试标记、自定义类名、ARIA 关联等）。共支持 6 个目标位置：

| 目标键名 | 对应的内部元素 |
| --- | --- |
| `root` | 组件挂载到 `body` 下的 `.tr-quick-assist` 宿主 `div`（**注意**：不同于配置项 `options.root` 传入的 `Document`） |
| `trigger` | 划词入口按钮（`.tr-quick-assist__trigger`） |
| `popover` | 输入浮层容器（`.tr-quick-assist__popover`） |
| `input` | 问题输入框（`textarea.tr-quick-assist__input`） |
| `submit` | 发送按钮（`button.tr-quick-assist__submit`） |
| `suggestion` | 推荐问题按钮，支持属性对象或 `(suggestion) => QuickAssistAttributeMap` 回调 |

```ts
const quickAssist = createQuickAssist({
  adapter,
  attrs: {
    trigger: { 'data-testid': 'quick-assist-trigger' },
    input: { 'aria-describedby': 'quick-assist-hint' },
    suggestion: (suggestion) => ({ 'data-suggestion-id': suggestion.id }),
  },
})
```

安全过滤规则：
- 事件处理器（`on*`）、`innerHTML`、`outerHTML`、`textContent`、`style`、`value`、`disabled`、`readonly`、`required`、`type`、`id` 以及非法属性名会被忽略；
- `class` / `className` 仅追加合法 token，不会覆盖组件内置类名；
- 普通属性值为 `false` / `null` / `undefined` 时移除属性，值为 `true` 时写入布尔存在属性（空字符串）；`aria-*` 属性则保留 `'true'` / `'false'` 语义字符串；
- `attrs.suggestion` 回调抛错时不会中断渲染或提交，会触发 `stage: 'callback'` 的 `error` 事件。

## 交互与限制

- 点击入口后输入框立即打开并聚焦，默认留空（`input.autoFill: true` 时预填选中文字）；按 `Enter` 发送，`Shift+Enter` 换行，输入法组合（IME）期间不会误提交。
- 上下文构造或脱敏尚未完成时，用户仍可输入编辑，但提交按钮与推荐项暂时禁用，完成后自动恢复可用。
- 新选区会替换旧会话；点击外部、按 `Esc`、锚点失效、显著滚动、路由变化或调用生命周期方法都会清理当前界面。

## API

点击下方表格中的配置项、方法或事件名，可快速跳转到对应说明。

### Props {#props}

配置项类型为 `QuickAssistOptions`，通过 `createQuickAssist(options)` 传入：

| 属性名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| [`root`](#example-basic) | `Document` | `document` | 监听与挂载所在文档；不接受 `ShadowRoot` |
| [`enabled`](#example-lifecycle) | `boolean` | `true` | 创建后是否立即启用划词与全局监听 |
| [`adapter`](#example-basic) | `AIAdapter` | — | **必填**；通过 `submit(request)` 交给应用已有对话能力 |
| [`include`](#example-selection-scope) | `string[]` | — | 限定可触发原生划词的页面区域选择器 |
| [`exclude`](#example-selection-scope) | `string[]` | — | 在内置排除规则基础上追加的排除选择器 |
| [`selection.maxTextLength`](#example-selection-scope) | `number \| null` | `8000` | 选区最大 Unicode 码点数（正整数）；`null` 表示不限制，超限显示禁用入口 |
| [`selection.maxTextLengthExceededMessage`](#example-selection-scope) | `string` | `'划词字数超出限制'` | 选区超限提示前缀，后面自动追加 `当前字数/上限` |
| [`selection.forwardOnly`](#example-direction-placement) | `boolean` | `true` | 仅正向划词触发；设为 `false` 允许双向选择 |
| [`selection.validate`](#example-selection-scope) | `(snapshot: SelectionSnapshot) => boolean` | 内置文本规则 | 替代原生 DOM 划词的默认文本校验（不能绕过长度、范围与敏感区检查） |
| [`selection.validateActivation`](#example-activation) | `(view: QuickAssistActivationView) => boolean` | 默认文本规则 | 替代主动激活与自定义来源的默认文本校验，不接收 DOM `Range` |
| [`trigger.label`](#example-input) | `string` | `'智能帮助'` | 划词入口按钮文案及弹层无障碍名称；按钮默认固定宽 `88px` 超出省略，建议使用简短文案或覆盖 `.tr-quick-assist__trigger` 宽度样式 |
| [`trigger.showDelay`](#example-trigger-delay) | `number` | `0` | 选区稳定后延迟显示入口的毫秒数，须为非负整数 |
| [`trigger.offset`](#example-direction-placement) | `number` | `8` | 入口及输入浮层与选区的间距（px），须为非负数 |
| [`trigger.placement`](#example-direction-placement) | `QuickAssistPlacement` | `'bottom-end'` | 入口与输入浮层的优先位置；上方按首行、下方按末行，空间不足自动翻转 |
| [`input.maxRows`](#example-input) | `number` | `2` | 输入区最多可见行数（正整数），超过后内部滚动 |
| [`input.maxLength`](#example-input) | `number \| null` | 不限制 | 输入区 Unicode 码点上限（正整数）；省略或 `null` 不限制，配置后持续显示计数且超限不可发送 |
| [`input.autoFill`](#example-input) | `boolean` | `false` | 打开输入区时是否自动预填选中/激活文本，不影响 `context.text` |
| [`input.placeholder`](#example-input) | `string` | `'告诉 AI 你想做什么'` | 输入为空时的占位文案 |
| [`input.ariaLabel`](#example-input) | `string` | `'请输入问题'` | `textarea` 的无障碍名称（弹层标题使用 `trigger.label`） |
| [`input.submitLabel`](#example-input) | `string` | `'发送问题'` | 图标发送按钮的无障碍名称与悬停标题 |
| [`input.maxLengthExceededMessage`](#example-input) | `string` | `'字数超出限制'` | 超过 `input.maxLength` 时发送区域显示的提示文案 |
| [`nearbyContext.maxLength`](#example-nearby-context) | `number` | `500` | 附近文本最大字符数（正整数） |
| [`nearbyContext.blockSelectors`](#example-nearby-context) | `string[]` | `p, li, td, th, label, section, fieldset` | 在内置语义块之外追加的候选块选择器 |
| [`getNearbyContext`](#example-nearby-context) | `GetNearbyContext` | — | 自定义原生 DOM 划词的附近文本提取，`snapshot` 含 DOM `Range` |
| [`getContext`](#example-context) | `GetBusinessContext` | — | 异步或同步返回业务字段，合并到 `context.businessContext` |
| [`sanitizeContext`](#example-context) | `SanitizeContext` | — | 返回最终允许外发的脱敏完整上下文 |
| [`suggestions`](#example-suggestions) | `QuickAssistSuggestionInput[]` | 内置两条默认模板 | 静态推荐或模板工厂数组；`[]` 表示隐藏默认推荐 |
| [`getSuggestions`](#example-remote-suggestions) | `GetSuggestions` | — | 使用当前会话上下文（配置 `sanitizeContext` 后为脱敏上下文）异步获取远程推荐 |
| [`validateSuggestion`](#远程问题校验-validatesuggestion) | `ValidateSuggestion` | 基础格式校验 | 同步业务校验，仅过滤远程推荐，在合并前执行 |
| [`mergeSuggestions`](#自定义合并策略-mergesuggestions) | `MergeSuggestions` | 静态优先追加 | 远程推荐返回后同步合并静态与远程推荐，最终按 `id` 去重并裁剪 |
| [`maxSuggestions`](#example-suggestions) | `number` | `2` | 最多展示的推荐条数（正整数） |
| [`buildPrompt`](#example-build-prompt) | `BuildPrompt` | `suggestion?.prompt ?? query` | 自定义最终提交的 `prompt`；默认不自动拼入 `context.text` |
| [`attrs`](#example-attrs) | `QuickAssistAttrs` | — | 为 6 个内部目标元素追加安全 DOM 属性 |
| [`messages.loading`](#example-suggestion-messages) | `string` | `'正在加载推荐…'` | 推荐加载中状态文案 |
| [`messages.empty`](#example-suggestion-messages) | `string` | `'暂无推荐'` | 无可显示推荐时的状态文案 |
| [`messages.error`](#example-suggestion-messages) | `string` | `'推荐加载失败'` | 推荐加载失败且无可回退推荐时的状态文案 |
| [`onEvent`](#example-events) | `(event: QuickAssistEvent) => void` | — | 统一事件回调；回调内抛错不会打断组件清理 |

### Methods {#methods}

`createQuickAssist(options)` 返回 `QuickAssistInstance` 实例，提供以下方法：

| 方法名 | 签名 | 说明 |
| --- | --- | --- |
| [`activate`](#example-activation) | `(input: QuickAssistActivationInput \| QuickAssistAnchorShortcut) => void` | 主动提供文本与定位锚点，触发入口或直接打开浮层；实例停用/销毁时忽略 |
| [`registerSource`](#example-register-source) | `(source: QuickAssistSelectionSource) => () => void` | 注册自动触发来源并返回注销函数，随实例启停联动 |
| [`enable`](#example-lifecycle) | `() => void` | 启动划词监听、全局监听及已注册来源；重复调用无副作用 |
| [`disable`](#example-lifecycle) | `() => void` | 关闭当前界面并停止监听与已注册来源；之后可再次 `enable()` |
| [`close`](#example-lifecycle) | `() => void` | 关闭当前会话，保持监听启停状态不变 |
| [`updateOptions`](#example-direction-placement) | `(partial: Partial<QuickAssistOptions>) => void` | 关闭当前会话、作废旧异步任务并更新配置 |
| [`destroy`](#example-lifecycle) | `() => void` | 关闭界面并释放所有监听与 DOM；重复调用无副作用 |

`updateOptions` 合并与约束规则：
- **顶层浅合并、嵌套分组整体替换**：更新 `selection`、`trigger`、`input`、`nearbyContext`、`messages`、`attrs` 中任意分组时，会整体替换该分组，未传入的子字段恢复默认值（例如原配置 `trigger: { label: '帮助', offset: 12 }`，调用 `updateOptions({ trigger: { showDelay: 200 } })` 会把 `label` 和 `offset` 恢复默认）。
- **清除可选顶层配置**：在顶层显式传入 `undefined`（如 `{ suggestions: undefined, mergeSuggestions: undefined }`）可清除该可选配置，恢复省略态。
- **`root` 不可更改**：传入不同 `Document` 会抛错，需先 `destroy()` 再创建新实例。省略 `enabled` 时保持当前启停状态。

### Functions {#configure-vanilla-theme}

`configureVanillaTheme` 用于配置无框架组件的主题，配置类型为 `VanillaThemeConfig`：

```ts
function configureVanillaTheme(config: VanillaThemeConfig, root?: Document): void
```

按 `Document` 配置所有 Vanilla 组件（包括 QuickAssist）的主题模式；省略 `root` 时默认使用当前 `document`。`config` 支持三种互斥形态：

- `{ colorMode: 'light' | 'dark' | 'auto' }`：直接指定亮色、暗色或跟随系统；
- `{ source: VanillaThemeSource }`：监听指定元素上的属性或 class（来源元素须在调用时存在）；
- `{}`：恢复默认监听 `html[data-tr-color-mode]`。

`VanillaThemeSource` 配置字段：

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `type` | `'attribute' \| 'class'` | 必填 | 按属性值或 class 判断主题 |
| `selector` | `string` | `'html'` | 主题来源元素的 CSS 选择器，取首个匹配元素 |
| `attribute` | `string` | `'data-tr-color-mode'` | 仅 `attribute` 类型：监听的属性名 |
| `values.light` | `string` | `'light'` | 仅 `attribute` 类型：亮色对应的属性值 |
| `values.dark` | `string` | `'dark'` | 仅 `attribute` 类型：暗色对应的属性值 |
| `darkClass` | `string` | `'dark'` | 仅 `class` 类型：暗色 class 名，按完整 token 匹配 |
| `lightClass` | `string` | — | 仅 `class` 类型：可选亮色 class 名；亮暗同时存在时暗色优先 |
| `defaultMode` | `'light' \| 'dark'` | `'light'` | 属性值未知、class 均未匹配或来源元素移除时的回退模式 |

### Events {#events}

所有事件均通过 `options.onEvent(event)` 回调分发，参数类型为 `QuickAssistEvent`，统一包含公共字段 `{ type, sessionId }`：

- `sessionId: number`：实例内划词会话编号，每次接受新选区时递增，用于串联同一次划词从开始到关闭的事件；初始化配置错误发生在划词前，`sessionId` 为 `0`。

| `event.type` | 附加字段 | 触发时机与说明 |
| --- | --- | --- |
| [`selection`](#example-events) | — | 接受新的合法选区或主动激活 |
| [`trigger_show`](#example-events) | — | 展示划词入口 |
| [`trigger_click`](#example-events) | — | 点击划词入口 |
| [`popover_show`](#example-events) | — | 展示输入浮层 |
| [`suggestion_click`](#example-events) | `suggestionId: string` | 点击推荐项 |
| [`submit`](#example-events) | — | 提交请求（不含选区文本或发送内容） |
| [`close`](#example-events) | `reason: QuickAssistCloseReason` | 会话关闭，原因取值为 `'outside'` \| `'escape'` \| `'scroll'` \| `'anchor-invalid'` \| `'route'` \| `'submit'` \| `'disable'` \| `'destroy'` \| `'update'` \| `'manual'` \| `'reselection'` |
| [`error`](#example-events) | `stage: QuickAssistErrorStage`, `error: Error` | 发生可恢复或配置错误，详见下方 `stage` 枚举 |

`QuickAssistErrorStage` 全部取值：

| `stage` 值 | 触发场景 |
| --- | --- |
| `'config'` | `createQuickAssist` 或 `updateOptions` 参数校验失败 |
| `'context'` | `getContext` 或上下文基础提取异常 |
| `'sanitize'` | `sanitizeContext` 抛错、返回值缺少必填字段或含不可克隆对象 |
| `'suggestions'` | 静态模板求值异常、`getSuggestions` 失败、响应无效、`validateSuggestion` / `mergeSuggestions` 异常 |
| `'prompt'` | `buildPrompt` 回调抛错 |
| `'adapter'` | `adapter.submit(request)` 同步抛错或返回被拒绝的 Promise |
| `'callback'` | `attrs.suggestion` 渲染回调抛错 |

### Types {#types}

以下公开类型均从 `@opentiny/tiny-robot/vanilla` 导入：

| 类型名 | 用途 | 说明 |
| --- | --- | --- |
| `QuickAssistOptions` | 配置项 | `createQuickAssist` 入参配置 |
| `QuickAssistInstance` | 实例句柄 | `createQuickAssist` 返回值 |
| `AIAdapter` | 宿主适配器 | `{ submit: (request: AIRequest) => void \| Promise<void> }` |
| `AIRequest` | 提交载荷 | 传给 `adapter.submit` 的冻结请求对象 |
| `QuickAssistContext` | 上下文载荷 | 传给推荐、`buildPrompt` 与 `adapter` 的上下文对象 |
| `Suggestion` / `SuggestionFactory` | 推荐项 | 静态或远程推荐对象 / 延迟求值工厂对象 |
| `QuickAssistSuggestionInput` | 推荐输入联合类型 | `Suggestion \| SuggestionFactory` |
| `BuildPromptInput` | Prompt 构造入参 | `{ query: string; context: QuickAssistContext; suggestion?: Suggestion }` |
| `SelectionSnapshot` | 原生选区快照 | 传给 `selection.validate` 与 `getNearbyContext`（含 DOM `Range`） |
| `QuickAssistActivationInput` / `QuickAssistAnchorShortcut` | 主动激活入参 | 完整几何句柄形式 / DOM 元素快捷形式 |
| `QuickAssistActivationView` | 主动激活只读视图 | 传给 `selection.validateActivation`（不含 DOM `Range`） |
| `QuickAssistSelectionSource` | 自定义触发源 | `registerSource` 入参 |
| `QuickAssistAttrs` | 安全 DOM 属性映射 | `root`、`trigger`、`popover`、`input`、`submit`、`suggestion` |
| `QuickAssistEvent` / `QuickAssistCloseReason` / `QuickAssistErrorStage` | 事件类型 | `onEvent` 回调载荷与枚举 |
| `VanillaThemeConfig` / `VanillaThemeSource` / `VanillaColorMode` | 主题配置 | `configureVanillaTheme` 入参类型 |

以下为接入时最常用的核心数据结构完整定义（其余签名见对应 API 表格与 `@opentiny/tiny-robot/vanilla` 类型声明）：

```ts
interface AIRequest {
  source: string
  /** 手动提交为去首尾空白的输入；点击推荐项为推荐项的 label */
  query: string
  prompt: string
  context: QuickAssistContext
  suggestion?: Suggestion
}

interface QuickAssistContext {
  source: string
  text: string
  /** 仅包含文本摘要，不含 DOM Range */
  selection?: { text: string }
  page?: { title?: string; url?: string }
  nearbyText?: string
  businessContext?: Record<string, unknown>
  meta?: Record<string, unknown>
}

interface Suggestion {
  id: string
  label: string
  prompt: string
  /** 可结构化克隆的元数据，不支持共享内存；仅 Suggestion 支持，SuggestionFactory 无此字段 */
  meta?: Record<string, unknown>
}

interface SuggestionFactory {
  id: string
  getLabel: (context: QuickAssistContext) => string
  getPrompt: (context: QuickAssistContext) => string
}

interface SelectionSnapshot {
  text: string
  direction?: 'forward' | 'backward'
  /** 原生 DOM Range，仅在本地校验/提取阶段使用，切勿序列化后外发 */
  range: Range
  rect: DOMRectReadOnly
  clientRects: DOMRectReadOnly[]
  anchorElement: Element | null
  root: Document
  createdAt: number
}

interface QuickAssistAttrs {
  root?: QuickAssistAttributeMap
  trigger?: QuickAssistAttributeMap
  popover?: QuickAssistAttributeMap
  input?: QuickAssistAttributeMap
  submit?: QuickAssistAttributeMap
  suggestion?: QuickAssistAttributeMap | ((suggestion: Suggestion) => QuickAssistAttributeMap)
}
```

### CSS Variables {#css-variables}

<span id="css-变量"></span>

QuickAssist 支持在 `.tr-quick-assist` 上覆盖以下 CSS 变量。默认值随 Vanilla 主题变化；未继承宿主 `--tr-*` 主题变量时使用组件内置默认配色。

| 变量名 | 说明 | 默认值（浅色 / 深色） |
| --- | --- | --- |
| `--tr-quick-assist-bg` | 入口背景色及浅色浮层基础背景色 | `#fff` / `#262626`，可继承 `--tr-container-bg-default` |
| `--tr-quick-assist-popover-bg` | 输入浮层、输入框及发送按钮背景色 | `var(--tr-quick-assist-bg)` / `#1a1a1a` |
| `--tr-quick-assist-text` | 主要文字颜色 | `#191919` / `#e6e6e6`，可继承 `--tr-text-primary` |
| `--tr-quick-assist-muted` | 入口悬停文字、推荐问题、输入框占位文字及状态提示颜色 | `#595959` / `#b3b3b3`，可继承 `--tr-text-secondary` |
| `--tr-quick-assist-border` | 输入框、推荐问题描边及滚动条轨道参考色 | `#e6e6e6` / `rgba(255, 255, 255, 0.2)`，可继承 `--tr-assist-border-color` |
| `--tr-quick-assist-trigger-border` | 入口描边颜色，悬停时保持不变 | `#dbdbdb` / `rgba(255, 255, 255, 0.2)`，可继承 `--tr-assist-trigger-border-color` |
| `--tr-quick-assist-popover-border` | 输入浮层外描边颜色，悬停时保持不变 | `var(--tr-quick-assist-trigger-border)`（`#dbdbdb` / `rgba(255, 255, 255, 0.2)`） |
| `--tr-quick-assist-hover-bg` | 推荐问题悬停背景色 | `#f5f5f5` / `#262626`，可继承 `--tr-assist-suggestion-bg-hover` |
| `--tr-quick-assist-suggestion-bg` | 推荐问题默认背景色 | `var(--tr-quick-assist-popover-bg)`（`#fff` / `#1a1a1a`） |
| `--tr-quick-assist-glow-opacity` | 输入框下沿四色渐变光晕透明度，设为 `0` 可隐藏 | `0.16` / `0.3` |
| `--tr-quick-assist-scrollbar-thumb` | 输入框溢出时 4×16px 滚动条滑块颜色 | `#dbdbdb` / `#808080`（深色可继承 `--tr-text-disabled`） |
| `--tr-quick-assist-accent` | 入口、发送按钮及推荐问题键盘聚焦轮廓颜色 | `#191919` / `#e6e6e6`，可继承 `--tr-text-primary` |
| `--tr-quick-assist-radius` | 输入浮层圆角 | `16px` |
| `--tr-quick-assist-pill-radius` | 入口及推荐问题按钮圆角 | `var(--tr-radius-full, 9999px)` |
| `--tr-quick-assist-shadow` | 入口及输入浮层阴影 | `0 2px 8px 0 rgba(0, 0, 0, 0.16)` / `0 2px 8px 0 rgba(0, 0, 0, 0.48)` |
| `--tr-quick-assist-z-index` | 组件层级 | `var(--tr-z-index-popover, 1500)` |
| `--tr-quick-assist-popover-width` | 输入浮层宽度（仍受视口宽度减 `16px` 限制） | `344px` |
| `--tr-quick-assist-selection-disabled-text` | 选区超限时禁用入口文字颜色 | `#c4c4c4` / `var(--tr-text-disabled, #808080)` |
| `--tr-quick-assist-selection-disabled-border` | 选区超限时禁用入口描边颜色 | `#dbdbdb` / `var(--tr-quick-assist-trigger-border)` |
| `--tr-quick-assist-selection-error` | 选区超限提示中当前字数的警示颜色 | `#f63737` / `var(--tr-color-error, #d94838)` |

> AI 图标和发送图标使用随深浅主题与禁用状态切换的内置 SVG 资源，不受 `--tr-quick-assist-text` 或 `--tr-quick-assist-accent` 控制。

覆盖变量示例（全局样式与深色模式专用覆盖，需置于组件样式之后）：

```css
.tr-quick-assist {
  --tr-quick-assist-bg: #f5f9ff;
  --tr-quick-assist-text: #183153;
  --tr-quick-assist-radius: 12px;
}

.tr-quick-assist[data-tr-vanilla-color-mode='dark'] {
  --tr-quick-assist-popover-border: transparent;
  --tr-quick-assist-glow-opacity: 0.4;
}
```

结合 `attrs.popover.class` 按实例调整浮层宽度：

```ts
createQuickAssist({
  adapter,
  attrs: { popover: { class: 'business-quick-assist' } },
})
```

```css
.business-quick-assist {
  --tr-quick-assist-popover-width: 400px;
}
```

## 常见问题

| 常见现象 | 可能原因与排查方向 |
| --- | --- |
| 划词后没有出现“智能帮助”入口 | ① 反向拖选被默认 `selection.forwardOnly: true` 拦截（可从左向右选择或设为 `false`）；② 选区超出 `include` 范围或落在表单、编辑器、`[data-sensitive]` 等排除区；③ 选区为纯数字、纯标点、URL 或 UUID 被内置文本规则过滤；④ 实例当前处于 `disable()` 状态；⑤ 移动端长按不触发原生划词链路 |
| 打开浮层后输入框是空的，没有填入选中文字 | `input.autoFill` 默认为 `false`，但选区原文始终保留在 `request.context.text` 中；如需预填，可配置 `input.autoFill: true` 或在单次激活时传 `activate({ autoFill: true })` |
| 远程推荐已返回，但界面未显示或条数不全 | ① 同时配置了 `suggestions` 与 `getSuggestions` 时，默认静态优先，静态项占满 `maxSuggestions`（默认 `2`）会截断远程项，请配置 `mergeSuggestions` 或增大 `maxSuggestions`；② 远程项 `id`/`label`/`prompt` 为空白、`meta` 含不可克隆对象，或被 `validateSuggestion` 过滤 |
| 点击推荐或发送后浮层关闭了，但没看到 AI 回答 | QuickAssist 不内置回答区，提交后会先关闭浮层再调用 `adapter.submit(request)`；请在 `adapter.submit` 中打开并驱动应用已有的对话面板，并确认后端消费了 `request.context` 或已通过 `buildPrompt` 拼入 `context.text` |
| 提交失败时没有错误提示，浮层也没有重新打开 | 组件先关闭浮层再提交，失败不会重开界面；请确保 `adapter.submit` 同步抛错或返回被拒绝的 `Promise`（异步函数务必 `return` Promise），并在 `onEvent` 中监听 `event.type === 'error' && event.stage === 'adapter'` |
