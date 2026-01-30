---
outline: [1, 3]
---

# useConversation 会话数据管理

:::danger 重大版本升级 v0.4
useConversation 在 v0.4 进行了重大升级，`client` 改为 `useMessageOptions`，存储与引擎懒加载有变。

**从 v0.3.x 升级？** 请查看 [useConversation 迁移](../migration/use-conversation-migration)。

**新项目：** 直接使用下方 v0.4 的 API 和示例即可。
:::

`useConversation` 是一个对话管理工具，它可以帮助你管理对话的状态和历史记录。下方示例覆盖对话管理及存储策略的常见场景，可直接在项目或文档中运行。

## 示例

### 基础示例

使用 `useConversation` 管理多会话，配合 `tr-bubble-list` 展示消息、`tr-sender` 输入发送。每个会话拥有独立的 useMessage 引擎，切换会话时，当前会话的请求可在后台继续执行，支持多会话并行处理。本示例使用内存模拟存储和模拟流式响应，预置若干会话和消息，无需真实 API 即可体验切换会话、创建新对话、发送消息等完整流程。

<demo vue="../../demos/tools/conversation/Basic.vue" :vueFiles="['../../demos/tools/conversation/Basic.vue', '../../demos/tools/conversation/mockResponseProvider.ts', '../../demos/tools/conversation/mockStorageStrategy.ts']" />

### 存储

默认情况下，`useConversation` 会使用 LocalStorage 策略来持久化会话和消息数据。如需更大容量或更好性能，可切换到 IndexedDB 策略，或实现自定义存储策略。

#### LocalStorage 策略

使用浏览器 LocalStorage 存储会话数据，适合小量数据存储。会话和消息会持久化到本地，刷新页面后仍可恢复。

<demo vue="../../demos/tools/conversation/LocalStorage.vue" :vueFiles="['../../demos/tools/conversation/LocalStorage.vue']" />

#### IndexedDB 策略

使用浏览器 IndexedDB 存储会话数据，支持更大容量和更好性能。适用于大量会话或长对话历史场景。

<demo vue="../../demos/tools/conversation/IndexedDB.vue" :vueFiles="['../../demos/tools/conversation/IndexedDB.vue']" />

#### 自定义存储策略

实现自定义存储策略，例如将数据保存到远程服务器。本示例使用内存存储作为演示，刷新页面后数据会丢失。

<demo vue="../../demos/tools/storage/Custom.vue" :vueFiles="['../../demos/tools/storage/Custom.vue']" />

## API

### 选项

```typescript
interface UseConversationOptions {
  /**
   * 所有会话的基础 useMessage 选项。
   * 传递给 createConversation 的每个会话选项会在此基础上合并。
   */
  useMessageOptions: UseMessageOptions
  /**
   * 是否在消息变更时自动保存。
   * @default false
   */
  autoSaveMessages?: boolean
  /**
   * 自动保存操作的节流时间（毫秒）。
   * 确保在流式更新期间，每个时间间隔内最多保存一次消息。
   * 仅在 autoSaveMessages 为 true 时生效。
   * @default 1000
   */
  autoSaveThrottle?: number
  /**
   * 可选的存储策略，用于会话和消息的持久化。
   * 如果不提供，默认使用 LocalStorage 策略。
   * 当提供时，会话列表和消息可以被加载和持久化。
   */
  storage?: ConversationStorageStrategy
}
```

### 返回值

```typescript
interface UseConversationReturn {
  /** 会话列表 */
  conversations: Ref<ConversationInfo[]>
  /** 当前会话ID */
  activeConversationId: Ref<string | null>
  /** 当前活跃会话 */
  activeConversation: ComputedRef<Conversation | null>
  /** 创建新会话 */
  createConversation: (params?: {
    /** 会话ID，不提供则自动生成 */
    id?: string
    /** 会话标题 */
    title?: string
    /** 自定义元数据 */
    metadata?: Record<string, unknown>
    /** 覆盖默认的消息选项 */
    useMessageOptions?: Partial<UseMessageOptions>
  }) => Conversation
  /** 切换会话 */
  switchConversation: (id: string) => Promise<Conversation | null>
  /** 删除会话 */
  deleteConversation: (id: string) => Promise<void>
  /** 清空所有会话 */
  clear: () => void
  /** 更新会话标题 */
  updateConversationTitle: (id: string, title?: string) => void
  /** 保存指定会话的消息 */
  saveMessages: (id?: string) => void
  /** 发送消息到当前活跃会话 */
  sendMessage: (content: string) => void
  /** 中止当前活跃会话的请求 */
  abortActiveRequest: () => Promise<void>
}
```

### 会话接口

```typescript
interface ConversationInfo {
  /** 会话ID */
  id: string
  /** 会话标题 */
  title?: string
  /** 创建时间 */
  createdAt: number
  /** 更新时间 */
  updatedAt: number
  /** 自定义元数据 */
  metadata?: Record<string, unknown>
}

interface Conversation extends ConversationInfo {
  /**
   * 由 useMessage 创建的消息引擎实例。
   */
  engine: UseMessageReturn
}
```

### 存储策略接口

所有存储策略都需要实现 `ConversationStorageStrategy` 接口：

```typescript
interface ConversationStorageStrategy {
  /**
   * 加载所有会话（仅包含元数据）
   */
  loadConversations: () => MaybePromise<ConversationInfo[]>

  /**
   * 加载指定会话的所有消息
   */
  loadMessages: (conversationId: string) => MaybePromise<ChatMessage[]>

  /**
   * 保存或更新会话元数据
   */
  saveConversation: (conversation: ConversationInfo) => MaybePromise<void>

  /**
   * 保存指定会话的消息
   */
  saveMessages: (conversationId: string, messages: ChatMessage[]) => MaybePromise<void>

  /**
   * 删除会话及其所有消息（可选）
   */
  deleteConversation?: (conversationId: string) => MaybePromise<void>
}
```

### 存储策略工厂函数

#### localStorageStrategyFactory

创建 LocalStorage 存储策略实例。

```typescript
function localStorageStrategyFactory(config?: LocalStorageConfig): ConversationStorageStrategy
```

##### 参数

```typescript
interface LocalStorageConfig {
  /** 存储键名，默认为 'tiny-robot-ai-conversations' */
  key?: string
}
```

#### indexedDBStorageStrategyFactory

创建 IndexedDB 存储策略实例。

```typescript
function indexedDBStorageStrategyFactory(config?: IndexedDBConfig): ConversationStorageStrategy
```

##### 参数

```typescript
interface IndexedDBConfig {
  /** 数据库名称，默认为 'tiny-robot-ai-db' */
  dbName?: string
  /** 数据库版本，默认为 1 */
  dbVersion?: number
}
```

### 类型定义

#### MaybePromise

```typescript
type MaybePromise<T> = T | Promise<T>
```

存储策略的方法可以返回同步值或 Promise，框架会自动处理。
