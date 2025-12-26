---
outline: deep
---

# 对话管理 useConversation

`useConversation` 是一个对话管理工具，它可以帮助你管理对话的状态和历史记录。

## 示例

### 基础示例

使用 Mock 存储策略的基础示例，适合快速了解功能：

<demo vue="../../demos/tools/conversation/Basic.vue" :vueFiles="['../../demos/tools/conversation/Basic.vue']" />

### LocalStorage 策略

使用浏览器 LocalStorage 存储会话数据，刷新页面后数据仍然保留：

<demo vue="../../demos/tools/conversation/LocalStorage.vue" :vueFiles="['../../demos/tools/conversation/LocalStorage.vue']" />

### IndexedDB 策略

使用浏览器 IndexedDB 存储会话数据，支持更大容量和更好性能：

<demo vue="../../demos/tools/conversation/IndexedDB.vue" :vueFiles="['../../demos/tools/conversation/IndexedDB.vue']" />

## API

### 选项
```typescript
interface UseConversationOptions {
  /** AI客户端实例 */
  client: AIClient
  /** 存储类型 (default: 'localStorage') */
  storageType?: 'localStorage' | 'indexedDB'
  /** 自定义存储策略（优先级高于 storageType） */
  storage?: ConversationStorageStrategy
  /** 存储配置 */
  storageConfig?: StorageConfig
  /** 是否自动保存 (default: true) */
  autoSave?: boolean
  /** 是否允许空会话 (default: false) */
  allowEmpty?: boolean
  /** 是否默认使用流式响应 (default: true)*/
  useStreamByDefault?: boolean
  /** 错误消息模板 */
  errorMessage?: string
  /** 事件回调 */
  events?: UseConversationEvents
}

interface StorageConfig {
  /** LocalStorage 的存储键名 */
  key?: string
  /** IndexedDB 的数据库名称 */
  dbName?: string
  /** IndexedDB 的数据库版本 */
  dbVersion?: number
}
```

### 事件类型

```typescript
type UseConversationEvents = UseMessageOptions['events'] & {
  /** 会话加载完成回调 */
  onLoaded?: (conversations: Conversation[]) => void
}
```

### 返回值

```typescript
interface UseConversationReturn {
  /** 会话状态 */
  state: ConversationState;
  /** 消息管理 */
  messageManager: UseMessageReturn;
  /** 创建新会话 */
  createConversation: (title?: string, metadata?: Record<string, unknown>) => string;
  /** 切换会话 */
  switchConversation: (id: string) => void;
  /** 删除会话 */
  deleteConversation: (id: string) => void;
  /** 更新会话标题 */
  updateTitle: (id: string, title: string) => void;
  /** 更新会话元数据 */
  updateMetadata: (id: string, metadata: Record<string, unknown>) => void;
  /** 保存会话 */
  saveConversations: () => Promise<void>;
  /** 加载会话 */
  loadConversations: () => Promise<void>;
  /** 生成会话标题 */
  generateTitle: (id: string) => Promise<string>;
  /** 获取当前会话 */
  getCurrentConversation: () => Conversation | null;
}
```

### 会话状态

```typescript
interface ConversationState {
  /** 会话列表 */
  conversations: Conversation[];
  /** 当前会话ID */
  currentId: string | null;
  /** 是否正在加载 */
  loading: boolean;
}
```

### 会话接口

```typescript

interface Conversation {
  /** 会话ID */
  id: string;
  /** 会话标题 */
  title: string;
  /** 创建时间 */
  createdAt: number;
  /** 更新时间 */
  updatedAt: number;
  /** 自定义元数据 */
  metadata?: Record<string, unknown>;
  /** 消息 */
  messages: ChatMessage[];
}
```


### 存储策略

#### 使用 LocalStorage（默认）

默认情况下，会话数据存储在浏览器的 LocalStorage 中：

```typescript
const conversationManager = useConversation({
  client,
  // 默认使用 LocalStorage，无需配置
});

// 或自定义存储键名
const conversationManager = useConversation({
  client,
  storageType: 'localStorage',
  storageConfig: {
    key: 'my-app-conversations'
  }
});
```

#### 使用 IndexedDB

IndexedDB 相比 LocalStorage 具有更大的存储容量（>50MB）和更好的性能，适合存储大量会话数据：

```typescript
const conversationManager = useConversation({
  client,
  storageType: 'indexedDB'
});

// 或自定义数据库配置
const conversationManager = useConversation({
  client,
  storageType: 'indexedDB',
  storageConfig: {
    dbName: 'my-chat-app-db',
    dbVersion: 1
  }
});
```

#### 存储策略对比

| 特性 | LocalStorage | IndexedDB |
|------|-------------|-----------|
| 存储容量 | ~5-10MB | >50MB |
| 性能 | 同步操作 | 异步操作，不阻塞主线程 |
| 数据类型 | 仅字符串（需 JSON 序列化） | 支持对象、数组、二进制 |
| 查询能力 | 简单 key-value | 支持索引和复杂查询 |
| 浏览器支持 | 所有现代浏览器 | 所有现代浏览器（不支持 IE） |
| 隐私模式 | ✅ 支持 | ⚠️ 受限（见下方说明） |
| 适用场景 | 少量会话（<100个） | 大量会话或长对话历史 |

#### 重要提示：隐私/无痕模式限制

**IndexedDB 在隐私模式下的行为**：

不同浏览器在隐私/无痕模式下对 IndexedDB 的支持有所不同：

- **Chrome/Edge 隐私模式**：IndexedDB 可用，但数据在关闭浏览器后会被清除
- **Firefox 隐私模式**：IndexedDB 可用，但存储配额较小
- **Safari 隐私模式**：IndexedDB **完全不可用**，会抛出错误

#### 自定义存储策略

你也可以实现自定义的存储策略，例如将数据保存到远程服务器：

```typescript
import type { ConversationStorageStrategy, Conversation } from '@tiny-robot/kit';

// 远程存储策略示例
class RemoteStorageStrategy implements ConversationStorageStrategy {
  private apiUrl: string;

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
  }

  async saveConversations(conversations: Conversation[]): Promise<void> {
    await fetch(`${this.apiUrl}/conversations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(conversations)
    });
  }

  async loadConversations(): Promise<Conversation[]> {
    const response = await fetch(`${this.apiUrl}/conversations`);
    return response.json();
  }

  async clear(): Promise<void> {
    await fetch(`${this.apiUrl}/conversations`, { method: 'DELETE' });
  }
}

// 使用自定义存储策略
const conversationManager = useConversation({
  client,
  storage: new RemoteStorageStrategy('https://api.example.com')
});
```

### 存储策略接口

```typescript
interface ConversationStorageStrategy {
  /** 保存会话列表 */
  saveConversations: (conversations: Conversation[]) => Promise<void> | void;
  /** 加载会话列表 */
  loadConversations: () => Promise<Conversation[]> | Conversation[];
  /** 清空所有会话（可选） */
  clear?: () => Promise<void> | void;
}
```
