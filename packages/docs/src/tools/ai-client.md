# AI模型交互工具类 AIClient

客户端类，用于与AI模型交互。

## API

### 构造函数

```typescript
const client:AIClient = new AIClient(config: AIModelConfig)

/**
 * AI模型配置接口
 */
interface AIModelConfig {
  provider: AIProvider
  apiKey?: string
  apiUrl?: string
  apiVersion?: string
  defaultModel?: string
  defaultOptions?: ChatCompletionOptions
}

```

### 方法

```typescript
/**
 * AIClient类
 */
declare class AIClient {
    /**
     * 发送聊天请求并获取响应
     * @param request 聊天请求参数
     * @returns 聊天响应
     */
    chat(request: ChatCompletionRequest): Promise<ChatCompletionResponse>;
    /**
     * 发送流式聊天请求并通过处理器处理响应
     * @param request 聊天请求参数
     * @param handler 流式响应处理器
     */
    chatStream(request: ChatCompletionRequest, handler: StreamHandler): Promise<void>;
    /**
     * 获取当前配置
     * @returns AI模型配置
     */
    getConfig(): AIModelConfig;
    /**
     * 更新配置
     * @param config 新的AI模型配置
     */
    updateConfig(config: Partial<AIModelConfig>): void;
}

/**
 * 流式响应处理器
 */
interface StreamHandler {
    onData: (data: ChatCompletionStreamResponse) => void;
    onError: (error: AIAdapterError) => void;
    onDone: () => void;
}

```


## 用法示例

### 创建客户端并发送消息

```typescript
import { AIClient } from '@opentiny/tiny-robot-ai-adapter';

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
import { AIClient } from '@opentiny/tiny-robot-ai-adapter';

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
