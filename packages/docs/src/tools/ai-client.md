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

<demo vue="../../demos/tools/client/Basic.vue" />


### 使用流式响应

- 使用chatStream方法实现流式响应
- signal参数传递 AbortController用于中断请求

<demo vue="../../demos/tools/client/Stream.vue" />

