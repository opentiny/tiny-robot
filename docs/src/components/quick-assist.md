---
outline: [1, 3]
---

<script setup>
import vanillaUmdUrl from '../../../packages/components/dist/vanilla/vanilla.umd.js?url'

if (typeof window !== 'undefined') {
  window.__tinyRobotVanillaDemoUmdUrl = vanillaUmdUrl
}
</script>

# QuickAssist 智能帮助

QuickAssist 是一个与框架无关的智能帮助组件，可以用在需要在页面中进行轻量AI交互的场景。当前提供了“划词”触发和输入交互，用户选中页面中的文字后，可以查看推荐问题、编辑问题，并把问题和有限上下文交给应用已有的 AI 对话面板。它只负责划词触发和输入交互，不包含回答展示、模型调用或完整聊天界面。

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

### UMD 方式

将 `node_modules/@opentiny/tiny-robot/dist/vanilla/vanilla.umd.js` 部署到应用的静态资源目录或者CDN，通过全局对象 `TinyRobotVanilla` 调用。此文件是整个无框架组件集合的入口；以后新增组件也会从同一全局对象导出。下例中以jsdelivr cdn地址为例：

```html
<script src="https://cdn.jsdelivr.net/npm/@opentiny/tiny-robot@0.5.2-alpha.19/dist/vanilla/vanilla.umd.js"></script>
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

UMD 入口会自动向所在文档注入组件样式。如果内容安全策略禁止动态注入 `<style>`，可以使用上文的 NPM/ESM 入口并显式加载 CSS。

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

```ts
createQuickAssist({
  adapter,
  trigger: { showDelay: 300 },
})
```

### 推荐问题

选中示例中的文字后点击划词入口，可以先看到静态推荐，再看到异步返回的推荐；点击任一推荐可查看提交结果。

<demo vue="../../demos/quick-assist/recommendations.vue" title="静态与异步推荐" description="查看推荐加载、合并和点击后直接提交的效果。" />

QuickAssist 支持四种推荐模式：

| 配置方式                               | 打开输入浮层后的行为                                                                   |
| -------------------------------------- | -------------------------------------------------------------------------------------- |
| 省略 `suggestions` 与 `getSuggestions` | 立即显示“解释”和“适用场景”两个默认模板                                                 |
| 仅配置 `suggestions`                   | 立即显示静态推荐；显式传 `[]` 表示不显示默认模板                                       |
| 仅配置 `getSuggestions`                | 立即打开输入区，推荐区域显示加载状态；推荐函数返回后展示结果                           |
| 两者都配置                             | 先显示静态模板，再合并异步推荐；默认保留模板，按 ID 去重，最后由 `maxSuggestions` 裁剪 |

下面用业务接口示意异步推荐；`/api/quick-assist/suggestions` 是应用自行提供的服务路径。

```ts
const quickAssist = createQuickAssist({
  adapter,
  suggestions: [
    {
      id: 'explain',
      label: '解释这个选项',
      prompt: '请结合当前页面上下文解释这个选项的含义',
    },
    {
      id: 'compare',
      getLabel: ({ text }) => `比较“${text}”`,
      getPrompt: ({ text }) => `请结合当前页面上下文比较“${text}”和相关选项`,
    },
  ],
  getSuggestions: async (context, signal) => {
    const response = await fetch('/api/quick-assist/suggestions', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(context),
      signal,
    })
    if (!response.ok) throw new Error('推荐请求失败')
    return response.json()
  },
  maxSuggestions: 3,
})
```

`Suggestion` 包含稳定的 `id`、展示用 `label` 和提交用 `prompt`。点击推荐项会直接提交，无须再次点击发送。手动输入则把编辑后的内容作为 `query`；可用 `buildPrompt` 自定义最终发送内容。

### 页面上下文与敏感数据

示例会在提交后展示最终上下文：业务字段中的租户编号已脱敏，标为敏感的文字不能触发划词，也不会进入附近文本。

<demo vue="../../demos/quick-assist/context.vue" title="上下文与脱敏" description="选中文字并提交，查看允许交给应用的上下文。" />

默认上下文包含：

- `source: 'selection'`、`text` 和 `selection.text`；
- 页面标题与 URL；URL 只包含域名和路径，不采集查询参数或片段标识；
- 限长的 `nearbyText`，从选区附近的有限语义块提取；找不到语义块时最多退回选中文字。

可以通过 `getContext` 添加业务字段，通过 `getNearbyContext` 定制附近文本，并通过 `sanitizeContext` 返回最终允许外发的完整上下文。`sanitizeContext` 在业务上下文构造后执行；脱敏完成前不会调用推荐函数或 `adapter`。

```ts
const quickAssist = createQuickAssist({
  adapter,
  getContext: async (_context, signal) => {
    const currentPage = await loadCurrentPageContext({ signal })
    return {
      product: currentPage.product,
      section: currentPage.section,
      tenantId: currentPage.tenantId,
    }
  },
  sanitizeContext: (context) => ({
    ...context,
    businessContext: {
      ...context.businessContext,
      tenantId: '[redacted]',
    },
  }),
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

默认排除 `input`、`textarea`、`select`、`contenteditable`、Monaco、CodeMirror、QuickAssist 自身界面，以及 `[data-ai-selection="false"]`、`[data-sensitive]`、`[data-secret]`、`[data-password]` 等标记。
::: tip 支持范围
当前版本暂不支持移动端长按选择，以及 iframe 和 Shadow DOM 内的选区。
:::

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

## 交互与限制

- 划词入口默认出现在选区下方居中，空间不足时会翻转或调整位置；打开输入浮层后仍会根据选区重新定位。
- 点击入口后输入框立即打开并聚焦，默认填入选中文字；按 Enter 发送，按 Shift+Enter 换行，输入法组合期间不会误发。
- 等待业务上下文构造或脱敏时，仍可编辑输入，但暂时不能提交；脱敏完成前不会调用推荐函数。
- 点击推荐项或手动发送后，组件先关闭划词界面，再调用 `adapter`。
- 新选区会替换旧会话。点击外部、按 Esc、锚点失效、显著滚动、路由变化或调用生命周期方法时，会清理当前界面。
- 浏览器的 `popstate` 和 `hashchange` 会自动关闭界面；其他单页应用导航应由路由钩子调用 `close()`。

::: tip 功能边界
输入浮层不显示 AI 答案，也不提供流式渲染、重试、多轮对话或模型管理；这些仍由应用已有的 AI 面板负责。
:::

## Props

| 属性名                         | 类型                                                                     | 默认值       | 说明                                               |
| ------------------------------ | ------------------------------------------------------------------------ | ------------ | -------------------------------------------------- |
| `root`                         | `Document`                                                               | `document`   | 所在文档；不接受 `ShadowRoot`                      |
| `enabled`                      | `boolean`                                                                | `true`       | 是否启用划词监听                                   |
| `adapter`                      | `AIAdapter`                                                              | —            | 必填；由 `submit(request)` 交给应用已有的对话能力  |
| `include`                      | `string[]`                                                               | —            | 限定可触发的页面区域                               |
| `exclude`                      | `string[]`                                                               | —            | 在内置排除规则上追加页面区域                       |
| `selection.maxTextLength`      | `number`                                                                 | `300`        | 可选文字的最大长度，必须为正整数                   |
| `selection.validate`           | `(snapshot) => boolean`                                                  | 内置校验     | 替代默认的文本内容校验                             |
| `trigger.label`                | `string`                                                                 | `智能帮助`   | 划词入口文案                                       |
| `trigger.showDelay`            | `number`                                                                 | `0`          | 选区稳定后延迟显示入口，单位为毫秒，须为非负整数   |
| `trigger.offset`               | `number`                                                                 | `8`          | 入口与选区的间距，单位为像素                       |
| `trigger.placement`            | `'auto' \| 'top' \| 'bottom'`                                            | `'auto'`     | 入口的优先位置；空间不足时调整                     |
| `nearbyContext.maxLength`      | `number`                                                                 | `500`        | 附近文本的最大字符数                               |
| `nearbyContext.blockSelectors` | `string[]`                                                               | 内置选择器   | 在默认语义块之外增加候选块                         |
| `getNearbyContext`             | `(snapshot) => string \| undefined`                                      | —            | 自定义附近文本；`snapshot` 含 DOM `Range`          |
| `getContext`                   | `(context, signal) => Record \| Promise<Record>`                         | —            | 返回业务字段，合并到 `businessContext`             |
| `sanitizeContext`              | `(context, signal) => QuickAssistContext \| Promise<QuickAssistContext>` | —            | 返回最终允许外发的完整上下文                       |
| `suggestions`                  | `QuickAssistSuggestionInput[]`                                           | 默认推荐     | 静态推荐或推荐生成函数                             |
| `getSuggestions`               | `(context, signal) => Suggestion[] \| Promise<Suggestion[]>`             | —            | 使用脱敏后的上下文获取异步推荐                     |
| `mergeSuggestions`             | `(base, incoming, context) => Suggestion[]`                              | 内置合并     | 自定义推荐合并；最终仍按 `id` 去重并受数量上限约束 |
| `maxSuggestions`               | `number`                                                                 | `3`          | 最多展示的推荐数，必须为正整数                     |
| `buildPrompt`                  | `(input) => string`                                                      | 内置构造     | 自定义提交内容                                     |
| `attrs`                        | `QuickAssistAttrs`                                                       | —            | 为组件内部元素追加安全的 DOM 属性                  |
| `messages`                     | `QuickAssistMessages`                                                    | 内置中文文案 | 覆盖界面文案和默认推荐的展示文字                   |
| `onEvent`                      | `(event) => void`                                                        | —            | 事件回调；回调异常不会打断组件清理                 |

`attrs.suggestion` 可以是属性对象，也可以是按推荐项返回属性对象的函数。事件处理器、`style`、写入 HTML 的属性、`value`、`disabled`、`type`、`id` 等会被忽略；`class` 只能追加，不能覆盖组件内部行为。

样式限制在 `.tr-quick-assist` 命名空间内。组件变量以 `--tr-quick-assist-*` 命名，并映射现有 TinyRobot 设计变量；未提供应用主题变量时，使用组件自身的默认值。ESM 模式须显式加载 CSS；UMD 入口会自动注入样式。

## Methods

| 方法名          | 参数                                   | 说明                                                                 |
| --------------- | -------------------------------------- | -------------------------------------------------------------------- |
| `enable`        | —                                      | 启动划词和全局事件监听；重复调用无副作用                             |
| `disable`       | —                                      | 关闭当前输入浮层并停止监听；之后可再次调用 `enable()`                |
| `close`         | —                                      | 关闭当前会话，不销毁实例                                             |
| `updateOptions` | `partial: Partial<QuickAssistOptions>` | 关闭当前会话、废弃旧异步结果并重建配置；顶层浅合并，嵌套对象整体替换 |
| `destroy`       | —                                      | 关闭并释放监听器与 DOM；重复调用无副作用                             |

`root` 创建后不可更换；`updateOptions({ root: anotherDocument })` 会抛出错误，应先销毁旧实例再创建新实例。更新时省略 `enabled` 会保留实例当前启用/停用状态；显式传入时使用新值。

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
