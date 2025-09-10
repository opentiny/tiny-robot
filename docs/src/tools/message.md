---
outline: deep
---

# 消息与数据管理 useMessage

## 示例

### 基础用法

<demo vue="../../demos/tools/message/Basic.vue" />

### onReceiveData 事件

`onReceiveData` 的签名如下：

```ts
onReceiveData?: <T = any>(data: T, messages: Ref<ChatMessage[]>, preventDefault: () => void) => void
```

`data` 是大模型响应， `messages` 是本地存储的对话记录， `preventDefault` 可以用来阻止默认行为。

非流式 chat 内部的默认行为如下：

```ts
const assistantMessage: ChatMessage = {
  role: 'assistant',
  content: data.choices[0].message.content,
}
messages.value.push(assistantMessage)
```

流式 chat 内部的默认行为如下：

```ts
if (messages.value[messages.value.length - 1].role === 'user') {
  messages.value.push({ role: 'assistant', content: '' })
}
const choice = data.choices?.[0]
if (choice && choice.delta.content) {
  messages.value[messages.value.length - 1].content += choice.delta.content
}
```

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
  client: AIClient
  /** 是否默认使用流式响应 */
  useStreamByDefault?: boolean
  /** 错误消息模板 */
  errorMessage?: string
  /** 初始消息列表 */
  initialMessages?: ChatMessage[]
  /** 事件回调 */
  events?: {
    onReceiveData?: <T = any>(data: T, messages: Ref<ChatMessage[]>, preventDefault: () => void) => void
  }
}
```

### 返回值

`useMessage` 返回以下内容：

```typescript
interface UseMessageReturn {
  messages: Ref<ChatMessage[]>
  /** 消息状态 */
  messageState: Reactive<MessageState>
  /** 输入消息 */
  inputMessage: Ref<string>
  /** 是否使用流式响应 */
  useStream: Ref<boolean>
  /** 发送消息 */
  sendMessage: (content?: ChatMessage['content'], clearInput?: boolean) => Promise<void>
  /** 手动执行addMessage添加消息后，可以执行send发送消息 */
  send: () => Promise<void>
  /** 清空消息 */
  clearMessages: () => void
  /** 添加消息 */
  addMessage: (message: ChatMessage | ChatMessage[]) => void
  /** 中止请求 */
  abortRequest: () => void
  /** 重试请求 */
  retryRequest: (msgIndex: number) => Promise<void>
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

// 状态常量
const GeneratingStatus = [STATUS.PROCESSING, STATUS.STREAMING]
const FinalStatus = [STATUS.FINISHED, STATUS.ABORTED, STATUS.ERROR]
```
