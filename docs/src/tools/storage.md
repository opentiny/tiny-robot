---
outline: deep
---

# 存储策略 Storage

存储策略模块提供了多种方式来持久化会话和消息数据。支持 LocalStorage 和 IndexedDB 两种存储方式，也可以实现自定义存储策略。

## 示例

### LocalStorage 策略

使用浏览器 LocalStorage 存储会话数据，适合小量数据存储：

<demo vue="../../demos/tools/storage/LocalStorage.vue" :vueFiles="['../../demos/tools/storage/LocalStorage.vue']" />

### IndexedDB 策略

使用浏览器 IndexedDB 存储会话数据，支持更大容量和更好性能：

<demo vue="../../demos/tools/storage/IndexedDB.vue" :vueFiles="['../../demos/tools/storage/IndexedDB.vue']" />

### 自定义存储策略

实现自定义存储策略，例如将数据保存到远程服务器：

<demo vue="../../demos/tools/storage/Custom.vue" :vueFiles="['../../demos/tools/storage/Custom.vue']" />

## API

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

### 工厂函数

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

##### 使用示例

```typescript
import { localStorageStrategyFactory } from '@opentiny/tiny-robot-kit'

const storage = localStorageStrategyFactory({
  key: 'my-app-conversations',
})
```

##### 特性

- ✅ 同步操作，简单易用
- ✅ 所有现代浏览器支持
- ✅ 隐私模式可用
- ⚠️ 存储容量限制：约 5-10MB
- ⚠️ 仅支持字符串存储（需 JSON 序列化）

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

##### 使用示例

```typescript
import { indexedDBStorageStrategyFactory } from '@opentiny/tiny-robot-kit'

const storage = indexedDBStorageStrategyFactory({
  dbName: 'my-chat-app-db',
  dbVersion: 1,
})
```

##### 特性

- ✅ 存储容量大：>50MB
- ✅ 异步操作，不阻塞主线程
- ✅ 支持对象、数组、二进制数据
- ✅ 支持索引和复杂查询
- ⚠️ Safari 隐私模式下不可用
- ⚠️ 需要处理异步操作

### 存储策略对比

| 特性       | LocalStorage               | IndexedDB                   |
| ---------- | -------------------------- | --------------------------- |
| 存储容量   | ~5-10MB                    | >50MB                       |
| 性能       | 同步操作                   | 异步操作，不阻塞主线程      |
| 数据类型   | 仅字符串（需 JSON 序列化） | 支持对象、数组、二进制      |
| 查询能力   | 简单 key-value             | 支持索引和复杂查询          |
| 浏览器支持 | 所有现代浏览器             | 所有现代浏览器（不支持 IE） |
| 隐私模式   | ✅ 支持                    | ⚠️ 受限（见下方说明）       |
| 适用场景   | 少量会话（<100个）         | 大量会话或长对话历史        |

### 重要提示：隐私/无痕模式限制

**IndexedDB 在隐私模式下的行为**：

不同浏览器在隐私/无痕模式下对 IndexedDB 的支持有所不同：

- **Chrome/Edge 隐私模式**：IndexedDB 可用，但数据在关闭浏览器后会被清除
- **Firefox 隐私模式**：IndexedDB 可用，但存储配额较小
- **Safari 隐私模式**：IndexedDB **完全不可用**，会抛出错误

如果需要在隐私模式下使用，建议：

1. 检测 IndexedDB 是否可用
2. 如果不可用，自动降级到 LocalStorage
3. 或者提示用户切换到正常模式

### 自定义存储策略

你可以实现自定义的存储策略，例如将数据保存到远程服务器：

```typescript
import type { ConversationStorageStrategy, ConversationInfo, ChatMessage } from '@opentiny/tiny-robot-kit'

class RemoteStorageStrategy implements ConversationStorageStrategy {
  private apiUrl: string

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl
  }

  async loadConversations(): Promise<ConversationInfo[]> {
    const response = await fetch(`${this.apiUrl}/conversations`)
    return response.json()
  }

  async loadMessages(conversationId: string): Promise<ChatMessage[]> {
    const response = await fetch(`${this.apiUrl}/conversations/${conversationId}/messages`)
    return response.json()
  }

  async saveConversation(conversation: ConversationInfo): Promise<void> {
    await fetch(`${this.apiUrl}/conversations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(conversation),
    })
  }

  async saveMessages(conversationId: string, messages: ChatMessage[]): Promise<void> {
    await fetch(`${this.apiUrl}/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messages),
    })
  }

  async deleteConversation(conversationId: string): Promise<void> {
    await fetch(`${this.apiUrl}/conversations/${conversationId}`, {
      method: 'DELETE',
    })
  }
}

// 使用自定义存储策略
const storage = new RemoteStorageStrategy('https://api.example.com')
```

### 类型定义

#### ConversationInfo

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
```

#### MaybePromise

```typescript
type MaybePromise<T> = T | Promise<T>
```

存储策略的方法可以返回同步值或 Promise，框架会自动处理。
