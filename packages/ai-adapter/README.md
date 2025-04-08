# ai-adapter

封装与与技术栈无关的AI大模型的交互逻辑与数据处理，适配多种模型提供商，提供统一的API接口。

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
import { AIClient } from 'ai-adapter';

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
import { AIClient } from 'ai-adapter';

const client = new AIClient({
  provider: 'openai',
  apiKey: 'your-api-key'
});

async function streamChat() {
  try {
    await client.chatStream({
      messages: [
        { role: 'user', content: '写一个简短的故事。' }
      ],
      options: {
        stream: true
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
  } catch (error) {
    console.error('流式聊天出错:', error);
  }
}

streamChat();
```
