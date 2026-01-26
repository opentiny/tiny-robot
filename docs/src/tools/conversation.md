---
outline: deep
---

# 对话管理 useConversation

:::danger 重大版本升级 v0.4
useConversation 在 v0.4 进行了重大升级，`client` 改为 `useMessageOptions`，存储与引擎懒加载有变。

**从 v0.3.x 升级？** 请查看 [useConversation 迁移](../migration/use-conversation-migration)。

**新项目：** 直接使用下方 v0.4 的 API 和示例即可。
:::

`useConversation` 是一个对话管理工具，它可以帮助你管理对话的状态和历史记录。

默认情况下，`useConversation` 会使用 LocalStorage 策略来持久化会话和消息数据。如果你需要更大的存储容量或更好的性能，可以切换到 IndexedDB 策略。关于存储策略的详细说明，请参考 [存储策略文档](./storage.md)。

## 示例

### 基础示例

<demo vue="../../demos/tools/conversation/Basic.vue" :vueFiles="['../../demos/tools/conversation/Basic.vue']" />

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