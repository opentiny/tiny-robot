# @opentiny/tiny-robot-chat

`@opentiny/tiny-robot-chat` 是 TinyRobot 提供的高级聊天 UI 包，基于 `@opentiny/tiny-robot`（基础组件库）和 `@opentiny/tiny-robot-kit`（数据层工具包）构建。
它提供开箱即用的完整聊天页面，也支持逐步深入的白盒定制。

## 安装

```bash
pnpm add @opentiny/tiny-robot-chat
```

需要同时安装 peer dependencies：

```bash
pnpm add @opentiny/tiny-robot @opentiny/tiny-robot-kit vue markstream-vue
```

## 基本用法

### 引入样式

```ts
import '@opentiny/tiny-robot-chat/style'
```

### 开箱即用（TrChat）

传入一个 `TrChatConfig` 配置对象，即可渲染完整聊天页面：

```vue
<template>
  <TrChat :config="chatConfig" />
</template>

<script setup lang="ts">
import { TrChat, type TrChatConfig } from '@opentiny/tiny-robot-chat'

const chatConfig: TrChatConfig = {
  request: {
    providers: {
      openai: {
        type: 'openai-compatible',
        endpoint: '/api/chat/completions',
      },
    },
    models: [{ id: 'gpt-4o-mini', label: 'GPT-4o Mini', providerId: 'openai' }],
    defaultModelId: 'gpt-4o-mini',
  },
  ui: {
    brand: { title: '我的助手' },
    welcome: { title: '你好！有什么可以帮你的？' },
  },
}
</script>
```

## 三层入口

包提供三个官方入口层级，按定制深度递进：

### 1. TrChat — 黑盒入口

适合快速接入，传入 `TrChatConfig` 即可。

```vue
<TrChat :config="config" />
```

### 2. TrChat.Root + TrChat.Page — 白盒页面

适合需要自己创建 runtime 但保留官方页面组合的场景。

```vue
<TrChat.Root :runtime="runtime" :ui="ui">
  <TrChat.Page />
</TrChat.Root>
```

使用 `createRuntimeFromConfig(config)` 从配置创建 runtime：

```ts
import { createRuntimeFromConfig } from '@opentiny/tiny-robot-chat'

const { runtime, ui, dispose } = createRuntimeFromConfig(config)
```

### 3. TrChat.Root + primitives — 细粒度组合

适合需要完全控制页面结构的场景，使用公开的 primitive 组件自由拼装。

```vue
<TrChat.Root :runtime="runtime" :ui="ui">
  <TrChat.Layout>
    <TrChat.Header title="我的助手" />
    <TrChat.MessageList />
    <TrChat.Footer>
      <TrChat.Attachments />
      <TrChat.Sender />
    </TrChat.Footer>
  </TrChat.Layout>
</TrChat.Root>
```

### 高级：TrChat.Provider — 自定义 transport

适合需要使用包的 UI 和聊天编排能力，但自带 transport / 数据层的团队。

```vue
<TrChat.Provider :transport-adapter="myAdapter">
  <TrChat.Layout>
    <TrChat.Header />
    <TrChat.MessageList />
    <TrChat.Footer>
      <TrChat.Sender />
    </TrChat.Footer>
  </TrChat.Layout>
</TrChat.Provider>
```

## 配置域

`TrChatConfig` 按功能域组织：

| 配置域 | 职责 |
| --- | --- |
| `request` | 模型列表、默认模型、transport 配置 |
| `conversation` | 初始消息、持久化策略 |
| `ui` | 品牌、欢迎区、外观、内容布局、i18n 文案 |
| `sender` | 输入框占位符、模式、字数限制、语音 |
| `attachments` | 附件上传、列表配置 |
| `messages` | 消息操作、feedback、渲染器、transform |
| `history` | 历史记录启用、默认展开 |
| `workspace` | 工作区视图、左右区域配置 |
| `lifecycle` | `beforeSend` / `afterReceive` / `error` 钩子 |

## 公开组件

| 组件 | 说明 |
| --- | --- |
| `TrChat` | 黑盒入口（含 `.Root` / `.Page` / `.Provider` 等子组件） |
| `TrChat.Layout` | 聊天布局容器 |
| `TrChat.WorkspaceLayout` | 工作区布局（含侧边栏） |
| `TrChat.Header` | 聊天头部 |
| `TrChat.Welcome` | 欢迎区 |
| `TrChat.MessageList` | 消息列表 |
| `TrChat.Footer` | 底部区域 |
| `TrChat.Sender` | 输入框 |
| `TrChat.Attachments` | 附件区 |
| `TrChat.History` | 历史记录 |
| `TrChatFeedback` | 消息反馈（独立导出） |
| `TrMcpTrigger` | MCP 触发器（独立导出） |

## 验证命令

```bash
# 类型检查
pnpm -F @opentiny/tiny-robot-chat type-check

# 构建
pnpm -F @opentiny/tiny-robot-chat build
```

## 目录结构

```
src/
  entry/              # 入口组件（TrChat、TrChatRoot、TrChatPage、TrChatProvider）
  components/         # UI 组件
    page-regions/     # 默认页面区域（Header/Body/Footer Region、ChatPageContent）
    workspace/        # 工作区布局（WorkspaceShell、LeftSheet、RightSheet 等）
    attachments/      # 附件
    feedback/         # 消息反馈
    history/          # 历史记录
    mcp/              # MCP 触发器和面板
    model-selector/   # 模型选择器
    renderers/        # 消息渲染器（Error、Edit、ToolCalls、Markdown 等）
    shared/           # 共享组件（ConditionalThemeProvider）
  runtime/
    config/           # createRuntimeFromConfig、config entry、provider resolution
    core/             # normalizeRuntime、messageIdentity
    engine/           # useChatKit、useChatConversation、useChatMessages、useChatRequest
    transport/        # openaiCompatibleTransport
    features/         # feature registry
  shared/
    context/          # chatUiContext、injection keys
    messages/         # i18n 文案（CHAT_MESSAGES）
    utils/            # 工具函数
  types/              # 类型定义（component、config、runtime、message、workspace 等）
  styles/             # CSS 样式
```
