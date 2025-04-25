# tiny-robot-kit

封装与与AI大模型的交互逻辑与数据处理，适配多种模型提供商，提供统一的API接口。

## API参考

### AIClient

主要客户端类，用于与AI模型交互。

#### 构造函数

```typescript
new AIClient(config: AIModelConfig)
```

#### 方法

- `chat(request: ChatCompletionRequest): Promise<ChatCompletionResponse>`
  发送聊天请求并获取响应。

- `chatStream(request: ChatCompletionRequest, handler: StreamHandler): Promise<void>`
  发送流式聊天请求并通过处理器处理响应。


## 基本用法

### 创建客户端并发送消息

```typescript
import { AIClient } from '@opentiny/tiny-robot-kit';

// 创建客户端
const client = new AIClient({
  provider: 'openai',
  apiKey: 'your-api-key',
  defaultModel: 'gpt-3.5-turbo'
});

// 发送消息并获取响应
async function chat() {
  try {
    const response = await client.chat({
      messages: [
        { role: 'system', content: '你是一个有用的助手。' },
        { role: 'user', content: '你好，请介绍一下自己。' }
      ],
      options: {
        temperature: 0.7
      }
    });
    
    console.log(response.choices[0].message.content);
  } catch (error) {
    console.error('聊天出错:', error);
  }
}

chat();
```

### 使用流式响应

```typescript
import { AIClient } from '@opentiny/tiny-robot-kit';

const client = new AIClient({
  provider: 'openai',
  apiKey: 'your-api-key'
});

async function streamChat() {
  try {
    const controller: AbortController = new AbortController()
    await client.chatStream({
      messages: [
        { role: 'user', content: '写一个简短的故事。' }
      ],
      options: {
        stream: true, // 启用流式响应
        signal: controller.signal  // 传递 AbortController 的 signal用于中断请求
      }
    }, {
      onData: (data) => {
        // 处理流式数据
        const content = data.choices[0]?.delta?.content || '';
        process.stdout.write(content);
      },
      onError: (error) => {
        console.error('流式响应错误:', error);
      },
      onDone: () => {
        console.log('\n流式响应完成');
      }
    });
    // controller.abort() // 中断请求
  } catch (error) {
    console.error('流式聊天出错:', error);
  }
}

streamChat();
```

### useMessage

#### 选项

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

#### 返回值

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
  sendMessage: (content?: string, clearInput?: boolean) => Promise<void>
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

#### MessageState 接口
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
