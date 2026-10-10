---
outline: [1, 3]
---

# Chat 聊天界面

`TrChat` 是用于 Vue 应用的 AI 聊天页面组件，提供会话列表、消息展示和输入区，可接入模型服务发送消息，适用于独立聊天页面和应用内嵌 AI 助手。

## 快速开始

### 安装

在已有 Vue 项目中安装 Chat 套件：

::: code-group

```bash [pnpm]
pnpm add @opentiny/tiny-robot-chat
```

```bash [yarn]
yarn add @opentiny/tiny-robot-chat
```

```bash [npm]
npm install @opentiny/tiny-robot-chat
```

:::

### 引入样式

在应用入口（如 `main.ts`）引入基础组件和 Chat 的样式：

```ts
import '@opentiny/tiny-robot/dist/style.css'
import '@opentiny/tiny-robot-chat/dist/style.css'
```

### 接入模型服务

`TrChat` 推荐通过 `useChatRuntime` 接入模型服务。[`useChatRuntime`](./chat-runtime#usechatruntime-配置) 是 Chat 套件提供的聊天功能配置函数，负责连接模型服务、管理会话和发送请求，无需自行编写这些聊天逻辑。

将返回的 `runtime` 对象传给 `TrChat`，即可使用发送消息、取消请求和切换会话等功能，可参考以下最小接入示例：

```vue
<script setup lang="ts">
import { TrChat, useChatRuntime, type ChatProviderConfig } from '@opentiny/tiny-robot-chat'

// 模型服务配置数组，每项配置一个服务及其可用模型
const modelProviders: ChatProviderConfig[] = [
  {
    // 必填，无默认值；可选 'openai'、'deepseek'、'qwen'
    // 本例服务兼容 OpenAI /chat/completions 接口，因此使用 'openai'
    type: 'openai',

    // 替换为实际服务地址，以下地址仅作占位，不能直接使用
    // 可填服务根地址或完整 /chat/completions 地址；省略时使用对应服务的预设地址
    apiUrl: 'https://your-service.example.com/v1/chat/completions',

    // 该服务下的模型列表；id 和 label 均为必填，无默认值
    models: [
      {
        id: 'your-model-id', // 替换为服务支持的模型 ID
        label: '应用助手', // 模型在界面中显示的名称
      },
    ],
  },
]

const runtime = useChatRuntime({ modelProviders })
</script>

<template>
  <main class="chat-page">
    <TrChat :runtime="runtime" />
  </main>
</template>

<style scoped>
.chat-page {
  height: 600px;
}
</style>
```

::: tip 容器高度
示例通过 `height: 600px` 设置父容器高度。请根据页面布局设置明确高度，否则消息区可能无法正常显示或滚动。
:::

以下演示使用本地模拟服务，无需配置真实模型服务，可体验发送消息和查看回答：

<demo
  vue="../../demos/chat/basic.vue"
  :vueFiles="[
    '../../demos/chat/basic.vue',
    '../../demos/chat/shared/modelProviders.ts'
  ]"
  title="完整聊天页面"
  description="输入消息并发送，查看模拟服务返回的回答。"
/>

生产环境应通过服务端转发请求并保管模型密钥，不要将长期密钥写入前端代码。更多配置见 [模型服务](./chat-runtime#模型服务)。

项目已使用 Kit 的 `useConversation` 管理会话时，可通过 `useChatRuntimeFromConversation` 接入 `TrChat`，复用已有会话和请求配置，详见 [复用已有会话](./chat-runtime#复用已有会话)。

## 常用功能

前面通过 `runtime` 接入了模型服务，并实现了发送消息、取消请求和会话切换等操作。需要调整页面布局、欢迎内容或输入区时，可以通过 `TrChat` 的 `ui` 属性定制界面。

`ui` 是一个界面配置对象，用于设置布局、文案和各区域的显示方式；只需配置需要调整的部分，其余使用默认值。常用的字段如下，具体配置见后续示例：

```ts
import type { ChatUIOptions } from '@opentiny/tiny-robot-chat'

const ui: ChatUIOptions = {
  layout: {},  // 页面布局、侧栏和浮动窗口
  labels: {},  // 按字段修改界面文案
  history: {}, // 历史会话列表
  welcome: {}, // 欢迎区内容
  prompts: {}, // 推荐问题
  sender: {},  // 输入区配置
  bubble: {},  // 消息展示配置
}
```

将配置好的 `ui` 传给 `TrChat`：

```vue
<TrChat :runtime="runtime" :ui="ui" />
```

下面介绍常用配置和示例，完整字段见 [界面配置](#界面配置)。需要自定义界面内容时，见 [插槽定制](#插槽定制)。

### 页面布局

通过 `ui.layout` 调整内容宽度、侧栏和空会话时的输入区位置：

| 配置                       | 用途和可选值                                                               | 默认值               |
| -------------------------- | -------------------------------------------------------------------------- | -------------------- |
| `contentMaxWidth`          | 消息、欢迎区和输入区的最大内容宽度；支持数字或 CSS 长度，如 `640`、`'80%'` | `980`，数字单位为 px |
| `leftAside`                | 左侧栏配置对象；设为 `false` 隐藏整个左侧栏                                | 显示侧栏，默认收起   |
| `leftAside.width`          | 左侧栏展开宽度，单位为 px                                                  | `300`                |
| `leftAside.collapsedWidth` | 左侧栏收起宽度，单位为 px                                                  | `56`                 |
| `leftAside.defaultOpen`    | 是否默认展开，之后可通过界面按钮切换                                       | `false`              |
| `composer.welcome`         | `'footer'` 在页面底部显示输入区；`'center'` 在欢迎区中央显示               | `'footer'`           |

例如，缩小内容宽度并默认展开左侧栏：

```ts
const ui: ChatUIOptions = {
  layout: {
    contentMaxWidth: 640,
    leftAside: { width: 240, collapsedWidth: 48, defaultOpen: true },
    composer: { welcome: 'center' },
  },
}
```

`composer.welcome` 只影响没有消息时的输入区位置；已有消息时，输入区仍位于页面底部。点击下面的按钮，可比较侧栏宽度、展开和隐藏，以及两种空会话输入位置。

> 此演示使用 `TrChatUI` 展示布局效果，相同的 `ui` 配置也适用于 `TrChat`。

<demo
  vue="../../demos/chat/layout-presets.vue"
  :vueFiles="['../../demos/chat/layout-presets.vue']"
  title="页面布局"
  description="切换布局，查看侧栏宽度、展开和隐藏，以及空会话输入区的位置变化。"
/>

完整字段和默认值见 [布局配置](#layout)。

### 配置欢迎区和推荐问题

没有消息时，通过 `ui.welcome` 设置欢迎标题和描述，通过 `ui.prompts` 提供推荐问题，帮助用户开始对话。

| 配置                  | 用途                                                                      | 默认值                                        |
| --------------------- | ------------------------------------------------------------------------- | --------------------------------------------- |
| `welcome.title`       | 欢迎标题，类型为 `string`                                                 | `'TinyRobot AI 助手'`                         |
| `welcome.description` | 欢迎描述，类型为 `string`                                                 | `'您好，我是TinyRobot，您专属的 AI 智能专家'` |
| `prompts.items`       | 推荐问题数组；每项的 `label` 为必填显示文字，`description` 为可选补充说明 | `[]`，不显示推荐问题                          |
| `prompts.wrap`        | 是否允许推荐问题换行，类型为 `boolean`                                    | `false`                                       |

例如，设置项目助手的欢迎内容和两个推荐问题：

```ts
const ui: ChatUIOptions = {
  welcome: {
    title: '项目助手',
    description: '选择一个问题开始，或输入自己的问题。',
  },
  prompts: {
    wrap: true,
    items: [
      { label: '解释代码', description: '请解释这段代码的作用，并给出使用建议。' },
      { label: '撰写周报', description: '请帮我整理本周工作，生成一份简洁的周报。' },
    ],
  },
}
```

点击推荐问题会触发 `prompt-click`，不会自动填入或发送。下面使用 Sender 的模板扩展将问题填入输入框，用户可编辑后发送：

```ts
import { shallowRef } from 'vue'
import { TrSender, type TemplateItem } from '@opentiny/tiny-robot'
import type { ChatPromptClickPayload } from '@opentiny/tiny-robot-chat'

const inputTemplate = shallowRef<TemplateItem[]>([])
ui.sender = { extensions: [TrSender.template(inputTemplate)] }

function handlePromptClick({ item }: ChatPromptClickPayload) {
  inputTemplate.value = [{ type: 'text', content: item.description || item.label }]
}
```

```vue
<TrChat :runtime="runtime" :ui="ui" @prompt-click="handlePromptClick" />
```

将 `ui.welcome` 或 `ui.prompts` 设为 `false` 可隐藏对应区域。发送首条消息后不再显示欢迎内容；返回新会话可重新查看。

<demo
  vue="../../demos/chat/welcome-prompts.vue"
  :vueFiles="[
    '../../demos/chat/welcome-prompts.vue',
    '../../demos/chat/shared/createChatRuntime.ts',
    '../../demos/chat/shared/mockConversationStorage.ts',
    '../../demos/chat/shared/modelProviders.ts'
  ]"
  title="欢迎区和推荐问题"
  description="切换欢迎区和推荐问题的显示，点击问题填入输入框，编辑后发送并查看模拟回答。"
/>

更多展示配置见 [Welcome](../components/welcome#props) 和 [Prompts](../components/prompts#props)。

### 配置输入区

通过 `ui.sender` 调整输入框、配置提及和模板功能；通过输入区插槽添加自定义按钮，无需重新实现消息发送和取消。

#### 基础设置

以下默认值为 Chat 的输入区配置，与单独使用 Sender 时不同：

| 配置             | 用途和可选值                                              | 默认值                                                   |
| ---------------- | --------------------------------------------------------- | -------------------------------------------------------- |
| `placeholder`    | 输入框为空时的提示，类型为 `string`                       | 未发送时为 `'请输入你的问题...'`，发送中为 `'思考中...'` |
| `mode`           | `'single'` 单行、`'multiple'` 多行                        | `'multiple'`                                             |
| `maxLength`      | 最大输入字数，类型为 `number`；超出后保留内容，但无法提交 | `1000`                                                   |
| `showWordLimit`  | 是否显示字数统计，类型为 `boolean`                        | `true`                                                   |
| `clearable`      | 有内容时是否显示清空按钮，类型为 `boolean`                | `true`                                                   |
| `defaultActions` | 配置默认发送和清空按钮的提示等选项                        | 沿用内置按钮配置                                         |
| `extensions`     | 输入扩展数组，如提及、模板和联想                          | `[]`                                                     |

例如，限制为 300 字并修改按钮提示：

```ts
const ui: ChatUIOptions = {
  sender: {
    placeholder: '请输入问题，最多 300 字...',
    maxLength: 300,
    showWordLimit: true,
    defaultActions: {
      submit: { tooltip: '发送给项目助手' },
      clear: { tooltip: '清空输入内容' },
    },
  },
}
```

输入值、发送中状态和禁用状态由 Chat 管理，不在 `ui.sender` 中设置。需要禁止输入或提交时，见 [禁用输入与提交](./chat-runtime#禁用输入与提交)。

#### 提及与模板

`TrSender.mention()` 为输入框提供提及选择，默认输入 `@` 触发；`TrSender.template()` 用于填入包含可编辑字段的模板。将它们放入 `ui.sender.extensions` 即可在 `TrChat` 中使用，默认不启用这些扩展。

```ts
import { shallowRef } from 'vue'
import { TrSender, type MentionItem, type TemplateItem } from '@opentiny/tiny-robot'

const mentions: MentionItem[] = [
  { label: '产品组', value: 'product' },
  { label: '研发组', value: 'engineering' },
]
const currentTemplate = shallowRef<TemplateItem[]>([])

ui.sender = {
  ...ui.sender,
  extensions: [TrSender.mention(mentions), TrSender.template(currentTemplate)],
}

function fillReportTemplate() {
  currentTemplate.value = [
    { type: 'text', content: '请帮我写一份关于' },
    { type: 'block', content: '项目进展' },
    { type: 'text', content: '的报告。' },
  ]
}
```

提及项中的 `label` 是显示名称，`value` 是对应标识；模板中的 `'text'` 为普通文本，`'block'` 为可编辑字段。更新 `currentTemplate` 会替换输入框内容。

> 提及功能不会自动切换模型或助手。默认发送使用输入内容的纯文本；需要处理提及标识或模板字段时，见 [结构化提交数据](../components/sender#结构化数据) 和 [发送前检查](./chat-runtime#发送前检查)。

#### 自定义按钮

`sender-footer` 在多行输入框底部左侧添加按钮，与模型选择等操作同一区域；`sender-footer-right` 在底部右侧、默认操作按钮前添加内容。这些插槽默认没有自定义内容，使用时不会替换发送和取消按钮。

例如，通过按钮插入上面配置的报告模板：

```vue
<TrChat :runtime="runtime" :ui="ui">
  <template #sender-footer>
    <button type="button" @click="fillReportTemplate">写报告</button>
  </template>
</TrChat>
```

下面的演示将提及、模板和自定义按钮组合使用，还通过 `sender-header` 展示使用说明。点击“写报告”后可编辑文本块和选择读者；点击“常用问题”可填入预设问题。

<demo
  vue="../../demos/chat/sender-options.vue"
  :vueFiles="[
    '../../demos/chat/sender-options.vue',
    '../../demos/chat/shared/createChatRuntime.ts',
    '../../demos/chat/shared/mockConversationStorage.ts',
    '../../demos/chat/shared/modelProviders.ts'
  ]"
  title="输入扩展与自定义按钮"
  description="输入 @ 选择对象，使用报告模板和常用问题按钮填入内容，编辑后发送；点击“使用说明”查看操作提示。"
/>

更多配置见 [Mention](../components/sender#mention-配置)、[Template](../components/sender#template-配置) 和 [默认按钮配置](../components/sender#默认按钮配置)，完整插槽列表见 [插槽](#插槽)。

### 配置消息展示

通过 `ui.bubble.bubbleList.roleConfigs` 为用户消息（`user`）和 AI 回答（`assistant`）分别设置头像、对齐位置和气泡形状。

| 配置        | 用途和可选值                                                           | 默认值                                      |
| ----------- | ---------------------------------------------------------------------- | ------------------------------------------- |
| `avatar`    | 自定义头像，例如通过 Vue 的 `h()` 创建的节点                           | 用户和 AI 分别使用内置头像                  |
| `placement` | `'start'` 左侧、`'end'` 右侧                                           | `user` 为 `'end'`，`assistant` 为 `'start'` |
| `shape`     | `'corner'` 带角气泡、`'rounded'` 圆角气泡、`'none'` 不使用预设气泡形状 | `'corner'`                                  |

例如，给用户设置圆角气泡，给 AI 设置自定义头像：

```ts
import { h } from 'vue'

const ui: ChatUIOptions = {
  bubble: {
    bubbleList: {
      roleConfigs: {
        user: { placement: 'end', avatar: h('span', '我'), shape: 'rounded' },
        assistant: { placement: 'start', avatar: h('span', 'AI'), shape: 'none' },
      },
    },
  },
}
```

下面的演示进一步将 AI 气泡背景设为透明，通过“默认外观”和“自定义外观”比较效果。继续发送消息，新的消息会沿用当前配置。

<demo
  vue="../../demos/chat/bubble-options.vue"
  :vueFiles="[
    '../../demos/chat/bubble-options.vue',
    '../../demos/chat/shared/createChatRuntime.ts',
    '../../demos/chat/shared/mockConversationStorage.ts',
    '../../demos/chat/shared/modelProviders.ts'
  ]"
  title="按角色定制消息外观"
  description="切换默认和自定义外观，比较用户与 AI 消息的头像和气泡形状；预设回答包含 Markdown 内容。"
/>

更多配置见 [头像和位置](../components/bubble#头像和位置)、[气泡形状](../components/bubble#气泡形状) 和 [BubbleList 属性](../components/bubble#bubblelist)，错误提示见 [请求失败提示](#请求失败提示)。

### 管理历史会话

`TrChat` 默认根据 Runtime 的会话生成历史列表，支持切换、重命名和删除。需要分组展示时，通过 `historyData` 属性传入分组数据，无需替换默认列表。

`historyData` 支持会话数组或 `{ group, items }[]` 分组数组，没有默认值；未传入时使用 Runtime 会话列表。`group` 是分组标题，`items` 是该组的会话数组，每项的 `id` 应对应 Runtime 中已有的会话。

下面按会话中的 `metadata.group` 展示“置顶”“昨天”“30天内”，未设置分组的会话放入“30天内”。`metadata.group` 是本例约定的字段，不是内置日期或置顶配置：

```ts
import { computed } from 'vue'
import type { ChatHistoryData } from '@opentiny/tiny-robot-chat'

const groups = ['置顶', '昨天', '30天内']
const historyData = computed<ChatHistoryData>(() =>
  groups
    .map((group) => ({
      group,
      items: runtime.conversations.value.filter((item) => (item.metadata?.group ?? '30天内') === group),
    }))
    .filter(({ items }) => items.length > 0),
)
```

```vue
<TrChat class="chat-history" :runtime="runtime" :ui="ui" :history-data="historyData" />
```

列表会随会话新增、重命名或删除更新。`ui.history` 用于配置菜单等展示选项，设为 `false` 可隐藏历史列表；默认菜单包含重命名和删除。例如，只保留重命名菜单：

```ts
const ui: ChatUIOptions = {
  history: { menuItems: [{ id: 'rename', text: '重命名' }] },
}
```

选中颜色和圆角可通过 History 的 CSS 变量调整，在 Chat 或其父容器上设置即可：

```css
.chat-history {
  --tr-history-item-selected-bg: #e4edfd;
  --tr-history-item-selected-color: #3964fe;
  --tr-history-item-border-radius: 8px;
}
```

下面的演示展示自定义分组和选中样式，并保留默认会话操作。浏览器宽度低于 `960px` 时，先通过界面按钮展开会话列表。

> “置顶”和日期分组使用预设数据，不包含置顶操作或自动按日期归类。演示使用独立的本地存储保存示例会话，刷新后保留修改结果。

<demo
  vue="../../demos/chat/history-groups.vue"
  :vueFiles="[
    '../../demos/chat/history-groups.vue',
    '../../demos/chat/shared/createChatRuntime.ts',
    '../../demos/chat/shared/mockConversationStorage.ts',
    '../../demos/chat/shared/modelProviders.ts'
  ]"
  title="自定义历史会话分组"
  description="查看预设分组和选中样式，切换、重命名或删除会话；新建会话并发送消息后，查看列表更新。"
/>

完整展示配置见 [History 属性](../components/history#props) 和 [样式变量](../components/history#css-变量)，程序调用见 [会话管理](./chat-runtime#会话管理)。

### 插槽定制

本示例使用 `layout-header` 自定义页头、`bubble-content-footer` 添加消息反馈按钮、`composer-after` 添加输入框下方的提示。

<demo
  vue="../../demos/chat/slots-basic.vue"
  :vueFiles="['../../demos/chat/slots-basic.vue', '../../demos/chat/shared/modelProviders.ts']"
  title="插槽定制"
  description="通过自定义页头展开会话列表或返回新会话页面，点击 AI 回答下的“有帮助”按钮，并查看输入框外下方的提示文字。"
/>

完整插槽列表及参数见 [插槽](#插槽)。

### 右侧面板

需要在会话旁展示引用资料、预览结果等内容时，通过 `ui.layout.rightAside.panels` 配置面板列表，再用 `layout-right-aside-panel` 插槽提供内容。

`panels` 是面板配置对象数组，默认为空数组 `[]`，每项包含以下字段：

| 字段    | 用途                                                                  | 必填 |
| ------- | --------------------------------------------------------------------- | ---- |
| `id`    | 面板唯一标识，与 `layout-right-aside-panel` 插槽中的 `panelId` 对应。 | 是   |
| `title` | 面板标题，省略时显示 `ui.labels.rightAsideTitle`（默认 `'详情'`）。   | 否   |

`id` 不能重复，也不能使用内置保留标识 `mcp`。右侧栏默认宽度为 `320px`，初始关闭；没有自定义面板或 MCP 数据时不会显示。

```ts
const ui: ChatUIOptions = {
  layout: {
    rightAside: {
      panels: [{ id: 'preview', title: '结果预览' }],
    },
  },
}
```

仅需设置初始打开状态时，使用 `defaultRightAsideOpen` 属性（默认 `false`）；`defaultActiveRightAsidePanelId` 属性指定初始面板，未设置时选择第一个可用面板：

```vue
<TrChat :runtime="runtime" :ui="ui" :default-right-aside-open="true" default-active-right-aside-panel-id="preview">
  <template #layout-right-aside-panel="{ panelId }">
    <p v-if="panelId === 'preview'">在这里放置预览内容。</p>
  </template>
</TrChat>
```

通过 `v-model` 绑定 `rightAsideOpen` 和 `activeRightAsidePanelId`，分别控制右栏开闭和当前面板。未设置这两个属性时，由组件自行管理。

下面的演示提供预览和引用资料两个面板：

<demo
  vue="../../demos/chat/right-aside-panel.vue"
  :vueFiles="[
    '../../demos/chat/right-aside-panel.vue',
    '../../demos/chat/business-right-aside.vue',
    '../../demos/chat/release-preview.html',
    '../../demos/chat/shared/modelProviders.ts'
  ]"
  title="右侧资料与预览面板"
  description="点击消息操作，打开发布方案预览或引用资料。"
/>

完整配置及默认值见 [布局配置](#layout)，面板控制属性见 [TrChat 属性](#属性)。

### 浮动聊天窗口

`ui.layout.surface.mode` 用于设置聊天界面的显示方式，默认是 `'normal'`，显示在父容器中；设为 `'floating'` 时显示为浮动窗口。

通过 `ui.layout.surface.floatingOptions` 配置窗口的拖动、缩放和尺寸限制：

| 字段                     | 用途                          | 默认值或行为                      |
| ------------------------ | ----------------------------- | --------------------------------- |
| `draggable`              | 是否允许拖动窗口              | `true`                            |
| `resizable`              | 是否允许拖动边缘缩放窗口      | `false`                           |
| `minWidth` / `minHeight` | 最小宽度、最小高度，单位为 px | `320` / `240`，同时受视口尺寸限制 |
| `maxWidth` / `maxHeight` | 最大宽度、最大高度，单位为 px | 不超过当前视口宽度、高度          |

窗口默认支持拖动，下面开启缩放：

```ts
const ui: ChatUIOptions = {
  layout: {
    surface: {
      mode: 'floating',
      floatingOptions: { resizable: true },
    },
  },
}
```

需要自定义窗口的位置和尺寸时，设置 `floatingState` 属性：

```ts
import { shallowRef } from 'vue'
import type { LayoutFloatingState } from '@opentiny/tiny-robot-chat'

const floatingState = shallowRef<LayoutFloatingState>({
  placement: 'top-right',
  offsetX: 24,
  offsetY: 72,
  width: 520,
  height: 520,
})
```

```vue
<TrChat :runtime="runtime" :ui="ui" v-model:floating-state="floatingState" />
```

> 上例将窗口放在右上角，距右侧 `24px`、顶部 `72px`，宽高均为 `520px`。

未设置 `floatingState` 时，窗口默认居中，尺寸为 `420px × 560px`；实际尺寸不会超过浏览器可视区域。

传入 `floatingState` 时，需同步更新状态，建议使用 `v-model:floating-state`。

<demo
  vue="../../demos/chat/floating-layout.vue"
  :vueFiles="['../../demos/chat/floating-layout.vue']"
  title="浮动聊天窗口"
  description="打开聊天窗口，拖动或缩放后查看位置和尺寸变化。"
/>

完整字段及默认值见 [拖动与缩放配置](../components/layout#layout-floating-options)和[窗口位置与尺寸](../components/layout#layout-floating-state)。

### 窄屏与移动端

侧栏支持两种布局，通过 `ui.layout.leftAside.mode` 或 `ui.layout.rightAside.mode` 设置，默认是 `'dock'`：

- 桌面布局（`'dock'`）：侧栏与消息区并排显示。
- 移动端布局（`'drawer'`）：侧栏以抽屉形式覆盖消息区。

浏览器可视区域宽度低于 `960px` 时，组件会自动使用抽屉布局。

> 仅缩小父容器不会触发自动切换；需要在较窄容器中使用抽屉时，将侧栏的 `mode` 设为 `'drawer'`。

桌面布局下，将侧栏配置中的 `resizable` 设为 `true`，可拖动边缘调整宽度，默认不启用。通过 `minWidth`、`maxWidth` 设置调整范围，单位为 px；抽屉布局不支持调整宽度。例如：

```ts
const ui: ChatUIOptions = {
  layout: {
    leftAside: {
      defaultOpen: true,
      resizable: true,
      minWidth: 240,
      maxWidth: 420,
    },
  },
}
```

以下演示切换两种布局效果，不改变实际设备或浏览器宽度。桌面布局下，可拖动左侧栏右边缘调整宽度；右侧栏的设置方式相同。

> 浏览器宽度低于 `960px` 时，即使选择桌面布局，也会自动使用抽屉。

<demo
  vue="../../demos/chat/responsive-layout.vue"
  :vueFiles="['../../demos/chat/responsive-layout.vue']"
  title="桌面与移动端布局"
  description="切换布局，查看侧栏的显示和开闭效果，以及桌面布局下的宽度调整。"
/>

完整侧栏配置及默认值见 [布局配置](#layout)。

### 请求失败提示

使用 `TrChat` 接入模型服务后，请求失败时会在对应的 AI 消息下显示错误提示，默认不提供重试按钮。

#### 消息错误提示配置

通过 `ui.bubble.bubbleProvider.errorRenderer` 替换错误提示，传入 `null` 可关闭默认提示。`CustomErrorRenderer` 表示应用自行实现的错误展示组件。

```ts
const customErrorUI: ChatUIOptions = {
  bubble: {
    bubbleProvider: { errorRenderer: CustomErrorRenderer },
  },
}

const disabledErrorUI: ChatUIOptions = {
  bubble: {
    bubbleProvider: { errorRenderer: null },
  },
}
```

该配置只控制提示的显示，不会改变请求的失败状态。默认提示的样式变量为 `--tr-bubble-error-color`、`--tr-bubble-error-bg`、`--tr-bubble-error-border-radius` 和 `--tr-bubble-max-width`。单独使用 `Bubble` 或 `BubbleProvider` 时，错误提示默认关闭。

<demo
  vue="../../demos/chat/runtime-error.vue"
  :vueFiles="['../../demos/chat/runtime-error.vue']"
  title="请求失败提示"
  description="使用本地模拟请求，查看错误提示和正常回复。"
/>

操作失败通知见 [TrChat 事件](#事件)。

## 单独使用 TrChatUI

`TrChatUI` 只提供聊天界面，不包含模型请求和会话保存逻辑。需要接入自己的后端服务，并自行处理请求、会话和消息更新时，可单独使用 `TrChatUI`，通过 `data` 提供显示数据，监听事件处理用户操作。

需要配套的聊天功能时，推荐使用 `TrChat`。

> 前面的 `ui` 配置和插槽也适用于 `TrChatUI`。

### 数据与事件处理

通过 `data` 提供当前显示的会话、消息和发送状态，通过 `ui` 设置布局和各区域的展示方式。处理用户操作后，更新对应数据即可更新界面。

```ts
import { computed, shallowRef } from 'vue'
import type { ChatMessageItem, ChatUIData } from '@opentiny/tiny-robot-chat'

const inputValue = shallowRef('')
const messages = shallowRef<ChatMessageItem[]>([])
const sending = shallowRef(false)

const data = computed<ChatUIData>(() => ({
  conversation: { title: '应用助手' },
  bubble: { messages: messages.value },
  sender: { loading: sending.value },
}))
```

| 字段 | 用途 | 默认值 |
| --- | --- | --- |
| `conversation.title` | 设置页头标题 | 默认文案为“新对话” |
| `bubble.messages` | 提供消息列表 | `[]` |
| `sender.loading` | 显示发送中状态，并切换为取消操作 | `false` |

常见操作通过以下事件通知项目处理：

| 用户操作 | 事件 | 项目需要处理 |
| --- | --- | --- |
| 发送消息 | `submit` | 发起请求，更新消息和发送状态 |
| 取消发送 | `cancel` | 停止请求，恢复发送状态 |
| 新建会话 | `create-conversation` | 清空当前选择或创建会话，更新显示数据 |
| 切换会话 | `switch-conversation` | 更新选中会话、标题和消息 |
| 重命名会话 | `rename-conversation` | 保存新标题并更新列表 |
| 删除会话 | `history-action` | 判断 `action.id === 'delete'`，删除并更新数据 |

例如，监听 `submit` 和 `cancel` 处理发送与取消，通过 `v-model:input-value` 同步输入内容：

```vue
<TrChatUI
  :data="data"
  v-model:input-value="inputValue"
  @submit="handleSubmit"
  @cancel="handleCancel"
/>
```

`submit` 和 `cancel` 只通知项目处理操作，不会自动请求或停止服务。发送后是否清空输入、何时追加回答，由对应的事件处理方法决定。

输入区的清空按钮会清空输入；使用 `v-model` 时，会同步更新绑定值。清空输入不会删除消息或取消请求。

下面的演示在提交后追加用户消息并清空输入，等待期间显示取消操作。取消后保留用户消息，不再追加模拟回答；完成或取消后均可继续发送。

<demo
  vue="../../demos/chat/controlled-ui.vue"
  :vueFiles="['../../demos/chat/controlled-ui.vue']"
  title="处理发送与取消"
  description="使用本地模拟回答，展示消息更新、发送中状态和取消操作，不连接真实服务或保存会话。"
/>

完整数据字段见 [ChatUIData](#chatuidata)，属性和事件见 [TrChatUI API](#trchatui-api)。

### 受控与非受控

部分界面状态支持两种管理方式：受控时，由项目传入当前值并处理更新；非受控时，由组件自行维护，可通过默认值属性设置初始状态。

需要从外部修改或同步状态时，使用受控方式；只需设置初始状态时，可以使用非受控方式。这两种方式只针对界面状态，不代表组件会自动发送请求或保存会话。

以输入内容为例，受控方式通过 `v-model:input-value` 绑定当前内容，`inputValue` 可初始化为 `''`：

```vue
<TrChatUI v-model:input-value="inputValue" @submit="handleSubmit" />
```

非受控方式不传入 `inputValue`，由组件维护输入。可通过 `defaultInputValue` 设置初始内容，默认 `''`；后续修改该属性不会重置当前输入：

```vue
<TrChatUI defaultInputValue="请介绍一下 TinyRobot" @submit="handleSubmit" />
```

两种方式都能通过 `submit` 获取文本，但不会自动发送请求或清空输入。

> 输入管理方式应在初始化时确定，不要在使用过程中切换。

右栏和浮动窗口也支持这两种方式：

| 状态 | 受控方式 | 非受控方式 |
| --- | --- | --- |
| 右栏开闭 | `v-model:right-aside-open` | 使用 `defaultRightAsideOpen` 设置初始值，默认 `false` |
| 当前右栏面板 | `v-model:active-right-aside-panel-id` | 使用 `defaultActiveRightAsidePanelId`；未指定有效面板时选择第一个可用面板 |
| 浮动窗口位置和尺寸 | `v-model:floating-state` | 不传入当前值，由组件维护内置窗口状态 |

左栏通过 `ui.layout.leftAside.open` 设置当前开闭状态，并在 `left-aside-open-change` 中更新；不设置当前值时，可通过 `ui.layout.leftAside.defaultOpen` 设置初始状态，默认 `false`。

完整属性和事件见 [TrChatUI API](#trchatui-api)，相关布局配置见 [右侧面板](#右侧面板) 和 [浮动聊天窗口](#浮动聊天窗口)。

## API

### TrChat API

#### 属性

| 属性名                                | 说明                                       | 类型                                                                | 默认值         | 必填 |
| ------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------- | -------------- | ---- |
| `runtime`                             | 提供会话、输入区状态和操作方法。           | [`ChatRuntime`](./chat-runtime#状态与方法)                          | —              | 是   |
| `ui`                                  | 配置页面布局、文案和区域。                 | [`ChatUIOptions`](#界面配置)                                        | 默认界面配置   | 否   |
| `title`                               | 覆盖当前会话提供的页面标题。               | `string`                                                            | —              | 否   |
| `history-data`                        | 覆盖 Runtime 会话生成的历史列表或分组。    | [`ChatHistoryData`](#展示数据类型)                                  | —              | 否   |
| `floating-state`                      | 由应用管理的浮动窗口位置和尺寸。           | [`LayoutFloatingState`](../components/layout#layout-floating-state) | —              | 否   |
| `right-aside-open`                    | 由应用管理的右栏开闭状态。                 | `boolean`                                                           | —              | 否   |
| `default-right-aside-open`            | 组件管理右栏开闭时的初始值。               | `boolean`                                                           | `false`        | 否   |
| `active-right-aside-panel-id`         | 由应用管理的当前右栏面板，需处理更新事件。 | `ChatRightAsidePanelId`                                             | —              | 否   |
| `default-active-right-aside-panel-id` | 组件管理当前面板时的初始值。               | `ChatRightAsidePanelId`                                             | 第一个可用面板 | 否   |

#### 事件

`TrChat` 会直接处理提交、取消、会话切换、模型选择和 MCP 开关操作，调用 Runtime 对应方法；这些事件不会再次向外发出。

| 事件                                                                | 参数                                                                               | 触发时机                                                                |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `runtime-action-error`                                              | `ChatRuntimeActionErrorPayload`                                                    | Runtime 操作失败；send 错误详情仍从所属消息读取。                       |
| `history-action`                                                    | `ChatHistoryActionPayload`                                                         | 历史菜单操作；删除操作可调用 `preventDefault()` 阻止默认 Runtime 删除。 |
| `prompt-click`                                                      | `ChatPromptClickPayload`                                                           | 点击提示项。                                                            |
| `mcp-create-server`                                                 | `ChatMcpCreateServerPayload`                                                       | 请求创建 MCP 服务；Runtime 不处理创建表单。                             |
| `bubble-state-change`                                               | `ChatBubbleStateChangePayload`                                                     | 气泡内部状态变化。                                                      |
| `bubble-event`                                                      | `ChatBubbleEventPayload`                                                           | 气泡内容发出自定义事件。                                                |
| `left-aside-open-change` / `right-aside-open-change`                | `ChatAsideOpenChangePayload`                                                       | 侧栏状态变化。                                                          |
| `update:right-aside-open`                                           | `boolean`                                                                          | 通知应用更新右栏开闭状态。                                              |
| `update:active-right-aside-panel-id`                                | `ChatRightAsidePanelId \| undefined`                                               | 通知应用更新当前右栏面板。                                              |
| `update:floating-state`                                             | [`LayoutFloatingState`](../components/layout#layout-floating-state)                | 通知应用更新浮动窗口的位置和尺寸。                                      |
| `floating-drag-start` / `floating-drag` / `floating-drag-end`       | [`LayoutFloatingDragDetail`](../components/layout#layout-floating-drag-detail)     | 浮动窗口开始拖动、拖动中或拖动结束。                                    |
| `floating-resize-start` / `floating-resize` / `floating-resize-end` | [`LayoutFloatingResizeDetail`](../components/layout#layout-floating-resize-detail) | 浮动窗口开始缩放、缩放中或缩放结束。                                    |

#### 组件方法

| 方法                      | 签名                                             | 说明                           |
| ------------------------- | ------------------------------------------------ | ------------------------------ |
| `send`                    | `(payload: ChatSendPayload) => Promise<boolean>` | 通过 Runtime 发送消息。        |
| `openRightAside`          | `(panel?: ChatRightAsidePanelId) => void`        | 打开右栏，可同时指定面板。     |
| `closeRightAside`         | `() => void`                                     | 关闭右栏。                     |
| `toggleRightAside`        | `(panel?: ChatRightAsidePanelId) => void`        | 切换右栏，可同时指定面板。     |
| `activateRightAsidePanel` | `(panel: ChatRightAsidePanelId) => boolean`      | 激活存在的面板并返回是否成功。 |

### TrChatUI API

#### 属性

| 属性名                                | 说明                                     | 类型                                                                | 默认值         | 必填 |
| ------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------- | -------------- | ---- |
| `data`                                | 应用提供的显示数据；组件不会修改该对象。 | [`ChatUIData`](#chatuidata)                                         | 空展示数据     | 否   |
| `ui`                                  | 配置页面布局、文案和区域。               | [`ChatUIOptions`](#界面配置)                                        | 默认界面配置   | 否   |
| `input-value`                         | 应用管理的输入内容，需处理更新事件。     | `string`                                                            | —              | 否   |
| `default-input-value`                 | 组件管理输入时的初始内容。               | `string`                                                            | `''`           | 否   |
| `floating-state`                      | 由应用管理的浮动窗口位置和尺寸。         | [`LayoutFloatingState`](../components/layout#layout-floating-state) | —              | 否   |
| `right-aside-open`                    | 由应用管理的右栏开闭状态。               | `boolean`                                                           | —              | 否   |
| `default-right-aside-open`            | 组件管理右栏开闭时的初始值。             | `boolean`                                                           | `false`        | 否   |
| `active-right-aside-panel-id`         | 由应用管理的当前面板，需处理更新事件。   | `ChatRightAsidePanelId`                                             | —              | 否   |
| `default-active-right-aside-panel-id` | 组件管理当前面板时的初始值。             | `ChatRightAsidePanelId`                                             | 第一个可用面板 | 否   |

`input-value` 与 `default-input-value` 二选一，使用期间不切换输入管理方式。由应用管理左栏开闭时，通过 `ui.layout.leftAside.open` 设置状态，并在 `left-aside-open-change` 事件中更新该值。

#### 事件

点击“新会话”时，`TrChatUI` 只触发 `create-conversation`，由项目决定清空当前选择还是立即创建会话。`TrChat` 会返回新会话页面；使用默认发送流程时，在发送首条非空消息时创建会话。

> 配置自定义 `send` 时，不会自动创建会话，需由回调自行创建或选择会话，见 [自定义发送流程](./chat-runtime#自定义发送流程)。

以下事件需由项目自行处理：

| 事件                                                                | 参数                                                                               | 说明                                                                  |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `submit`                                                            | `ChatSendPayload`                                                                  | 发送请求并更新消息、请求状态和输入值。                                |
| `update:input-value`                                                | `string`                                                                           | 由应用管理输入时，更新输入内容。                                      |
| `cancel` / `clear`                                                  | 无                                                                                 | 中止请求或清空输入；组件不会修改外部请求。                            |
| `create-conversation`                                               | 无                                                                                 | 清空当前会话或创建新会话。                                            |
| `switch-conversation`                                               | `ChatSwitchConversationPayload`                                                    | 切换数据源并更新 `data.conversation.activeId`。                       |
| `rename-conversation`                                               | `ChatRenameConversationPayload`                                                    | 保存新标题并更新会话列表。                                            |
| `history-action`                                                    | `ChatHistoryActionPayload`                                                         | 处理历史菜单操作；`TrChatUI` 本身不会执行删除。                       |
| `prompt-click`                                                      | `ChatPromptClickPayload`                                                           | 决定填充输入、直接提交或执行其他操作。                                |
| `bubble-state-change` / `bubble-event`                              | 对应 payload                                                                       | 更新消息状态或处理自定义气泡事件。                                    |
| `model-select`                                                      | `ChatModelSelectPayload`                                                           | 更新 `data.model.selectedId`。                                        |
| `model-feature-change`                                              | `ChatModelFeatureChangePayload`                                                    | 更新能力开关；异步时可同步 `pendingFeatureIds`。                      |
| `model-reasoning-effort-change`                                     | `ChatModelReasoningEffortChangePayload`                                            | 更新思考强度。                                                        |
| `mcp-add-server` / `mcp-remove-server`                              | `ChatMcpAddServerPayload` / `ChatMcpRemoveServerPayload`                           | 更新 MCP 服务列表。                                                   |
| `mcp-create-server`                                                 | `ChatMcpCreateServerPayload`                                                       | 创建并接入自定义 MCP 服务。                                           |
| `mcp-server-enabled-change`                                         | `ChatMcpServerEnabledChangePayload`                                                | 更新 MCP 服务启用状态。                                               |
| `mcp-tool-enabled-change`                                           | `ChatMcpToolEnabledChangePayload`                                                  | 更新工具启用状态。                                                    |
| `left-aside-open-change` / `right-aside-open-change`                | `ChatAsideOpenChangePayload`                                                       | 由应用管理侧栏时更新开闭状态；`source` 区分用户操作和浏览器窗口变化。 |
| `update:right-aside-open`                                           | `boolean`                                                                          | 更新应用管理的右栏开闭状态。                                          |
| `update:active-right-aside-panel-id`                                | `ChatRightAsidePanelId \| undefined`                                               | 更新应用管理的当前面板。                                              |
| `update:floating-state`                                             | [`LayoutFloatingState`](../components/layout#layout-floating-state)                | 更新应用管理的浮动窗口位置和尺寸。                                    |
| `floating-drag-start` / `floating-drag` / `floating-drag-end`       | [`LayoutFloatingDragDetail`](../components/layout#layout-floating-drag-detail)     | 处理窗口开始拖动、拖动中或拖动结束。                                  |
| `floating-resize-start` / `floating-resize` / `floating-resize-end` | [`LayoutFloatingResizeDetail`](../components/layout#layout-floating-resize-detail) | 处理窗口开始缩放、缩放中或缩放结束。                                  |

#### 组件方法

| 方法                      | 签名                                        | 说明                           |
| ------------------------- | ------------------------------------------- | ------------------------------ |
| `openRightAside`          | `(panel?: ChatRightAsidePanelId) => void`   | 打开右栏，可同时指定面板。     |
| `closeRightAside`         | `() => void`                                | 关闭右栏。                     |
| `toggleRightAside`        | `(panel?: ChatRightAsidePanelId) => void`   | 切换右栏，可同时指定面板。     |
| `activateRightAsidePanel` | `(panel: ChatRightAsidePanelId) => boolean` | 激活存在的面板并返回是否成功。 |

#### ChatUIData

`ChatUIData` 是应用传给 `TrChatUI` 的显示数据，组件不会修改它。以下字段均为可选，对应区域见下表。

未配置的字段使用下表默认值。无需模型或 MCP 入口时，省略 `model` / `mcp`，或将 `ui.model` / `ui.mcp` 设为 `false`。

| 字段           | 类型                   | 对应区域                     | 默认行为                              |
| -------------- | ---------------------- | ---------------------------- | ------------------------------------- |
| `conversation` | `ChatConversationView` | 页头标题、会话列表和当前选中 | 空列表、无选中，标题为“新对话”。      |
| `bubble`       | `ChatBubbleView`       | 消息主区                     | `messages` 为空，进入空状态。         |
| `sender`       | `ChatSenderView`       | 输入区可用性与加载反馈       | 三个布尔状态均为 `false`。            |
| `model`        | `ChatModelView`        | 输入区模型选择器与能力开关   | 不显示模型选择器。                    |
| `mcp`          | `ChatMcpView`          | 输入区 MCP 入口与内置右栏    | 不显示 MCP 入口或面板。               |
| `request`      | `ChatRequestView`      | 自定义主区和空状态插槽参数   | `undefined`；默认界面不额外显示状态。 |

##### `conversation`

| 字段       | 类型                     | 默认值 | 说明                                                                |
| ---------- | ------------------------ | ------ | ------------------------------------------------------------------- |
| `items`    | `ChatConversationInfo[]` | `[]`   | 原始会话列表；未提供 `history` 时按当前数组顺序生成默认历史数据。   |
| `activeId` | `string \| null`         | `null` | 当前选中会话 ID；应用处理切换事件后更新。                           |
| `title`    | `string`                 | 新对话 | 页头标题；空字符串会原样显示。                                      |
| `history`  | `ChatHistoryData`        | —      | 应用提供的排序或分组结果；提供后优先于根据 `items` 生成的默认历史。 |

`ChatConversationInfo`、`ChatMessageItem` 及消息内容结构见 [Chat 配置与操作：会话、消息与发送](./chat-runtime#会话、消息与发送)。

##### `bubble` 与 `sender`

| 字段                    | 类型                | 默认值  | 说明                                     |
| ----------------------- | ------------------- | ------- | ---------------------------------------- |
| `bubble.messages`       | `ChatMessageItem[]` | `[]`    | 消息列表；组件不会追加、删除或保存消息。 |
| `sender.loading`        | `boolean`           | `false` | 显示发送中反馈并切换为取消操作。         |
| `sender.disabled`       | `boolean`           | `false` | 禁用整个输入区。                         |
| `sender.submitDisabled` | `boolean`           | `false` | 仅禁止提交；输入仍可编辑。               |

单独使用 `TrChatUI` 时，AI 消息的 `state.error` 用于显示错误提示，需要由应用写入。

##### `model`

| 字段                 | 类型                                               | 说明                                           |
| -------------------- | -------------------------------------------------- | ---------------------------------------------- |
| `options`            | `ChatModelOptionView[]`                            | 可选模型列表；为空时显示没有可选模型的提示。   |
| `selectedId`         | `string \| null`                                   | 当前模型；选择后应用通过 `model-select` 写回。 |
| `features`           | `Partial<Record<'thinking' \| 'search', boolean>>` | 当前能力开关。                                 |
| `reasoning`          | `{ enabled: boolean; effort?: string }`            | 深度思考开关及当前思考强度。                   |
| `selecting`          | `boolean`                                          | 模型切换中的整体等待状态。                     |
| `reasoningSelecting` | `boolean`                                          | 思考强度切换中的等待状态。                     |
| `pendingFeatureIds`  | `('thinking' \| 'search')[]`                       | 正在切换的能力，用于逐项等待反馈。             |

`ChatModelOptionView` 至少包含 `id` 和 `label`，还可提供 `description`、`icon`、`disabled`、`group`、思考强度选项（`efforts`）、默认强度（`defaultEffort`）、支持的功能和 `metadata`。选择器弹出面板所在的容器由 `ui.model.appendTo` 配置，其他行为见 [ModelSelector](../components/model-selector)。

##### `mcp`

| 字段      | 类型                  | 说明                                                                 |
| --------- | --------------------- | -------------------------------------------------------------------- |
| `servers` | `ChatMcpServerView[]` | MCP 服务的安装、启用、加载和错误状态；应用处理对应事件后写回。       |
| `tools`   | `ChatMcpToolMap`      | 以 MCP 服务 ID 为键的工具数组；工具包含 `id`、`name`、`enabled` 等。 |

`ChatMcpServerView` 要求 `id`、`name`、`installed` 和 `enabled`；可选 `description`、`icon`、`category`、`loading`、`error` 与 `metadata`。`ChatMcpToolView` 要求 `id`、`name` 和 `enabled`，可选 `description` 与 `loading`。只有 `ui.mcp` 与 `ui.layout.rightAside` 都未设为 `false` 时，MCP 入口和内置面板才可见。

内置右栏使用 [ExtensionManager](../components/extension-manager) 将 MCP 服务按“已安装”和“可安装”分区；点击已安装项名称进入 [MCP 详情](../components/mcp-extension)切换工具，点击“自定义添加”进入 MCP 表单。表单验证通过后，`mcp-create-server` 发出 `{ config, source }`；`config` 是整理后的单个 MCP 服务连接配置，`source` 为 `'form'` 或 `'code'`。Chat 不保存自定义 MCP 服务，应用收到事件后负责保存并更新 `mcp.servers`。服务的 `loading` 状态会禁用其列表操作，工具的 `loading` 状态会禁用对应开关。

##### `request`

| 字段              | 类型                                                                        | 必填 | 说明                   |
| ----------------- | --------------------------------------------------------------------------- | ---- | ---------------------- |
| `state`           | `'idle' \| 'processing' \| 'completed' \| 'paused' \| 'aborted' \| 'error'` | 是   | 请求状态。             |
| `processingState` | `'requesting' \| 'completing' \| string`                                    | 否   | 应用定义的处理中阶段。 |

`request` 会传给 `layout-main` 和 `layout-empty-state`。默认界面的发送中反馈读取 `sender.loading`，消息错误读取 `message.state.error`；只更新 `request` 不会自动渲染这些反馈。

### 界面配置

`TrChat` 和 `TrChatUI` 都通过 `ui` 接收 `ChatUIOptions`，配置布局、文案和各区域的显示方式。

未配置时使用默认界面。支持 `false` 的区域可通过它隐藏，其他选项见下表。

| 字段      | 类型                          | 配置说明                                                                  | `false` 的作用                            |
| --------- | ----------------------------- | ------------------------------------------------------------------------- | ----------------------------------------- |
| `layout`  | `ChatLayoutOptions`           | 未配置的布局字段使用默认值；窗口、输入区和左右侧栏可分别配置。            | 不支持；使用 `leftAside` / `rightAside`。 |
| `brand`   | `ChatBrandOptions`            | 提供的选项覆盖对应的默认名称或图标，默认名称为 `TinyRobot`。              | 不支持。                                  |
| `labels`  | `Partial<ChatLabels>`         | 按字段覆盖内置中文文案；也会更新默认欢迎文案和历史菜单文案。              | 不支持。                                  |
| `header`  | `false`                       | 省略时显示默认 Header。                                                   | 移除 Header。                             |
| `history` | `false \| ChatHistoryOptions` | 与默认 History 选项合并；`menuItems` 整体替换默认重命名、删除菜单。       | 隐藏历史列表，左栏品牌和操作仍在。        |
| `welcome` | `false \| ChatWelcomeOptions` | 与默认欢迎区配置合并；未提供标题和描述时使用 `labels` 中的文案。          | 空会话不显示欢迎区。                      |
| `prompts` | `false \| ChatPromptsOptions` | 与默认 Prompts 选项合并；`items` 整体替换，默认 `[]`。                    | 不显示提示项。                            |
| `bubble`  | `ChatBubbleOptions`           | 合并气泡渲染和列表配置；`autoScroll` 默认 `true`，`system` 消息默认隐藏。 | 不支持。                                  |
| `sender`  | `false \| ChatSenderOptions`  | 提供的选项覆盖对应的默认输入区选项。                                      | 移除输入区及其插槽。                      |
| `model`   | `false \| ChatModelOptions`   | 默认 `{}`；只有 `data.model` 存在时显示。                                 | 即使存在模型数据也隐藏选择器。            |
| `mcp`     | `false \| ChatMcpOptions`     | 默认 `{}`；当前没有额外配置字段。                                         | 即使存在 MCP 数据也隐藏入口和面板。       |

#### `layout`

| 字段                        | 类型                             | 默认值                   | 说明                                                                  |
| --------------------------- | -------------------------------- | ------------------------ | --------------------------------------------------------------------- |
| `surface.mode`              | `'normal' \| 'floating'`         | `'normal'`               | 页面或浮动窗口；浮动时读取 `floatingOptions` 与 `floating-state`。    |
| `emptyState`                | `'start' \| 'center'`            | `'start'`                | 空状态在主区起始位置或居中。                                          |
| `composer.welcome`          | `'footer' \| 'center'`           | `'footer'`               | 空会话时输入区位于页面底部或欢迎区中央。                              |
| `contentMaxWidth`           | `string \| number`               | `980`                    | 消息、欢迎区和输入区的最大内容宽度。                                  |
| `panelPadding` / `panelGap` | `string \| number`               | `12` / `12`              | 内容区内边距与区域间距。                                              |
| `leftAside`                 | `false \| ChatAsideOptions`      | Dock，`300` / `56`，关闭 | 左栏；`open` 由应用管理，`defaultOpen` 仅设置组件管理开闭时的初始值。 |
| `rightAside`                | `false \| ChatRightAsideOptions` | Dock，宽 `320`，不可缩放 | 右栏；只有注册应用面板或存在可见 MCP 数据时才渲染。                   |

`leftAside` 和 `rightAside` 的配置字段如下，尺寸字段的单位均为 px：

| 字段             | 类型或可选值                   | 默认值或未配置行为                                     | 用途                                                               |
| ---------------- | ------------------------------ | ------------------------------------------------------ | ------------------------------------------------------------------ |
| `mode`           | `'dock' \| 'drawer'`           | `'dock'`；浏览器视口低于 `960px` 时自动使用 `'drawer'` | 侧栏与消息区并排，或以抽屉覆盖消息区                               |
| `width`          | `number`                       | 左栏 `300`；右栏 `320`                                 | 展开宽度                                                           |
| `collapsedWidth` | `number`                       | 左栏 `56`；右栏 `0`                                    | 收起宽度；移动端使用 `0`                                           |
| `resizable`      | `boolean`                      | `false`                                                | 允许拖动调整展开宽度，仅桌面端并排模式生效                         |
| `minWidth`       | `number`                       | 左栏 `200`；右栏 `240`                                 | 最小展开宽度                                                       |
| `maxWidth`       | `number`                       | 左栏 `560`；右栏 `640`                                 | 最大展开宽度                                                       |
| `open`           | `boolean`                      | 未设置时由组件管理                                     | 仅左栏；由项目控制开闭时，需处理 `left-aside-open-change` 并更新值 |
| `defaultOpen`    | `boolean`                      | `false`                                                | 仅左栏；由组件管理开闭时的初始值                                   |
| `showClose`      | `boolean`                      | `true`                                                 | 仅右栏；是否显示关闭按钮                                           |
| `panels`         | `ChatRightAsidePanelOptions[]` | `[]`                                                   | 仅右栏；每项必填 `id`，可选 `title`                                |

右栏开闭和当前面板通过组件属性设置，见 [TrChat 属性](#属性)。浮动窗口的配置结构、尺寸限制和状态绑定见 [浮动聊天窗口](#浮动聊天窗口)。

`panels` 需要配合 `layout-right-aside` 或 `layout-right-aside-panel` 插槽提供内容；面板 ID 不能重复，也不能使用内置保留 ID `mcp`。`layout-right-aside-title` 和 `layout-right-aside-panel` 只用于应用添加的面板，不替换 MCP 面板。

#### 各区域配置

| 配置项    | 说明                                                                                                             | 相关组件                                      |
| --------- | ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| `brand`   | `name?: string`、`logo?: unknown`。                                                                              | —                                             |
| `labels`  | 会话创建/重命名/删除、侧栏展开/收起、输入占位、模型、MCP、Welcome、右栏和滚动到底部等文案。                      | —                                             |
| `history` | 默认菜单为重命名和删除；Chat 固定管理 `data`、`selected` 与事件。                                                | [History](../components/history)              |
| `welcome` | 默认标题与描述来自 `labels.welcomeTitle`、`labels.welcomeDescription`。                                          | [Welcome](../components/welcome)              |
| `prompts` | `items?: PromptProps[]`，其余展示选项继承 Prompts。                                                              | [Prompts](../components/prompts)              |
| `bubble`  | `autoScroll`、`bubbleProvider`、`bubbleList`；消息错误提示配置见[消息错误提示配置](#消息错误提示配置)。          | [Bubble](../components/bubble)                |
| `sender`  | 默认 `mode: 'multiple'`、`clearable: true`、`maxLength: 1000`、`showWordLimit: true`；值和禁用状态由 Chat 管理。 | [Sender](../components/sender)                |
| `model`   | 当前字段为 `appendTo?: ModelSelectorProps['appendTo']`。                                                         | [ModelSelector](../components/model-selector) |
| `mcp`     | `Record<string, never>`，当前没有配置字段。                                                                      | —                                             |

`ChatLabels` 的字段为 `newConversationTitle`、`createConversation`、`renameConversation`、`deleteConversation`、`expandConversationList`、`collapseConversationList`、`composerPlaceholder`、`composerLoadingPlaceholder`、`selectModel`、`searchModel`、`modelEmptyText`、`mcp`、`mcpInstallServer`、`mcpRemoveServer`、`thinkingFeature`、`searchFeature`、`welcomeTitle`、`welcomeDescription`、`rightAsideTitle`、`openRightAside`、`closeRightAside` 和 `scrollToBottom`，字段值均为 `string`。

### 插槽

以下插槽适用于 `TrChat` 和 `TrChatUI`。插槽参数中的发送、会话、模型和 MCP 操作，在 `TrChat` 中调用当前 Runtime；在 `TrChatUI` 中触发事件，需要项目处理事件并更新数据。

| 插槽                                                                               | 插槽参数                           | 说明                                                                                        |
| ---------------------------------------------------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------- |
| `layout-header`                                                                    | `ChatHeaderSlotProps`              | 替换页头。                                                                                  |
| `layout-left-aside`                                                                | `ChatLeftAsideSlotProps`           | 替换左侧展开面板。                                                                          |
| `layout-left-aside-brand` / `layout-left-aside-actions` / `layout-left-aside-rail` | `ChatLeftAsideSlotProps`           | 分别替换左栏品牌、操作和收起时的操作区域。                                                  |
| `layout-left-aside-footer`                                                         | `ChatLeftAsideSlotProps`           | 在左栏底部添加内容。                                                                        |
| `layout-left-aside-content`                                                        | `ChatLeftAsideContentSlotProps`    | 替换左栏内容区，包括默认会话列表。                                                          |
| `layout-left-aside-history-item-prefix`                                            | `ChatHistoryItemPrefixSlotProps`   | 在历史项前添加内容。                                                                        |
| `layout-right-aside`                                                               | `ChatRightAsidePanelSlotProps`     | 替换整个右栏及其面板。                                                                      |
| `layout-right-aside-title`                                                         | `ChatRightAsideTitleSlotProps`     | 替换应用添加的面板标题。                                                                    |
| `layout-right-aside-panel`                                                         | `ChatRightAsidePanelSlotProps`     | 提供应用添加的面板内容。                                                                    |
| `layout-main`                                                                      | `ChatMainSlotProps`                | 替换消息区和空状态内容，保留外层滚动区域；优先于 `layout-empty-state`。                     |
| `layout-empty-state`                                                               | `ChatEmptyStateSlotProps`          | 替换没有消息时的内容；需要显示默认输入区时，调用 `renderComposer()`。                       |
| `layout-footer`                                                                    | `ChatSenderSlotProps`              | 替换默认输入框，需自行连接输入和提交操作；保留 `composer-before` 和 `composer-after`。      |
| `composer-before`                                                                  | `ChatSenderSlotProps`              | 在输入框外上方添加内容，不替换输入框；随输入区显示，`ui.sender: false` 时隐藏。             |
| `composer-after`                                                                   | `ChatSenderSlotProps`              | 在输入框外下方添加提示、链接等内容，不替换输入框；随输入区显示，`ui.sender: false` 时隐藏。 |
| `sender-header`                                                                    | 无                                 | 在默认输入框内部上方添加内容。                                                              |
| `sender-footer`                                                                    | 无                                 | 在默认多行输入框内部底部左侧添加内容，与模型和工具操作同一区域。                            |
| `sender-footer-right`                                                              | 无                                 | 在默认多行输入框内部底部右侧、默认操作按钮前添加内容。                                      |
| `header-notice` / `welcome-footer` / `prompts-footer`                              | 无                                 | 扩展对应区域。                                                                              |
| `bubble-prefix` / `bubble-suffix` / `bubble-after`                                 | `ChatBubbleSlotProps`              | 在消息周围添加内容。                                                                        |
| `bubble-content-footer`                                                            | `ChatBubbleContentFooterSlotProps` | 在消息内容下方添加内容。                                                                    |

### 类型索引

#### 组件类型

| 类型                           | 类别        | 说明                                              |
| ------------------------------ | ----------- | ------------------------------------------------- |
| `ChatUIProps`                  | `interface` | `TrChatUI` 的属性类型，属性名采用小驼峰写法。     |
| `ChatUIEmits`                  | `interface` | `TrChatUI` 的事件及参数类型。 |
| `ChatUISlots`                  | `interface` | `TrChat` 和 `TrChatUI` 的插槽及参数类型。 |
| `ChatUIData`                   | `interface` | 显示数据；字段行为见 [ChatUIData](#chatuidata)。  |
| `ChatUIOptions`                | `interface` | 界面配置；字段行为见 [ChatUIOptions](#界面配置)。 |
| `ChatCssSize`                  | `type`      | `string \| number`。                              |
| `ChatWelcomeComposerPlacement` | `type`      | `'footer' \| 'center'`。                          |
| `ChatRightAsidePanelId`        | `type`      | `string`。                                        |
| `ChatRightAsidePanelContext`   | `interface` | 当前 `panelId` 与可选的面板配置。                 |
| `ChatBuiltInModelFeature`      | `type`      | `'thinking' \| 'search'`。                        |
| `ChatRequestState`             | `type`      | 请求状态类型。                                    |
| `ChatProcessingState`          | `type`      | `'requesting' \| 'completing' \| string`。        |

会话、消息和操作相关类型见 [Chat 配置与操作 API](./chat-runtime#api)。

#### 展示数据类型

| 类型                   | 说明                                                                      |
| ---------------------- | ------------------------------------------------------------------------- |
| `ChatConversationView` | 会话列表、当前 ID、标题和可选历史分组。                                   |
| `ChatHistoryData`      | `ChatConversationInfo[] \| ChatHistoryGroup[]`。                          |
| `ChatHistoryGroup`     | `group: string \| symbol` 与 `items`。                                    |
| `ChatBubbleView`       | 消息列表容器。                                                            |
| `ChatSenderView`       | 输入区 loading、disabled 与 submitDisabled 状态。                         |
| `ChatRequestView`      | 请求 `state` 与可选 `processingState`。                                   |
| `ChatModelView`        | 模型列表、选中值、功能开关、思考强度和加载状态。                          |
| `ChatModelOptionView`  | 单个模型的名称、支持的功能、思考强度与附加信息。                          |
| `ChatMcpView`          | MCP 服务列表与工具映射。                                                  |
| `ChatMcpServerView`    | 单个 MCP 服务的安装、启用、加载和错误状态。                               |
| `ChatMcpToolView`      | 单个工具的名称、启用和加载状态。                                          |
| `ChatMcpToolMap`       | `Partial<Record<string, readonly ChatMcpToolView[]>>`，键为 MCP 服务 ID。 |

#### 界面配置类型

| 类型                         | 说明                                                                        |
| ---------------------------- | --------------------------------------------------------------------------- |
| `ChatLayoutOptions`          | 页面显示方式、空状态、内容宽度、间距和两侧栏。                              |
| `ChatSurfaceOptions`         | 普通页面或浮动窗口配置。                                                    |
| `ChatComposerLayoutOptions`  | 欢迎区中输入区的位置。                                                      |
| `ChatBrandOptions`           | 品牌名称与图标。                                                            |
| `ChatLabels`                 | Chat 所有内置中文文案字段。                                                 |
| `ChatAsideOptions`           | 左栏显示方式、宽度、拖动调整与开闭状态。                                    |
| `ChatRightAsideOptions`      | 右栏模式、宽度、缩放与面板注册。                                            |
| `ChatRightAsidePanelOptions` | `id` 与可选 `title`。                                                       |
| `ChatHistoryOptions`         | 支持 [History](../components/history) 的配置，不支持 `data`、`selected` 和 `onItemAction`。 |
| `ChatBubbleOptions`          | 气泡渲染、列表和自动滚动配置。                                              |
| `ChatBubbleListOptions`      | 支持 [BubbleList](../components/bubble) 的配置，不支持 `messages` 和 `autoScroll`。 |
| `ChatWelcomeOptions`         | 支持 [Welcome](../components/welcome) 的配置，所有字段均可选。 |
| `ChatPromptsOptions`         | 支持 [Prompts](../components/prompts) 的配置，`items?: PromptProps[]` 用于设置推荐问题。 |
| `ChatSenderOptions`          | 支持 [Sender](../components/sender) 的配置，不支持 `modelValue`、`defaultValue`、`loading` 和 `disabled`；`defaultActions` 使用 `ChatSenderDefaultActions`。 |
| `ChatSenderDefaultActions`   | 输入区默认按钮配置，支持 `DefaultActions` 中除 `submit.disabled` 外的配置；提交禁用状态通过 `data.sender.submitDisabled` 设置。 |
| `ChatModelOptions`           | 模型选择器弹出面板所在容器的配置。                                          |
| `ChatMcpOptions`             | 当前为空对象配置。                                                          |

#### 插槽参数

| 类型                               | 字段                                                                                                                                                                                                        |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ChatHeaderSlotProps`              | `title`；`isEmpty`；`conversation`；`createConversation()`；`isLeftAsideOpen`；`openLeftAside()`；`closeLeftAside()`；`toggleLeftAside()`；`openRightAside(panel?)`；`closeRightAside()`                    |
| `ChatLeftAsideSlotProps`           | `conversation`；`isOpen`；`isDock`；`createConversation()`；`switchConversation(id)`；`renameConversation(id, title)`；`deleteConversation(id)`；`openLeftAside()`；`closeLeftAside()`；`toggleLeftAside()` |
| `ChatLeftAsideContentSlotProps`    | 包含 `ChatLeftAsideSlotProps` 的全部参数，另有 `history?: ChatHistoryData`。 |
| `ChatHistoryItemPrefixSlotProps`   | `item: ChatConversationInfo`                                                                                                                                                                                |
| `ChatRightAsidePanelSlotProps`     | `panelId?`；`panel?`；`panels`；右栏打开、关闭、切换和激活方法；`isRightAsideOpen`                                                                                                                          |
| `ChatRightAsideTitleSlotProps`     | `panelId?`；`panel?`                                                                                                                                                                                        |
| `ChatSenderSlotProps`              | `value`；`loading`；`disabled`；`submitDisabled`；输入更新、提交、取消和清空方法                                                                                                                            |
| `ChatMainSlotProps`                | `messages`；`request?`；`conversation`                                                                                                                                                                      |
| `ChatEmptyStateSlotProps`          | `messages`；`request?`；`conversation`；`isEmpty: true`；`renderComposer()` |
| `ChatBubbleSlotProps`              | `messages`；`role?`；`messageIndexes`                                                                                                                                                                       |
| `ChatBubbleContentFooterSlotProps` | `messages`；`role?`；`messageIndexes`；`contentIndex?: number` |

#### 事件参数

| 类型                                                     | 字段                                                                                                    |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `ChatSendPayload`                                        | `text: string`；`structuredData?: ChatStructuredData`                                                   |
| `ChatStructuredData`                                     | `ChatStructuredDataItem[]`                                                                              |
| `ChatStructuredDataItem`                                 | `type: string` 用于标识数据种类；其他字段按该种类提供，字段值类型为 `unknown`。 |
| `ChatHistoryActionPayload`                               | `action: HistoryMenuItem`；`conversation: ChatConversationInfo`；`defaultPrevented`；`preventDefault()` |
| `ChatSwitchConversationPayload`                          | `conversationId: string`                                                                                |
| `ChatRenameConversationPayload`                          | `conversationId: string`；`title: string`                                                               |
| `ChatPromptClickPayload`                                 | `event: MouseEvent`；`item: PromptProps`                                                                |
| `ChatModelSelectPayload`                                 | `modelId: string \| null`                                                                               |
| `ChatModelFeatureChangePayload`                          | `featureId: 'thinking' \| 'search'`；`enabled: boolean`                                                 |
| `ChatModelReasoningEffortChangePayload`                  | `effort: string \| null`                                                                                |
| `ChatMcpAddServerPayload` / `ChatMcpRemoveServerPayload` | `serverId: string`                                                                                      |
| `ChatMcpCreateServerPayload`                             | `config: McpExtensionFormValue`；`source: McpExtensionFormMode`                                         |
| `ChatMcpServerEnabledChangePayload`                      | `serverId: string`；`enabled: boolean`                                                                  |
| `ChatMcpToolEnabledChangePayload`                        | `serverId: string`；`toolId: string`；`enabled: boolean`                                                |
| `ChatAsideOpenChangePayload`                             | `open: boolean`；`source: 'user' \| 'viewport'`                                                         |
| `ChatBubbleStateChangePayload`                           | `key`；`value`；`messageIndex`；`contentIndex`                                                          |
| `ChatBubbleEventPayload`                                 | `name`；`payload?`；`messageIndex`；`contentIndex`                                                      |

`LayoutFloatingState`、`LayoutFloatingDragDetail`、`LayoutFloatingResizeDetail`、`HistoryMenuItem`、`PromptProps`、`BubbleMessage`、`ModelSelectorReasoningEffortOption`、`McpExtensionFormValue` 和 `McpExtensionFormMode` 来自 `@opentiny/tiny-robot`。气泡状态、事件和渲染器见 [Bubble](../components/bubble)。

## 常见问题

### 页面没有高度或消息区不滚动

为 Chat 的父容器设置明确高度，例如快速开始中的 `height: 600px`。使用百分比高度时，祖先容器也需要有明确高度；使用 flex 布局时，检查消息区所在的子项是否允许收缩（如设置 `min-height: 0`）。
