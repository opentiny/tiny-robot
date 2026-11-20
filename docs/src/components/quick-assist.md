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

### 页面上下文与敏感数据 {#example-context}

选中示例中的虚构租户编号并提交，可查看选区文本、附近文本和业务字段中的编号被统一脱敏后的上下文。另一个标为敏感的区域不能触发划词，也不会进入附近文本。

<demo vue="../../demos/quick-assist/context.vue" title="上下文与脱敏" description="选中文字并提交，查看允许交给应用的上下文。" />

默认上下文包含：

- `source: 'selection'`、`text` 和 `selection.text`；
- 页面标题与 URL；URL 只包含域名和路径，不采集查询参数或片段标识；
- 限长的 `nearbyText`，从选区附近的有限语义块提取；找不到语义块时最多退回选中文字。

可以通过 `getContext` 添加业务字段，通过 `getNearbyContext` 定制附近文本，并通过 `sanitizeContext` 返回最终允许外发的完整上下文。`sanitizeContext` 在业务上下文构造后执行；脱敏完成前不会调用推荐函数或 `adapter`。

- `sanitizeContext` 返回值必须保留 `source`、`text` 两个字符串字段，其余字段可删除。
- 上下文中不要放函数、DOM 对象或共享内存数据，否则会报错并阻止提交。
- 推荐函数和 `buildPrompt` 收到上下文副本，修改副本不会改变最终提交的上下文。

下面使用虚构租户编号演示脱敏。输入框可能保留选中的原文，因此还需通过 `buildPrompt` 对最终发送的问题脱敏；此例的宿主仅发送 `prompt` 和 `context`。

```ts
const tenantId = 'tenant-demo-4812'
const redactTenant = (text: string) => text.replaceAll(tenantId, '[redacted]')

const quickAssist = createQuickAssist({
  adapter,
  getContext: () => ({ product: '云服务器', section: '创建实例', tenantId }),
  sanitizeContext: (context) => ({
    ...context,
    text: redactTenant(context.text),
    selection: context.selection ? { ...context.selection, text: redactTenant(context.selection.text) } : undefined,
    nearbyText: context.nearbyText ? redactTenant(context.nearbyText) : undefined,
    businessContext: {
      ...context.businessContext,
      tenantId: '[redacted]',
    },
  }),
  buildPrompt: ({ query, suggestion }) => redactTenant(suggestion?.prompt ?? query),
})
```

默认采集不会读取整页 `body.innerText` 或表单值。选区与附近文本会跳过常见编辑区和敏感标记，但通用规则不能识别所有业务秘密。请通过 `sanitizeContext` 删除访问密钥、令牌、用户或租户 ID、订单数据等，并在页面上为敏感区域添加 `data-sensitive` 或 `data-ai-selection="false"`。不要把 DOM、`Range` 或选区快照序列化后传给模型。

#### 自定义附近文本 {#example-nearby-context}

默认提取会使用语义块，可通过 `nearbyContext` 扩展候选块并限制长度；需要完全自定义提取时，提供 `getNearbyContext`：

```ts
const quickAssist = createQuickAssist({
  adapter,
  nearbyContext: { maxLength: 200, blockSelectors: ['.product-description'] },
  getNearbyContext(snapshot) {
    const element = snapshot.anchorElement
    return element?.closest('.product-description')?.textContent ?? snapshot.text
  },
})
```

不提供 `getNearbyContext` 时使用默认提取策略；提供后使用回调结果，仍受 `maxLength` 限制并继续经过 `sanitizeContext`。自定义提取应避开敏感区域。

### 生效范围与选择长度 {#example-selection-scope}

试着选择示例中允许的文字、排除区域，以及超过长度限制的句子，比较正常入口、超限禁用入口和排除效果。

<demo vue="../../demos/quick-assist/selection-scope.vue" title="可选择区域与长度限制" description="仅指定区域内的有效选区显示入口，超限后禁用并提供字数提示。" />

```ts
const quickAssist = createQuickAssist({
  adapter,
  include: ['#app'], // 配置后，选区中的每个文本节点都必须位于匹配区域
  exclude: ['[data-qa-ignore]', '.private-value'], // 在内置排除项上追加
  selection: {
    maxTextLength: 8000,
    validate(snapshot) {
      return snapshot.text.trim().length > 0
    },
  },
})
```

划词默认上限为 **8000**，使用 `selection.maxTextLength` 配置正整数，设为 `null` 表示不限制。计数先去除首尾空白，再按 Unicode 码点计算，内部空格和换行各计 1，普通 emoji 计 1（组合 emoji 按实际码点数计数）。输入框的 `input.maxLength` 独立配置，默认不限制，也可显式设为 `null`。

超限后仍在释放鼠标后显示“智能帮助”入口，文字和边框置灰，保留彩色星标；入口出现时立即显示“划词字数超出限制 当前字数/上限”，并随入口保持可见，当前字数为红色。入口不可打开，点击、Enter 和程序直接打开均不能绕过限制，也不会触发上下文或推荐请求。提示文案可通过 `selection.maxTextLengthExceededMessage` 配置。上述规则同时适用于页面划词、`activate()` 和 `registerSource()` 编辑器来源。范围、敏感区域和文本有效性校验继续生效。

```ts
selection: {
  maxTextLength: null
} // 不限制划词长度
input: {
  maxLength: null
} // 不限制输入长度
```

默认拒绝空白、纯数字、纯标点/符号、明显 URL 和 UUID；不会用固定最短长度过滤 `ECS`、`VPC`、`QoS` 等短技术词。`selection.validate` 自定义文本判断，但仍不能绕过最大长度、`include` / `exclude`、编辑器和敏感区域检查。超长选区会显示禁用入口，不会截断或发送。

默认排除 `input`、`textarea`、`select`、可编辑的 `contenteditable` 区域、Monaco、CodeMirror、QuickAssist 自身界面，以及 `[data-ai-selection="false"]`、`[data-sensitive]`、`[data-secret]`、`[data-password]` 等标记。普通只读 `contenteditable="false"` 区域可以划词；若它位于可编辑祖先或其他排除区域内，仍会被排除。
::: tip 支持范围
当前版本暂不支持移动端长按选择，以及 iframe 和 Shadow DOM 内的选区。
:::

### 主动激活：按钮与自定义选区 {#example-activation}

通过 `activate()` 可以主动提供文本和锚点，复用“智能帮助入口 → 输入浮层 → 推荐与提交”的流程。默认先展示入口；传入 `open: 'popover'` 可跳过入口，直接打开并聚焦输入框。它不会直接显示 AI 答案。

示例默认勾选“直接显示输入框”：点击术语按钮直接提问，悬停或键盘聚焦指标卡片可查看指标专属推荐；浮层打开后可移入其中操作。取消勾选即可对比先显示入口的流程。提交后，下方展示实际收到的内容与来源。

<demo vue="../../demos/quick-assist/activation.vue" title="主动激活与自定义定位" description="点击与悬停触发，切换直接输入，并对比实例默认推荐和本次专属推荐。" />

最简单的方式是传入一个 DOM 元素作为锚点：

```ts
const explainButton = document.querySelector<HTMLButtonElement>('#explain')!

explainButton.addEventListener('click', () => {
  quickAssist.activate({
    text: '需要解释的代码或业务术语',
    anchor: explainButton,
    open: 'popover', // 直接打开输入框；省略时先显示智能帮助入口
    // source 默认是 manual；可选 meta 会进入上下文脱敏管道。
    meta: { feature: 'code-explanation' },
  })
})
```

`open: 'popover'` 立即进入输入浮层，跳过 `trigger.showDelay`，不产生 `trigger_show` 或 `trigger_click` 事件，仍产生 `selection` 和 `popover_show`。上下文构造或脱敏未完成时可以编辑，但暂不能发送。`open` 只影响本次激活，普通页面划词不变。

**为本次激活单独提供推荐**，无需 `updateOptions()`，也不影响其他区域：

```ts
quickAssist.activate({
  source: 'editor',
  text: selectedCode,
  anchor: codeElement,
  open: 'popover',
  suggestions: [
    {
      id: 'explain-code',
      getLabel: () => '解释这段代码',
      getPrompt: (context) => `请解释以下代码：\n${context.text}`,
    },
    {
      id: 'review-code',
      getLabel: () => '检查潜在问题',
      getPrompt: (context) => `请检查以下代码是否存在潜在问题：\n${context.text}`,
    },
  ],
})
```

| 本次激活参数                          | 行为                                                                                          |
| ------------------------------------- | --------------------------------------------------------------------------------------------- |
| 不传 `suggestions` / `getSuggestions` | 使用实例默认推荐配置                                                                          |
| `suggestions: [...]`                  | 替换本次的静态推荐；不调用实例的远程推荐                                                      |
| `autoFill: boolean`                   | 仅覆盖本次预填行为，优先于实例 `input.autoFill`，不修改实例设置；完整形式与元素锚点形式均支持 |
| `suggestions: []`                     | 不显示推荐，保留手动提问                                                                      |
| `getSuggestions: fn`                  | 使用本次的异步推荐函数，可与本次静态推荐一起配置                                              |
| `getSuggestions: null`                | 本次禁用远程推荐，静态推荐仍按对应配置展示                                                    |

推荐项的结构与实例级 `suggestions` 一致，支持固定问题与 `getLabel` / `getPrompt` 工厂。工厂与远程函数均在上下文脱敏后执行，数量限制、远程校验、合并策略仍使用实例配置；关闭或新激活会中止旧请求、忽略旧结果。固定项在激活时复制，后续不会因原数组被修改而变化。

元素移除、祖先隐藏或尺寸塌缩时会清理当前会话；实例停用或销毁后调用 `activate()` 不生效。显式再次调用可以重新打开已关闭的内容。

需要将入口放在编辑器选区、图表或自定义画布旁时，使用完整形式：

```ts
quickAssist.activate({
  source: 'editor',
  text: selectedCode,
  anchorElement: editorContainer,
  getRect: () => getCurrentSelectionRect(),
  verify: () => isCapturedSelectionStillValid(),
  getNearbyText: () => capturedNearbyCode,
  onInvalidate(notify) {
    // notify 表示需要复检；verify 与 getRect 有效则重定位，否则关闭。
    return subscribeToSelectionAndLayoutChanges(notify)
  },
  meta: { language: 'typescript', fileName: 'price.ts' },
})
```

`getCurrentSelectionRect` 等函数由宿主实现，以上是接口示意。矩形使用**相对浏览器视口的 CSS 像素坐标**，与 `getBoundingClientRect()` 一致；选区不可见或失效时返回 `null`，零宽但有高度的 caret 矩形也有效。编辑器的内部坐标需要加上容器的视口坐标，并由宿主判断编辑器自身的裁剪范围。

`onInvalidate` 从接受激活时开始订阅，覆盖 `showDelay`、入口和输入浮层阶段，关闭时调用返回的清理函数。未提供该订阅时，仅在滚动、窗口 resize、延迟显示等检查时发现失效；模型或布局变化需由宿主通知，或主动 `close()`。

`text`、`meta` 和 `getNearbyText()` 的结果在激活时捕获；附近文本受 `nearbyContext.maxLength` 限制，业务上下文和脱敏仍在打开输入浮层后执行。`meta` 仅放可 JSON 序列化的业务字段。不要传 DOM、编辑器实例、Range 或访问密钥。

主动激活遵循非空、最大文本长度和几何校验；`include` / `exclude`、`selection.forwardOnly`、旧的 `selection.validate` 与 `getNearbyContext` 仅作用于原生 DOM 划词。宿主应自行决定哪些自定义区域可以激活。代码场景可通过 `selection.validateActivation` 替换默认的纯数字/符号/URL 等文本规则，但不能绕过长度和几何限制：

```ts
quickAssist.updateOptions({
  selection: {
    maxTextLength: 2000,
    validateActivation: ({ text }) => text.trim().length > 0,
  },
})
```

### Monaco 选中代码后主动解释 {#example-monaco}

这个示例使用真实 Monaco 编辑器。鼠标拖选并松开，或用 Shift + 方向键完成选区后，页面自动读取编辑器模型并调用 `activate()`，把“智能帮助”入口定位到选区末端；点击入口后可发送“解释这段代码”。关闭后，同一选区不会因无关 keyup 立即重开，清空后重新选择即可再次触发。代码解释和问题检查通过本次 `activate({ suggestions })` 配置，实例继续使用默认推荐。下方示例助手显示实际收到的请求，本例不调用模型。

<demo vue="../../demos/quick-assist/monaco.vue" title="Monaco 主动选区解释" description="选词完成后自动调用通用 API，不依赖编辑器桥接器。" />

核心接线如下，完整可运行代码见示例源码。Monaco 需要由应用自行安装，并在浏览器挂载后创建：

```ts
let lastIdentity: string | undefined

function explainSelection() {
  const selection = editor.getSelection()
  const model = editor.getModel()
  const container = editor.getDomNode()
  if (!selection || selection.isEmpty() || !model || !container) return

  const text = model.getValueInRange(selection)
  const version = model.getVersionId()
  const identity = `${model.uri}:${version}:${selection.selectionStartLineNumber}:${selection.selectionStartColumn}:${selection.positionLineNumber}:${selection.positionColumn}`
  if (identity === lastIdentity) return
  lastIdentity = identity
  const end = selection.getEndPosition()

  quickAssist.activate({
    source: 'monaco',
    text,
    suggestions: [
      {
        id: 'explain-code',
        getLabel: () => '解释这段代码',
        getPrompt: (context) => `请解释以下代码：\n${context.text}`,
      },
    ],
    anchorElement: container,
    meta: { language: model.getLanguageId() },
    verify: () => editor.getModel() === model && model.getVersionId() === version,
    getRect() {
      const position = editor.getScrolledVisiblePosition(end)
      const layout = editor.getLayoutInfo()
      if (
        !container.isConnected ||
        !container.getClientRects().length ||
        !position ||
        position.left < layout.contentLeft ||
        position.left > layout.contentLeft + layout.contentWidth ||
        position.top < 0 ||
        position.top + position.height > layout.height
      )
        return null
      const box = container.getBoundingClientRect()
      return new DOMRect(box.left + position.left, box.top + position.top, 0, position.height)
    },
  })
}

// 选择完成后调度，让 Monaco 先处理完事件；自动调用对相同选区去重。
const activateWhenSettled = () => requestAnimationFrame(() => explainSelection())
// 简化接线。完整示例还处理拖选期间的门控、指针取消和卸载时取消调度。
const disposables = [
  editor.onMouseUp(activateWhenSettled),
  editor.onKeyUp((event) => {
    if (!event.browserEvent.isComposing) activateWhenSettled()
  }),
  editor.onDidChangeCursorSelection(() => {
    if (editor.getSelection()?.isEmpty()) lastIdentity = undefined
    quickAssist.close()
  }),
  editor.onDidChangeModelContent(() => quickAssist.close()),
  editor.onDidScrollChange(() => quickAssist.close()),
  editor.onDidLayoutChange(() => quickAssist.close()),
]
// 卸载时 disposables.forEach(item => item.dispose())，并销毁助手、编辑器和模型。
```

普通页面仍默认排除 Monaco、CodeMirror 和输入框；主动调用不依赖解除这些过滤规则。此处的自动激活由示例页面接线实现，当前未提供官方 Monaco / CodeMirror 自动桥接器。

### 注册自定义来源 {#example-register-source}

需要多个来源随组件统一启停时，可使用 `registerSource()`。下面以点击业务按钮为例：在按钮已挂载后注册，`activate` 负责订阅宿主事件，`deactivate` 负责取消订阅；来源需要清理自己的会话时，可调用 `emit(null)`。

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
    stopListening = () => {
      button.removeEventListener('click', onClick)
    }
  },
  deactivate() {
    stopListening?.()
    stopListening = undefined
  },
})

// 不再需要这个来源时调用，移除其监听并关闭属于该来源的会话。
// unregister()
```

停用或销毁实例也会调用来源的 `deactivate()`；重新启用时会再次调用 `activate()`，因此订阅与清理应成对实现。单个按钮直接调用 `activate()` 的用法见[主动激活示例](#example-activation)。

### 生命周期与路由 {#example-lifecycle}

以下示例可直接启用或停用划词，并模拟路由切换时调用 `close()`；组件卸载时应调用 `destroy()`。

<demo vue="../../demos/quick-assist/lifecycle.vue" title="启停与关闭会话" description="通过按钮控制划词功能，并模拟页面切换。" />

#### Angular

在视图创建后初始化实例，并在组件销毁时调用 `destroy()`。QuickAssist 会自动响应浏览器 `popstate` 与 `hashchange`；Angular Router 通常通过 `pushState` 导航，不一定产生这两个事件，因此应在路由导航开始时调用 `close()`。

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
        submit: (request) => {
          this.openAssistantAndSend(request.prompt, request.context)
        },
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
    // 接入应用已有面板与发送方法；不要只把 prompt 留在输入框里。
  }
}
```

如果 Angular 应用启用 SSR，请只在浏览器生命周期中创建实例。`root` 可传入 `Document`，不能传 `ShadowRoot`。

#### Vue

在 `onMounted` 中创建，在卸载前 `destroy()`。Vue Router 的 SPA 导航也建议用 `afterEach` 或路由监听调用 `close()`。

```ts
import { onBeforeUnmount, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { createQuickAssist } from '@opentiny/tiny-robot/vanilla'
import '@opentiny/tiny-robot/vanilla/style.css'

const router = useRouter()
let quickAssist: ReturnType<typeof createQuickAssist> | undefined
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

在全局布局组件统一创建可覆盖多页面；如果 QuickAssist 只属于某个视图，则在该视图的挂载/卸载边界创建和销毁。

### 元素属性 {#example-attrs}

通过 `attrs` 为内部元素追加安全的 DOM 属性。该入口用于类名、测试标记和 ARIA 关联等补充属性；输入区文案使用 [`input`](#example-input)，推荐状态文案使用 [`messages`](#example-suggestion-messages)。

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

`aria-describedby` 指向宿主页面中已有的提示元素，例如 `<p id="quick-assist-hint">请勿输入敏感信息。</p>`。`attrs` 不能覆盖内部事件、样式或行为属性，具体限制见 Props 表下方说明。

### 事件监听 {#example-events}

通过 `onEvent` 统一监听事件，使用 `event.type` 区分事件类型，并通过 `sessionId` 关联同一次划词会话。

选中下面的文字，点击入口后手动发送或点击推荐项，可观察 `selection`、`trigger_show`、`trigger_click`、`popover_show`、`suggestion_click`、`close` 和 `submit`。按 Esc 可观察 `reason: 'escape'`；勾选“模拟提交失败”后提交，可观察 `stage: 'adapter'` 的 `error`。日志按发生顺序保留最近 40 条，清空日志不会重置组件的会话编号。

<demo vue="../../demos/quick-assist/events.vue" title="事件监听与会话日志" description="观察完整交互事件、会话编号、关闭原因和模拟提交错误。" />

提交时组件先触发 `close`（`reason: 'submit'`），再触发 `submit` 并调用适配器；适配器失败时随后触发 `error`。`submit` 表示请求已交给适配器，并不表示模型已成功回答。事件元数据不包含选区原文、`query`、`prompt` 或完整上下文；业务错误对象仍应按应用自己的日志规则处理。

### 主题配置 {#example-theme}

独立入口内置亮暗配色，默认跟随 `html[data-tr-color-mode]`，识别 `light`、`dark`，属性缺失或无效时使用亮色。已有 TinyRobot `ThemeProvider` 默认无需额外配置。

其他系统只需在应用初始化时指定主题来源，无需向组件传入 `theme`：

```ts
import { configureVanillaTheme } from '@opentiny/tiny-robot/vanilla'

configureVanillaTheme({
  source: { type: 'attribute', attribute: 'data-cf-theme' },
})
```

`source` 支持以下配置，来源元素须在调用时存在：

| 字段           | 类型                     | 默认值                 | 说明                                                            |
| -------------- | ------------------------ | ---------------------- | --------------------------------------------------------------- |
| `type`         | `'attribute' \| 'class'` | 必填                   | 按属性值或 class 判断主题；省略整个 `source` 时默认使用属性来源 |
| `selector`     | `string`                 | `'html'`               | 主题来源元素的 CSS 选择器，取首个匹配元素                       |
| `attribute`    | `string`                 | `'data-tr-color-mode'` | 仅 `attribute` 类型：监听的属性名                               |
| `values.light` | `string`                 | `'light'`              | 仅 `attribute` 类型：亮色对应的属性值                           |
| `values.dark`  | `string`                 | `'dark'`               | 仅 `attribute` 类型：暗色对应的属性值                           |
| `darkClass`    | `string`                 | `'dark'`               | 仅 `class` 类型：暗色 class 名，按完整 token 匹配               |
| `lightClass`   | `string`                 | —                      | 仅 `class` 类型：可选亮色 class 名；亮暗同时存在时暗色优先      |
| `defaultMode`  | `'light' \| 'dark'`      | `'light'`              | 属性值未知、class 均未匹配或来源元素被移除时的回退模式          |

<div class="qa-theme-demo">

<demo html="../../demos/quick-assist/theme.html" title="主题切换" description="切换亮色、暗色或跟随系统，再选中文字查看入口和浮层；本示例使用独立文档，不影响其他示例。" />

</div>

也可以跟随 class，或直接指定颜色模式：

```ts
configureVanillaTheme({ source: { type: 'class' } }) // 跟随 html.dark，否则亮色
configureVanillaTheme({ colorMode: 'dark' }) // 固定暗色，也支持 light
configureVanillaTheme({ colorMode: 'auto' }) // 跟随操作系统
configureVanillaTheme({}) // 恢复默认 TinyRobot 主题来源
```

配置按 `Document` 共享，对已有及后续组件生效，主题变化不会清空正在编辑的问题。每次调用与内置默认值合并，不累积上次配置；`source` 与 `colorMode` 不能同时设置。

CDN 方式使用相同 API，脚本加载完成后调用即可：

```js
TinyRobotVanilla.configureVanillaTheme({
  source: { type: 'attribute', attribute: 'data-cf-theme' },
})
```

配色优先级为：**组件变量覆盖 → 宿主 `--tr-*` 变量 → 内置配色**。如果加载了 TinyRobot 全量样式，需同步其颜色模式；只使用组件自带配色时，加载 Vanilla CSS 即可（CDN 方式自动注入）。

例如，在全局样式中覆盖组件变量：

```css
.tr-quick-assist {
  --tr-quick-assist-bg: #f5f9ff;
  --tr-quick-assist-text: #183153;
  --tr-quick-assist-radius: 12px;
}
```

浮层挂载在 `body` 下，局部主题来源只同步亮暗状态，不会复制局部品牌变量。自定义变量应放在 `html`、`body` 或组件根节点的全局样式中。iframe 需通过 `configureVanillaTheme(config, iframeDocument)` 配置其自身文档。

## 交互与限制

- 划词默认仅正向触发；入口默认出现在选区末行右下方，空间不足时会翻转或调整位置；打开输入浮层后仍会跟随入口对应的首末行位置。
- 点击入口后输入框立即打开并聚焦，默认留空，设置 `input.autoFill: true` 可填入选中文字；按 Enter 发送，按 Shift+Enter 换行，输入法组合期间不会误发。
- 等待业务上下文构造或脱敏时，仍可编辑输入，但暂时不能提交；脱敏完成前不会调用推荐函数。
- 点击推荐项或手动发送后，组件先关闭划词界面，再调用 `adapter`。
- 新选区会替换旧会话。点击外部、按 Esc、锚点失效、显著滚动、路由变化或调用生命周期方法时，会清理当前界面。
- 浏览器的 `popstate` 和 `hashchange` 会自动关闭界面；其他单页应用导航应由路由钩子调用 `close()`。

::: tip 功能边界
输入浮层不显示 AI 答案，也不提供流式渲染、重试、多轮对话或模型管理；这些仍由应用已有的 AI 面板负责。
:::

## 配置迁移

输入文案归入 `input`；推荐文案与提交内容统一使用 `suggestions`。以下旧字段已移除，不保留兼容别名：

| 原配置                                               | 当前配置                                                          |
| ---------------------------------------------------- | ----------------------------------------------------------------- |
| `messages.placeholder`                               | `input.placeholder`                                               |
| `messages.inputTooLong`                              | `input.maxLengthExceededMessage`                                  |
| `messages.inputLabel`                                | `input.ariaLabel`                                                 |
| `messages.submitLabel`                               | `input.submitLabel`                                               |
| `messages.defaultExplain`、`messages.defaultUseCase` | `suggestions` 中的 `label` / `prompt` 或 `getLabel` / `getPrompt` |

## Props

点击下方 API 表中的属性名、方法名、事件名或 CSS 变量名，可跳转到对应示例或用法说明。

| 属性名                                                               | 类型                                                                                        | 默认值               | 说明                                                                                                                                           |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| [`root`](#example-basic)                                             | `Document`                                                                                  | `document`           | 所在文档；不接受 `ShadowRoot`                                                                                                                  |
| [`enabled`](#example-lifecycle)                                      | `boolean`                                                                                   | `true`               | 是否启用划词监听                                                                                                                               |
| [`adapter`](#example-basic)                                          | `AIAdapter`                                                                                 | —                    | 必填；由 `submit(request)` 交给应用已有的对话能力                                                                                              |
| [`include`](#example-selection-scope)                                | `string[]`                                                                                  | —                    | 限定可触发的页面区域                                                                                                                           |
| [`exclude`](#example-selection-scope)                                | `string[]`                                                                                  | —                    | 在内置排除规则上追加页面区域                                                                                                                   |
| [`selection.maxTextLength`](#example-selection-scope)                | `number \| null`                                                                            | `8000`               | Unicode 码点上限，正整数；`null` 不限制。超限显示禁用入口                                                                                      |
| [`selection.maxTextLengthExceededMessage`](#example-selection-scope) | `string`                                                                                    | `划词字数超出限制`   | 超限提示文案，后面自动追加当前字数和上限                                                                                                       |
| [`selection.forwardOnly`](#example-direction-placement)              | `boolean`                                                                                   | `true`               | 仅正向选词触发；设为 false 允许双向选择                                                                                                        |
| [`selection.validateActivation`](#example-activation)                | `(view: QuickAssistActivationView) => boolean`                                              | 默认文本规则         | 仅自定义激活的文本校验，不接收 DOM Range                                                                                                       |
| [`selection.validate`](#example-selection-scope)                     | `(snapshot) => boolean`                                                                     | 内置校验             | 替代默认的文本内容校验                                                                                                                         |
| [`trigger.label`](#example-input)                                    | `string`                                                                                    | `智能帮助`           | 划词入口文案                                                                                                                                   |
| [`trigger.showDelay`](#example-trigger-delay)                        | `number`                                                                                    | `0`                  | 选区稳定后延迟显示入口，单位为毫秒，须为非负整数                                                                                               |
| [`trigger.offset`](#example-direction-placement)                     | `number`                                                                                    | `8`                  | 入口及输入浮层与选区的间距，单位为像素                                                                                                         |
| [`trigger.placement`](#example-direction-placement)                  | `'auto' \| 'top' \| 'bottom' \| 'top-start' \| 'top-end' \| 'bottom-start' \| 'bottom-end'` | `'bottom-end'`       | 入口及输入浮层的优先位置；上方按首行、下方按末行，空间不足时调整                                                                               |
| [`input.maxRows`](#example-input)                                    | `number`                                                                                    | `2`                  | 输入区最多显示的行数，须为正整数，超过后内部滚动                                                                                               |
| [`input.maxLength`](#example-input)                                  | `number \| null`                                                                            | 不限制               | 可选的 Unicode 码点上限，须为正整数；省略或 `null` 不限制；配置后始终显示计数，超限不可发送                                                    |
| [`input.autoFill`](#example-input)                                   | `boolean`                                                                                   | `false`               | 是否自动将选中或主动激活的文字填入输入区，不影响上下文                                                                                         |
| [`input.placeholder`](#example-input)                                | `string`                                                                                    | `告诉 AI 你想做什么` | 输入为空时显示的占位文案                                                                                                                       |
| [`input.ariaLabel`](#example-input)                                  | `string`                                                                                    | `请输入问题`         | textarea 的无障碍名称，不是弹层标题                                                                                                            |
| [`input.submitLabel`](#example-input)                                | `string`                                                                                    | `发送问题`           | 图标发送按钮的无障碍名称和悬停标题                                                                                                             |
| [`input.maxLengthExceededMessage`](#example-input)                   | `string`                                                                                    | `字数超出限制`       | 超过 input.maxLength 时在发送区域显示的校验提示                                                                                                |
| [`nearbyContext.maxLength`](#example-nearby-context)                 | `number`                                                                                    | `500`                | 附近文本的最大字符数                                                                                                                           |
| [`nearbyContext.blockSelectors`](#example-nearby-context)            | `string[]`                                                                                  | 内置选择器           | 在默认语义块之外增加候选块                                                                                                                     |
| [`getNearbyContext`](#example-nearby-context)                        | `(snapshot) => string \| undefined`                                                         | —                    | 自定义附近文本；`snapshot` 含 DOM `Range`                                                                                                      |
| [`getContext`](#example-context)                                     | `(context, signal) => Record \| Promise<Record>`                                            | —                    | 返回业务字段，合并到 `businessContext`                                                                                                         |
| [`sanitizeContext`](#example-context)                                | `(context, signal) => QuickAssistContext \| Promise<QuickAssistContext>`                    | —                    | 返回最终允许外发的完整上下文                                                                                                                   |
| [`suggestions`](#example-suggestions)                                | `QuickAssistSuggestionInput[]`                                                              | 默认推荐             | 静态推荐或推荐生成函数                                                                                                                         |
| [`getSuggestions`](#example-remote-suggestions)                      | `(context, signal) => Suggestion[] \| Promise<Suggestion[]>`                                | —                    | 使用脱敏后的上下文获取异步推荐                                                                                                                 |
| [`validateSuggestion`](#远程问题校验-validatesuggestion)             | `(suggestion: Suggestion, context: QuickAssistContext) => boolean`                          | 基础格式校验         | 可选业务校验，仅过滤远程问题，在合并前执行，见[远程问题校验](#远程问题校验-validatesuggestion)                                                 |
| [`mergeSuggestions`](#example-remote-suggestions)                    | `(base, incoming, context) => Suggestion[]`                                                 | 静态优先追加         | 远程成功返回后同步合并；可整体替换或远程优先；最终按 `id` 保留首次出现项并受数量上限约束，见[自定义合并策略](#自定义合并策略-mergesuggestions) |
| [`maxSuggestions`](#example-suggestions)                             | `number`                                                                                    | `2`                  | 最多展示的推荐数，必须为正整数                                                                                                                 |
| [`buildPrompt`](#example-build-prompt)                               | `(input) => string`                                                                         | 内置构造             | 自定义提交内容                                                                                                                                 |
| [`attrs`](#example-attrs)                                            | `QuickAssistAttrs`                                                                          | —                    | 为组件内部元素追加安全的 DOM 属性                                                                                                              |
| [`messages.loading`](#example-suggestion-messages)                   | `string`                                                                                    | `正在加载推荐…`      | 推荐加载期间显示的状态文案                                                                                                                     |
| [`messages.empty`](#example-suggestion-messages)                     | `string`                                                                                    | `暂无推荐`           | 没有可显示推荐时的状态文案                                                                                                                     |
| [`messages.error`](#example-suggestion-messages)                     | `string`                                                                                    | `推荐加载失败`       | 推荐准备或加载失败且无可显示推荐时的状态文案；不表示输入校验或发送错误                                                                         |
| [`onEvent`](#example-events)                                         | `(event) => void`                                                                           | —                    | 事件回调；回调异常不会打断组件清理                                                                                                             |

`attrs.suggestion` 可以是属性对象，也可以是按推荐项返回属性对象的函数。事件处理器、`style`、写入 HTML 的属性、`value`、`disabled`、`type`、`id` 等会被忽略；`class` 只能追加，不能覆盖组件内部行为。

## Methods

| 方法名                                          | 参数                                                      | 说明                                                                 |
| ----------------------------------------------- | --------------------------------------------------------- | -------------------------------------------------------------------- |
| [`activate`](#example-activation)               | `QuickAssistActivationInput \| QuickAssistAnchorShortcut` | 提供文本和锚点，显示智能帮助入口；详见主动激活示例                   |
| [`registerSource`](#example-register-source)    | `QuickAssistSelectionSource`                              | 注册自动来源，返回注销函数，随实例启停联动                           |
| [`enable`](#example-lifecycle)                  | —                                                         | 启动划词和全局事件监听；重复调用无副作用                             |
| [`disable`](#example-lifecycle)                 | —                                                         | 关闭当前输入浮层并停止监听；之后可再次调用 `enable()`                |
| [`close`](#example-lifecycle)                   | —                                                         | 关闭当前会话，不销毁实例                                             |
| [`updateOptions`](#example-direction-placement) | `partial: Partial<QuickAssistOptions>`                    | 关闭当前会话、废弃旧异步结果并重建配置；顶层浅合并，嵌套对象整体替换 |
| [`destroy`](#example-lifecycle)                 | —                                                         | 关闭并释放监听器与 DOM；重复调用无副作用                             |

`registerSource()` 是已实现的高级接口，用于多个自定义事件源的统一启停、注销和来源级去重；它不会自动读取编辑器选区或生成坐标。上面的按钮、指标和 Monaco 示例直接使用 `activate()`，无需注册来源。没有多来源管理需求时，不必使用此方法。

`root` 创建后不可更换；`updateOptions({ root: anotherDocument })` 会抛出错误，应先销毁旧实例再创建新实例。更新时省略 `enabled` 会保留实例当前启用/停用状态；显式传入时使用新值。

例如，原来配置 `trigger: { label: '帮助', offset: 12 }`，随后调用 `updateOptions({ trigger: { showDelay: 200 } })` 会把标签和偏移恢复到默认值。若要保留它们，需要传入完整分组：`updateOptions({ trigger: { label: '帮助', offset: 12, showDelay: 200 } })`。`selection`、`input`、`nearbyContext`、`messages` 和 `attrs` 同样遵循整体替换语义。

## Events

| 事件名                                | 参数             | 说明                                                                                                                          |
| ------------------------------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| [`selection`](#example-events)        | —                | 接受新的合法选区                                                                                                              |
| [`trigger_show`](#example-events)     | —                | 展示划词入口                                                                                                                  |
| [`trigger_click`](#example-events)    | —                | 点击入口                                                                                                                      |
| [`popover_show`](#example-events)     | —                | 展示输入浮层                                                                                                                  |
| [`suggestion_click`](#example-events) | `suggestionId`   | 点击推荐项                                                                                                                    |
| [`submit`](#example-events)           | —                | 提交请求；事件不包含选区文字或发送内容                                                                                        |
| [`close`](#example-events)            | `reason`         | `outside`、`escape`、`scroll`、`anchor-invalid`、`route`、`submit`、`disable`、`destroy`、`update`、`manual` 或 `reselection` |
| [`error`](#example-events)            | `stage`、`error` | 异步上下文、推荐、提交内容构造、适配器或配置发生错误                                                                          |

`sessionId` 是组件实例内的划词会话编号：每次接受新的有效选区时递增，同一次划词从入口显示到关闭的事件使用相同编号，便于关联事件。它不是登录会话、用户 ID 或跨实例持久化的业务标识。配置错误发生在划词前，此时 `sessionId` 为 `0`。表中只列出部分事件的其他字段。事件不包含选区原文、`query`、`prompt` 或完整上下文；错误对象由应用按自己的日志规则处理。

## CSS 变量

QuickAssist 组件支持以下 CSS 变量来自定义样式，可在 `.tr-quick-assist` 上覆盖。默认值随 Vanilla 主题变化；未继承 TinyRobot 主题变量时，使用组件自带的对应主题默认值。

| 变量名 | 说明 | 默认值（浅色 / 深色） |
| --- | --- | --- |
| [`--tr-quick-assist-bg`](#example-theme) | 入口背景色及浅色浮层基础背景色 | `#fff` / `#262626`，可继承 `--tr-container-bg-default` |
| [`--tr-quick-assist-popover-bg`](#example-theme) | 输入浮层、输入框及发送按钮背景色 | `var(--tr-quick-assist-bg)` / `#1a1a1a` |
| [`--tr-quick-assist-text`](#example-theme) | 主要文字颜色 | `#191919` / `#e6e6e6`，可继承 `--tr-text-primary` |
| [`--tr-quick-assist-muted`](#example-theme) | 入口悬停文字、推荐问题、输入框占位文字及状态提示颜色 | `#595959` / `#b3b3b3`，可继承 `--tr-text-secondary` |
| [`--tr-quick-assist-border`](#example-theme) | 输入框、推荐问题描边及滚动条颜色 | `#e6e6e6` / `rgba(255, 255, 255, 0.2)`，可继承 `--tr-assist-border-color` |
| [`--tr-quick-assist-trigger-border`](#example-theme) | 入口描边颜色，悬停时保持不变 | `#dbdbdb` / `rgba(255, 255, 255, 0.2)`，可继承 `--tr-assist-trigger-border-color` |
| [`--tr-quick-assist-popover-border`](#example-theme) | 输入浮层外描边颜色，悬停时保持不变 | `var(--tr-quick-assist-trigger-border)`，即 `#dbdbdb` / `rgba(255, 255, 255, 0.2)` |
| [`--tr-quick-assist-hover-bg`](#example-theme) | 推荐问题悬停背景色 | `#f5f5f5` / `#262626`，可继承 `--tr-assist-suggestion-bg-hover` |
| [`--tr-quick-assist-suggestion-bg`](#example-theme) | 推荐问题默认背景色，与悬停背景区分 | `var(--tr-quick-assist-popover-bg)`，浅色 `#fff` / 深色 `#1a1a1a` |
| [`--tr-quick-assist-glow-opacity`](#example-theme) | 输入框下沿四色渐变光晕的透明度，设为 `0` 可隐藏 | `0.16` / `0.3` |
| [`--tr-quick-assist-scrollbar-thumb`](#example-theme) | 输入框溢出时持续可见的 4×16px 滚动条滑块颜色 | `#dbdbdb` / `#808080`（深色可继承 `--tr-text-disabled`） |
| [`--tr-quick-assist-accent`](#example-theme) | 入口、发送按钮及推荐问题键盘聚焦时的轮廓颜色 | `#191919` / `#e6e6e6`，可继承 `--tr-text-primary` |
| [`--tr-quick-assist-radius`](#example-theme) | 输入浮层圆角 | `16px` |
| [`--tr-quick-assist-pill-radius`](#example-theme) | 入口及推荐问题按钮圆角 | `var(--tr-radius-full, 9999px)` |
| [`--tr-quick-assist-shadow`](#example-theme) | 入口及输入浮层阴影 | `0 2px 8px 0 rgba(0, 0, 0, 0.16)` / `0 2px 8px 0 rgba(0, 0, 0, 0.48)` |
| [`--tr-quick-assist-z-index`](#example-theme) | 组件层级 | `var(--tr-z-index-popover, 1500)` |
| `--tr-quick-assist-popover-width` | 输入浮层宽度，仍受视口宽度减 16px 限制 | `344px` |

AI 图标采用深浅主题对应的 SVG 资源；发送图标采用固定配色的 SVG，随主题和禁用状态切换，不受 `--tr-quick-assist-text` 或 `--tr-quick-assist-accent` 控制。旧版 `--tr-quick-assist-bg-subtle`、`--tr-quick-assist-border-hover` 和 `--tr-quick-assist-icon-gradient-*` 已不再生效。

覆盖深色模式专用的浮层背景、外描边或光晕透明度时，使用匹配主题的选择器，并将业务样式放在组件样式之后：

```css
.tr-quick-assist[data-tr-vanilla-color-mode='dark'] {
  --tr-quick-assist-popover-border: transparent;
  --tr-quick-assist-glow-opacity: 0.4;
}
```

例如，通过 `attrs.popover.class` 为浮层添加业务 class 后设置宽度：

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
