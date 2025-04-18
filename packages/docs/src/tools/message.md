
# 消息与数据管理 useMessage

## API

```typescript
const messageComposable: UseMessageReturn = useMessage(
  options: UseMessageOptions
): UseMessageReturn
```

### 选项


`useMessage` 接受以下选项：

```typescript
interface UseMessageOptions {
  /** AI客户端实例 */
  client: AIClient;
  /** 是否默认使用流式响应 */
  useStreamByDefault?: boolean;
  /** 错误消息模板 */
  errorMessage?: string;
  /** 初始消息列表 */
  initialMessages?: ChatMessage[];
}
```

### 返回值

`useMessage` 返回以下内容：
```typescript
interface UseMessageReturn {
  messages: ChatMessage[];
  /** 消息状态 */
  messageState: Reactive<MessageState>;
  /** 输入消息 */
  inputMessage: Ref<string>;
  /** 是否使用流式响应 */
  useStream: Ref<boolean>;
  /** 发送消息 */
  sendMessage: () => Promise<void>;
  /** 清空消息 */
  clearMessages: () => void;
  /** 添加消息 */
  addMessage: (message: ChatMessage) => void;
  /** 中止请求 */
  abortRequest: () => void;
  /** 重试请求 */
  retryRequest: () => Promise<void>;
}
```

### MessageState 接口
```typescript
interface MessageState {
  status: STATUS
  errorMsg: string | null
}

enum STATUS {
  INIT = 'init', // 初始状态
  PROCESSING = 'processing', // AI请求正在处理中, 还未响应，显示加载动画
  STREAMING = 'streaming', // 流式响应中分块数据返回中
  FINISHED = 'finished', // AI请求已完成
  ABORTED = 'aborted', // 用户中止请求
  ERROR = 'error', // AI请求发生错误
}
```
