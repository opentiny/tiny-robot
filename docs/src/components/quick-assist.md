---
outline: [1, 3]
---

<script setup>
import vanillaGlobalUrl from '../../../packages/components/dist/vanilla/vanilla.global.js?url'

if (typeof window !== 'undefined') {
  window.__tinyRobotVanillaDemoGlobalUrl = vanillaGlobalUrl
}
</script>

# QuickAssist 智能帮助

QuickAssist 是一个与框架无关的智能帮助组件，可以用在需要在页面中进行轻量AI交互的场景。当前提供了“划词”和主动 API 两种触发方式，以及输入交互，用户选中页面中的文字后，可以查看推荐问题、编辑问题，并把问题和有限上下文交给应用已有的 AI 对话面板。它只负责划词触发和输入交互，不包含回答展示、模型调用或完整聊天界面。

## 安装与引入

### NPM 方式

```bash
npm install @opentiny/tiny-robot
```

从 TinyRobot NPM 包的`/vanilla` 子路径导入，并显式加载组件样式：

```ts
import { createQuickAssist } from '@opentiny/tiny-robot/vanilla'
import '@opentiny/tiny-robot/vanilla/style.css'
```

QuickAssist 的运行时代码不依赖 Vue、Angular 等框架或其他界面组件。可以在任何技术栈项目中单独使用该组件，且产物不会包含任何框架运行时。

### CDN 方式

通过 CDN 加载脚本后，使用 `window.TinyRobotVanilla` 创建组件，无需单独引入样式。将 `VERSION` 替换为包含 `vanilla.global.js` 的已发布 TinyRobot 版本号：

```html
<script src="https://cdn.jsdelivr.net/npm/@opentiny/tiny-robot@VERSION/dist/vanilla/vanilla.global.js"></script>
<script>
  const quickAssist = window.TinyRobotVanilla.createQuickAssist({
    adapter: {
      submit(request) {
        openAssistantAndSend(request.prompt, request.context)
      },
    },
  })
</script>
```

也可以将 npm 包中的 `dist/vanilla/vanilla.global.js` 部署到自己的 CDN 或静态资源目录，再替换上面的脚本地址。此文件是整个无框架组件集合的入口，提供 `createQuickAssist`、`configureVanillaTheme` 等 API。

CDN 方式会在创建实例时自动注入组件样式。如果页面的内容安全策略禁止动态注入 `<style>`，可以使用 npm 方式并显式加载 CSS。

## 代码示例

### 基础用法

使用 `createQuickAssist` 可以创建选词智能帮助的UI实例。支持通过传入参数来进行各类自定义配置。  
`adapter` 参数负责连接应用现有的 AI 对话能力，例如用户发送问题后或者点击推荐问题后显示下一步AI对话窗口。提交时应处理 `prompt` 和 `context`；只发送 `query` 会丢掉推荐问题和页面上下文。

```ts
import { createQuickAssist } from '@opentiny/tiny-robot/vanilla'
import '@opentiny/tiny-robot/vanilla/style.css'

const quickAssist = createQuickAssist({
  include: ['#app'],
  adapter: {
    submit(request) {
      // 替换为应用自己的“打开面板并自动发送”逻辑。
      assistantPanel.open()
      assistantChat.send({
        content: request.prompt,
        context: request.context,
      })
    },
  },
  onEvent(event) {
    // 可在宿主接入埋点；事件不包含默认选区文本或完整上下文。
    console.debug('[QuickAssist]', event.type)
  },
})

// 单页应用在路由离开当前页面时调用 quickAssist.close()。
// 页面/应用销毁时调用：
// quickAssist.destroy()
```

`adapter` 收到的 `AIRequest` 包含 `source`、`query`、`prompt` 和脱敏后的 `context`；点击推荐项时还包含 `suggestion`。组件先关闭划词界面，再调用 `adapter`；异步提交失败会通过 `error` 事件报告，不会重新打开已关闭的界面。

下面的示例使用 TinyRobot 的 `TrBubbleList` 与 `TrSender` 呈现对话界面，并用本地模拟回复代替后端。QuickAssist 的 `adapter` 会打开面板，并把 `prompt` 与脱敏后的 `context` 一起交给对话函数。

<demo vue="../../demos/quick-assist/vue-chat.vue" title="Vue 对话面板接入" description="划词后打开 TinyRobot 对话面板，并自动提交 prompt 与脱敏上下文。" />

### HTML 接入

下面的 HTML 示例把请求对象安全地显示在模拟对话面板中，不连接实际模型服务。

<demo html="../../demos/quick-assist/vanilla.html" title="HTML 接入" description="划词后查看提交给应用的请求内容。" />

### 延迟显示入口

设置 `trigger.showDelay` 可在选区稳定后延迟显示划词入口，单位为毫秒；默认 `0`，保持立即显示。连续拖选时从最后一次有效选区重新计时，并等待鼠标松开；选区失效、关闭、停用或销毁时会取消待显示的入口。延迟只影响入口，不影响点击后打开输入浮层。

<demo vue="../../demos/quick-assist/trigger-delay.vue" title="延迟显示划词入口" description="切换立即显示与延迟 300 毫秒，对比划词体验。" />

### 划词方向与入口位置

默认仅正向划词触发入口，设置 `selection.forwardOnly: false` 可允许双向划词。方向按文档顺序判断，跨行向后选择仍视为正向，即使结束位置在起始位置左侧；键盘 Shift 选词采用相同规则。自定义 `selection.validate` 不会覆盖方向限制。此规则面向横排中文等常规阅读场景，不按 RTL 或竖排文字的视觉方向判断。

入口默认显示在最后一行选中文字的右下方，入口左边缘对齐文字右边缘。`top` 系列位置使用第一行，`bottom` 系列使用最后一行；同一行的多个内联文本片段合并计算。`start` 表示入口向文字左侧展开（入口右边缘对齐文字左边缘），`end` 表示入口向文字右侧展开（入口左边缘对齐文字右边缘），不带后缀则居中；`auto` 优先在末行下方居中。空间不足时会翻转到另一侧，并使用对应的首行或末行，必要时向视口内调整。

点击入口后，输入浮层直接相对选区使用同一套 `placement` / `offset` 规则，默认间距为 8px；根据浮层自身尺寸进行翻转和视口避让。输入框聚焦和输入期间，原划词范围保留灰色高亮，关闭或提交后清除。高亮通过 CSS Custom Highlight API 绘制，不修改原文 DOM；不支持该 API 的浏览器仍可使用划词帮助，但不显示保留高亮。

```ts
const quickAssist = createQuickAssist({
  adapter,
  selection: { forwardOnly: true },
  trigger: { placement: 'bottom-end', offset: 8 },
})

// updateOptions 中提供的嵌套配置会整体替换原分组。
quickAssist.updateOptions({
  selection: { forwardOnly: false },
  trigger: { placement: 'top-start' },
})
```

<demo vue="../../demos/quick-assist/direction-placement.vue" title="划词方向与首末行定位" description="切换方向限制和入口位置，跨行选中文字观察入口对齐。" />

```ts
createQuickAssist({
  adapter,
  trigger: { showDelay: 300 },
})
```

### 推荐问题

选中示例中的文字后点击划词入口，可以先看到静态推荐，再看到异步返回的推荐；点击任一推荐可查看提交结果。

<demo vue="../../demos/quick-assist/recommendations.vue" title="静态与异步推荐" description="查看推荐加载、合并和点击后直接提交的效果。" />

通过 `suggestions` 配置的问题称为“静态问题”，可包含根据选区生成文案的模板；与组件内置的默认推荐问题区分。QuickAssist 支持四种推荐模式：

| 配置方式                               | 打开输入浮层后的行为                                                                                                                                 |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 省略 `suggestions` 与 `getSuggestions` | 立即显示“解释”和“适用场景”两个默认模板                                                                                                               |
| 仅配置 `suggestions`                   | 立即显示静态推荐；显式传 `[]` 表示不显示默认模板                                                                                                     |
| 仅配置 `getSuggestions`                | 不显示内置默认模板；立即打开输入区，推荐区域显示加载状态，返回后只展示远程结果                                                                       |
| 两者都配置                             | 先显示静态模板，再合并异步推荐；默认静态在前、远程追加，按 `id` 保留首次出现项，最后由 `maxSuggestions` 裁剪；可用 `mergeSuggestions` 自定义覆盖策略 |

`Suggestion` 包含稳定的 `id`、展示用 `label` 和提交用 `prompt`。点击推荐项会直接提交，无须再次点击发送。手动输入则把编辑后的内容作为 `query`；可用 `buildPrompt` 自定义最终发送内容。

#### 远程推荐覆盖静态问题

如果问题全部由远程接口提供，只需配置 `getSuggestions`，省略 `suggestions`，内置的“解释”和“适用场景”模板就不会显示。如果希望加载期间先显示静态问题，远程返回后整体替换，可显式提供静态模板，并通过 `mergeSuggestions` 只返回远程结果。

下面的示例可切换“仅远程推荐”“远程整体替换”“空结果回退”和“远程优先”四种策略，以及成功、空数组、失败三种响应。示例用延迟模拟远程请求，无需后端即可运行；展开示例源码可查看完整配置。接入业务接口时，将 `getSuggestions` 中的模拟逻辑替换为 `fetch`，传入 `signal` 并返回 `Suggestion[]` 即可。

<demo vue="../../demos/quick-assist/remote-recommendations.vue" title="远程推荐与覆盖策略" description="切换策略和响应后重新划词，观察加载期间的静态问题及远程返回后的结果。" />

“远程整体替换”会在远程成功返回空数组时清空静态推荐；“空结果回退”则保留静态问题。“远程优先”示例中远程与静态的解释问题具有相同 `id`，可以观察远程问题如何覆盖静态问题，同时保留未重复的静态问题。

请求失败时不会调用 `mergeSuggestions`，会保留已显示的静态问题并展示加载失败状态，同时触发 `stage: 'suggestions'` 的错误事件。仅配置远程推荐时没有静态问题可回退，用户仍可手动输入提交。

#### 自定义合并策略 `mergeSuggestions`

`mergeSuggestions(base, incoming, context)` 是同步回调，在远程推荐成功返回并通过校验后调用。`base` 是静态推荐经模板求值、按 `id` 去重并按 `maxSuggestions` 裁剪后的结果；`incoming` 是过滤无效项后、尚未去重或裁剪的远程推荐数组；`context` 是本次推荐使用的脱敏上下文。回调必须返回 `Suggestion[]`。

默认策略相当于 `[...base, ...incoming]`：静态项优先，同 `id` 的远程项不会覆盖静态项；静态项占满数量上限时，远程项可能不展示。可以按业务需要返回不同顺序：

| 目标                                   | 回调返回值                          |
| -------------------------------------- | ----------------------------------- |
| 远程整体替换静态问题                   | `incoming`                          |
| 远程有结果时替换，否则保留静态问题     | `incoming.length ? incoming : base` |
| 远程优先，保留未重复的静态问题         | `[...incoming, ...base]`            |
| 静态优先，追加未重复的远程问题（默认） | `[...base, ...incoming]`            |

自定义回调返回后，组件仍会校验推荐格式、按 `id` 保留首次出现项，并应用 `maxSuggestions` 上限（默认 `3`）。因此，远程优先策略也可以用来覆盖静态同 `id` 的问题。

#### 远程问题校验 `validateSuggestion`

组件先检查远程响应是否为数组，再逐项检查 `id`、`label`、`prompt` 是否为非空字符串（纯空白也无效）。格式无效项会被过滤，不影响同批其他有效问题。静态问题及自定义合并结果也会进行格式校验，配置或合并结果无效时会报错。

可选的同步回调 `validateSuggestion(suggestion, context): boolean` 在基础校验后、合并前逐项执行，仅用于远程问题：

推荐的 `meta` 会进行结构化深拷贝，校验器修改副本或提供器在推荐被接收后修改原对象，都不会改变已接收的推荐内容。`meta` 支持 Date、Map、Set、类型化数组和循环引用，但不能包含函数、DOM 节点、响应式代理或共享内存。远程问题的 `meta` 无法克隆时，该项按无效问题过滤；非空批次全部无效时仍按推荐失败处理。

| 参数或返回值          | 含义                                                                                                                     |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `suggestion`          | 已通过基础格式校验的单条推荐副本，包含 `id`、`label`、`prompt` 和可选 `meta`；该回调用于判断是否保留，不用于修改推荐内容 |
| `context`             | 本次推荐使用的脱敏上下文，可读取 `text`、页面、附近文本和业务字段                                                        |
| 返回 `true` / `false` | 保留 / 丢弃该问题                                                                                                        |

下面的独立示例并列展示远程原始问题、逐项过滤原因和最终展示问题。选中“竞价计费”后打开智能帮助，查看同一批问题的校验结果；切换“启用业务校验”后重新划词，可对比哪些问题被保留。基础格式校验始终执行，不受该开关影响。

<demo vue="../../demos/quick-assist/suggestion-validation.vue" title="远程问题校验前后对比" description="对比原始问题与最终问题，查看空白、超长、不相关问题的过滤原因，以及全部无效时的静态回退。" />

示例业务规则限制标题不超过 40 字、问题不超过 1000 字，并要求问题包含选中文字，可按产品需要替换；组件本身不设置文字长度上限。切换为“全部异常问题”可观察全部无效时的静态问题回退，展开源码可查看完整的 `validateSuggestion` 配置。

响应不是数组、非空响应全部被过滤、回调抛出异常或返回非布尔值（包括 `Promise`）时，整批远程推荐失败，不会调用 `mergeSuggestions`，会保留静态问题并触发 `stage: 'suggestions'` 的错误事件。仅远程模式仍可手动输入提交。接口主动返回 `[]` 则属于成功的空结果，继续按合并策略处理，与全部被过滤的情况区分。

`ValidateSuggestion` 类型可从 `@opentiny/tiny-robot/vanilla` 导入。AI 原始输出的 JSON 解析、字段映射和缺失 `id` 的生成应在业务 `getSuggestions` 中完成，组件接收统一的 `Suggestion[]`。

### 页面上下文与敏感数据

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

### 生效范围与选择长度

试着选择示例中允许的文字、排除区域，以及超过长度限制的句子，比较划词入口是否出现。

<demo vue="../../demos/quick-assist/selection-scope.vue" title="可选择区域与长度限制" description="仅指定区域和有效长度的选区会显示划词入口。" />

```ts
const quickAssist = createQuickAssist({
  adapter,
  include: ['#app'], // 配置后，选区中的每个文本节点都必须位于匹配区域
  exclude: ['[data-qa-ignore]', '.private-value'], // 在内置排除项上追加
  selection: {
    maxTextLength: 300,
    validate(snapshot) {
      return snapshot.text.trim().length > 0
    },
  },
})
```

默认拒绝空白、纯数字、纯标点/符号、明显 URL、UUID 和超出长度的选区；不会用固定最短长度过滤 `ECS`、`VPC`、`QoS` 等短技术词。`selection.validate` 自定义文本判断，但仍不能绕过最大长度、`include` / `exclude`、编辑器和敏感区域检查。超长选区会被拒绝，不会悄悄截断后发送。

默认排除 `input`、`textarea`、`select`、可编辑的 `contenteditable` 区域、Monaco、CodeMirror、QuickAssist 自身界面，以及 `[data-ai-selection="false"]`、`[data-sensitive]`、`[data-secret]`、`[data-password]` 等标记。普通只读 `contenteditable="false"` 区域可以划词；若它位于可编辑祖先或其他排除区域内，仍会被排除。
::: tip 支持范围
当前版本暂不支持移动端长按选择，以及 iframe 和 Shadow DOM 内的选区。
:::

### 主动激活：按钮与自定义选区

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

| 本次激活参数                          | 行为                                             |
| ------------------------------------- | ------------------------------------------------ |
| 不传 `suggestions` / `getSuggestions` | 使用实例默认推荐配置                             |
| `suggestions: [...]`                  | 替换本次的静态推荐；不调用实例的远程推荐         |
| `suggestions: []`                     | 不显示推荐，保留手动提问                         |
| `getSuggestions: fn`                  | 使用本次的异步推荐函数，可与本次静态推荐一起配置 |
| `getSuggestions: null`                | 本次禁用远程推荐，静态推荐仍按对应配置展示       |

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

### Monaco 选中代码后主动解释

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

### 生命周期与路由

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

### 主题配置

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

浮层挂载在 `body` 下，局部主题来源只同步亮暗状态，不会复制局部品牌变量。自定义变量应放在 `html`、`body` 或组件根节点的全局样式中。iframe 需通过 `configureVanillaTheme(config, iframeDocument)` 配置其自身文档。

## 交互与限制

- 划词默认仅正向触发；入口默认出现在选区末行右下方，空间不足时会翻转或调整位置；打开输入浮层后仍会跟随入口对应的首末行位置。
- 点击入口后输入框立即打开并聚焦，默认填入选中文字；按 Enter 发送，按 Shift+Enter 换行，输入法组合期间不会误发。
- 等待业务上下文构造或脱敏时，仍可编辑输入，但暂时不能提交；脱敏完成前不会调用推荐函数。
- 点击推荐项或手动发送后，组件先关闭划词界面，再调用 `adapter`。
- 新选区会替换旧会话。点击外部、按 Esc、锚点失效、显著滚动、路由变化或调用生命周期方法时，会清理当前界面。
- 浏览器的 `popstate` 和 `hashchange` 会自动关闭界面；其他单页应用导航应由路由钩子调用 `close()`。

::: tip 功能边界
输入浮层不显示 AI 答案，也不提供流式渲染、重试、多轮对话或模型管理；这些仍由应用已有的 AI 面板负责。
:::

## Props

| 属性名                         | 类型                                                                                        | 默认值         | 说明                                                                                                                                           |
| ------------------------------ | ------------------------------------------------------------------------------------------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `root`                         | `Document`                                                                                  | `document`     | 所在文档；不接受 `ShadowRoot`                                                                                                                  |
| `enabled`                      | `boolean`                                                                                   | `true`         | 是否启用划词监听                                                                                                                               |
| `adapter`                      | `AIAdapter`                                                                                 | —              | 必填；由 `submit(request)` 交给应用已有的对话能力                                                                                              |
| `include`                      | `string[]`                                                                                  | —              | 限定可触发的页面区域                                                                                                                           |
| `exclude`                      | `string[]`                                                                                  | —              | 在内置排除规则上追加页面区域                                                                                                                   |
| `selection.maxTextLength`      | `number`                                                                                    | `300`          | 可选文字的最大长度，必须为正整数                                                                                                               |
| `selection.forwardOnly`        | `boolean`                                                                                   | `true`         | 仅正向选词触发；设为 false 允许双向选择                                                                                                        |
| `selection.validateActivation` | `(view: QuickAssistActivationView) => boolean`                                              | 默认文本规则   | 仅自定义激活的文本校验，不接收 DOM Range                                                                                                       |
| `selection.validate`           | `(snapshot) => boolean`                                                                     | 内置校验       | 替代默认的文本内容校验                                                                                                                         |
| `trigger.label`                | `string`                                                                                    | `智能帮助`     | 划词入口文案                                                                                                                                   |
| `trigger.showDelay`            | `number`                                                                                    | `0`            | 选区稳定后延迟显示入口，单位为毫秒，须为非负整数                                                                                               |
| `trigger.offset`               | `number`                                                                                    | `8`            | 入口及输入浮层与选区的间距，单位为像素                                                                                                         |
| `trigger.placement`            | `'auto' \| 'top' \| 'bottom' \| 'top-start' \| 'top-end' \| 'bottom-start' \| 'bottom-end'` | `'bottom-end'` | 入口及输入浮层的优先位置；上方按首行、下方按末行，空间不足时调整                                                                               |
| `nearbyContext.maxLength`      | `number`                                                                                    | `500`          | 附近文本的最大字符数                                                                                                                           |
| `nearbyContext.blockSelectors` | `string[]`                                                                                  | 内置选择器     | 在默认语义块之外增加候选块                                                                                                                     |
| `getNearbyContext`             | `(snapshot) => string \| undefined`                                                         | —              | 自定义附近文本；`snapshot` 含 DOM `Range`                                                                                                      |
| `getContext`                   | `(context, signal) => Record \| Promise<Record>`                                            | —              | 返回业务字段，合并到 `businessContext`                                                                                                         |
| `sanitizeContext`              | `(context, signal) => QuickAssistContext \| Promise<QuickAssistContext>`                    | —              | 返回最终允许外发的完整上下文                                                                                                                   |
| `suggestions`                  | `QuickAssistSuggestionInput[]`                                                              | 默认推荐       | 静态推荐或推荐生成函数                                                                                                                         |
| `getSuggestions`               | `(context, signal) => Suggestion[] \| Promise<Suggestion[]>`                                | —              | 使用脱敏后的上下文获取异步推荐                                                                                                                 |
| `validateSuggestion`           | `(suggestion: Suggestion, context: QuickAssistContext) => boolean`                          | 基础格式校验   | 可选业务校验，仅过滤远程问题，在合并前执行，见[远程问题校验](#远程问题校验-validatesuggestion)                                                 |
| `mergeSuggestions`             | `(base, incoming, context) => Suggestion[]`                                                 | 静态优先追加   | 远程成功返回后同步合并；可整体替换或远程优先；最终按 `id` 保留首次出现项并受数量上限约束，见[自定义合并策略](#自定义合并策略-mergesuggestions) |
| `maxSuggestions`               | `number`                                                                                    | `3`            | 最多展示的推荐数，必须为正整数                                                                                                                 |
| `buildPrompt`                  | `(input) => string`                                                                         | 内置构造       | 自定义提交内容                                                                                                                                 |
| `attrs`                        | `QuickAssistAttrs`                                                                          | —              | 为组件内部元素追加安全的 DOM 属性                                                                                                              |
| `messages`                     | `QuickAssistMessages`                                                                       | 内置中文文案   | 覆盖界面文案和默认推荐的展示文字                                                                                                               |
| `onEvent`                      | `(event) => void`                                                                           | —              | 事件回调；回调异常不会打断组件清理                                                                                                             |

`attrs.suggestion` 可以是属性对象，也可以是按推荐项返回属性对象的函数。事件处理器、`style`、写入 HTML 的属性、`value`、`disabled`、`type`、`id` 等会被忽略；`class` 只能追加，不能覆盖组件内部行为。

## Methods

| 方法名           | 参数                                                      | 说明                                                                 |
| ---------------- | --------------------------------------------------------- | -------------------------------------------------------------------- |
| `activate`       | `QuickAssistActivationInput \| QuickAssistAnchorShortcut` | 提供文本和锚点，显示智能帮助入口；详见主动激活示例                   |
| `registerSource` | `QuickAssistSelectionSource`                              | 注册自动来源，返回注销函数，随实例启停联动                           |
| `enable`         | —                                                         | 启动划词和全局事件监听；重复调用无副作用                             |
| `disable`        | —                                                         | 关闭当前输入浮层并停止监听；之后可再次调用 `enable()`                |
| `close`          | —                                                         | 关闭当前会话，不销毁实例                                             |
| `updateOptions`  | `partial: Partial<QuickAssistOptions>`                    | 关闭当前会话、废弃旧异步结果并重建配置；顶层浅合并，嵌套对象整体替换 |
| `destroy`        | —                                                         | 关闭并释放监听器与 DOM；重复调用无副作用                             |

`registerSource()` 是已实现的高级接口，用于多个自定义事件源的统一启停、注销和来源级去重；它不会自动读取编辑器选区或生成坐标。上面的按钮、指标和 Monaco 示例直接使用 `activate()`，无需注册来源。没有多来源管理需求时，不必使用此方法。

`root` 创建后不可更换；`updateOptions({ root: anotherDocument })` 会抛出错误，应先销毁旧实例再创建新实例。更新时省略 `enabled` 会保留实例当前启用/停用状态；显式传入时使用新值。

例如，原来配置 `trigger: { label: '帮助', offset: 12 }`，随后调用 `updateOptions({ trigger: { showDelay: 200 } })` 会把标签和偏移恢复到默认值。若要保留它们，需要传入完整分组：`updateOptions({ trigger: { label: '帮助', offset: 12, showDelay: 200 } })`。`selection`、`nearbyContext`、`messages` 和 `attrs` 同样遵循整体替换语义。

## Events

| 事件名             | 参数             | 说明                                                                                                                          |
| ------------------ | ---------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `selection`        | —                | 接受新的合法选区                                                                                                              |
| `trigger_show`     | —                | 展示划词入口                                                                                                                  |
| `trigger_click`    | —                | 点击入口                                                                                                                      |
| `popover_show`     | —                | 展示输入浮层                                                                                                                  |
| `suggestion_click` | `suggestionId`   | 点击推荐项                                                                                                                    |
| `submit`           | —                | 提交请求；事件不包含选区文字或发送内容                                                                                        |
| `close`            | `reason`         | `outside`、`escape`、`scroll`、`anchor-invalid`、`route`、`submit`、`disable`、`destroy`、`update`、`manual` 或 `reselection` |
| `error`            | `stage`、`error` | 异步上下文、推荐、提交内容构造、适配器或配置发生错误                                                                          |

`sessionId` 是组件实例内的划词会话编号：每次接受新的有效选区时递增，同一次划词从入口显示到关闭的事件使用相同编号，便于关联事件。它不是登录会话、用户 ID 或跨实例持久化的业务标识。配置错误发生在划词前，此时 `sessionId` 为 `0`。表中只列出部分事件的其他字段。事件不包含选区原文、`query`、`prompt` 或完整上下文；错误对象由应用按自己的日志规则处理。

## CSS 变量

QuickAssist 组件支持以下 CSS 变量来自定义样式，可在 `.tr-quick-assist` 上覆盖。部分默认值使用 TinyRobot 主题变量，未提供主题变量时使用 `var()` 中的回退值。

| 变量名                                   | 说明                             | 默认值                                                                            |
| ---------------------------------------- | -------------------------------- | --------------------------------------------------------------------------------- |
| `--tr-quick-assist-bg`                   | 入口、输入浮层及按钮的基础背景色 | `var(--tr-container-bg-default, #fff)`                                            |
| `--tr-quick-assist-bg-subtle`            | 入口悬停时背景色                 | `var(--tr-container-bg-default-2, #fafafa)`                                       |
| `--tr-quick-assist-text`                 | 主要文字及发送按钮颜色           | `var(--tr-text-primary, #191919)`                                                 |
| `--tr-quick-assist-muted`                | 输入框占位文字及状态提示文字颜色 | `var(--tr-text-secondary, #595959)`                                               |
| `--tr-quick-assist-border`               | 边框及滚动条颜色                 | `#e6e6e6`                                                                         |
| `--tr-quick-assist-border-hover`         | 弹窗及按钮悬停时的边框颜色       | `color-mix(in srgb, var(--tr-quick-assist-bg) 65%, var(--tr-quick-assist-muted))` |
| `--tr-quick-assist-accent`               | 发送按钮悬停及键盘聚焦时的强调色 | `var(--tr-text-primary, #191919)`                                                 |
| `--tr-quick-assist-icon-gradient-start`  | 星光图标渐变起始色（左上）       | `#7d00ff`                                                                         |
| `--tr-quick-assist-icon-gradient-middle` | 星光图标渐变中间色               | `#b927ff`                                                                         |
| `--tr-quick-assist-icon-gradient-end`    | 星光图标渐变结束色（右下）       | `#ff6bb5`                                                                         |
| `--tr-quick-assist-radius`               | 输入浮层圆角                     | `16px`                                                                            |
| `--tr-quick-assist-pill-radius`          | 入口、输入区及推荐问题按钮圆角   | `var(--tr-radius-full, 9999px)`                                                   |
| `--tr-quick-assist-shadow`               | 入口及输入浮层阴影               | `0 2px 8px 0 rgba(0, 0, 0, 0.16)`                                                 |
| `--tr-quick-assist-z-index`              | 组件层级                         | `var(--tr-z-index-popover, 1500)`                                                 |
| `--tr-quick-assist-popover-width`        | 输入浮层宽度，仍受视口宽度减 16px 限制 | `272px` |

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
