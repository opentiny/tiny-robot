
# 对话管理 useConversation

`useConversation` 是一个对话管理工具，它可以帮助你管理对话的状态和历史记录。

## 示例

<demo vue="../../demos/tools/conversation/Basic.vue" />

## API

`useConversation` 返回以下内容：

```typescript
interface UseConversationReturn {
  /** 会话状态 */
  state: ConversationState;
  /** 消息管理 */
  messageManager: UseMessageReturn;
  /** 创建新会话 */
  createConversation: (title?: string, metadata?: Record<string, any>) => string;
  /** 切换会话 */
  switchConversation: (id: string) => void;
  /** 删除会话 */
  deleteConversation: (id: string) => void;
  /** 更新会话标题 */
  updateTitle: (id: string, title: string) => void;
  /** 更新会话元数据 */
  updateMetadata: (id: string, metadata: Record<string, any>) => void;
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

#### 会话状态

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

#### 会话接口

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
  metadata?: Record<string, any>;
  /** 消息 */
  messages: ChatMessage[];
}
```


#### 自定义存储策略

默认使用 LocalStorage 存储会话数据，你也可以实现自定义的存储策略：

```typescript
interface ConversationStorageStrategy {
  /** 保存会话列表 */
  saveConversations: (conversations: Conversation[]) => Promise<void> | void;
  /** 加载会话列表 */
  loadConversations: () => Promise<Conversation[]> | Conversation[];
}

// 自定义存储策略示例
class CustomStorageStrategy implements ConversationStorageStrategy {
  async saveConversations(conversations: Conversation[]) {
    // 实现自定义存储逻辑
  }

  async loadConversations(): Promise<Conversation[]> {
    // 实现自定义加载逻辑
    return [];
  }
}

// 使用自定义存储策略
const conversationManager = useConversation({
  client,
  storage: new CustomStorageStrategy(),
});
```
