---
outline: [1, 3]
---

# useConversation 迁移

本文档用于将 `useConversation` 从 **v0.3.x** 迁移到 **0.4.x**：以 `useMessageOptions` 替代 `client`，每个会话拥有独立的 `useMessage` engine，支持懒加载、自动保存节流与存储策略拆分。

## 概述

- **v0.3.x**：单一 `messageManager` + 一套会话状态（数组 + currentId）
- **0.4.x**：以 `useMessageOptions` 为核心，每个会话对应独立 `useMessage` engine；支持 `ConversationStorageStrategy` 的 `loadConversations` / `loadMessages` / `saveConversation` / `saveMessages` 拆分、懒加载与自动保存节流

## v0.3.x 用法

以下为 v0.3.x 的旧写法。

```ts
import { useConversation, AIClient } from '@opentiny/tiny-robot-kit'

const client = new AIClient({ provider: 'openai', apiKey: 'xxx' })

const { state, messageManager, createConversation, switchConversation } = useConversation({ client })
```

## 0.4.x 用法

以下为 0.4.x 的写法。`useConversation` 以 `useMessageOptions` 为核心，每个会话都会有自己的 `engine`：

```ts
import { useConversation } from '@opentiny/tiny-robot-kit'

const { conversations, activeConversationId, activeConversation, createConversation, switchConversation } = useConversation({
  useMessageOptions: {
    responseProvider,
  },
  autoSaveMessages: true,
  autoSaveThrottle: 1000,
})

createConversation({ title: 'New chat' })
await switchConversation(conversations.value[0].id)
activeConversation.value?.engine.sendMessage('Hello')
```

## v0.3.x → 0.4.x 对照

| v0.3.x | 0.4.x | 说明 |
| --- | --- | --- |
| `{ client }` | `{ useMessageOptions: { responseProvider } }` | 不再传入 AIClient，改为 useMessage 的配置 |
| `state` + `messageManager` | `conversations` + `activeConversationId` + `activeConversation` | 会话列表与当前会话拆分为独立 ref；`activeConversation.engine` 即该会话的 useMessage 实例 |
| 单一 messageManager | 每个会话独立 `engine`（懒加载） | 切换会话时按需创建/加载 engine，支持后台请求不中断 |
| （无） | `autoSaveMessages`、`autoSaveThrottle` | 可选自动保存与节流 |
| （无） | `storage?: ConversationStorageStrategy` | 可选的存储策略，接口见下方 |

## 存储策略迁移

v0.3.x 的 storage 更偏「保存整个 conversations」；0.4.x 的 `ConversationStorageStrategy` 拆分为：

- `loadConversations()`：只加载会话列表（id / title / metadata / 时间）
- `loadMessages(conversationId)`：加载指定会话的 messages
- `saveConversation(conversation)`：保存会话元信息
- `saveMessages(conversationId, messages)`：保存 messages

如有自定义存储，实现 0.4.x 的 `ConversationStorageStrategy` 即可（可复用既有持久化介质）。详见 [会话数据管理 - 存储策略](/tools/conversation#存储策略接口)。

## 迁移检查清单

- [ ] `useConversation({ client })` 改为 `useConversation({ useMessageOptions: { responseProvider } })`
- [ ] 将依赖 `state` / `messageManager` 的逻辑改为使用 `conversations`、`activeConversationId`、`activeConversation` 与 `activeConversation.engine`
- [ ] 若有自定义存储，按 `ConversationStorageStrategy` 实现 `loadConversations`、`loadMessages`、`saveConversation`、`saveMessages`
- [ ] 包导出变化（如 `formatMessages` 等移除）见 [useMessage 迁移](./use-message-migration#导出与导入路径迁移)
