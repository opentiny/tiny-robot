# AI模型交互工具类 AIClient

客户端类，用于与AI模型交互。

## API

### 构造函数

```typescript
new AIClient(config: AIModelConfig)
```

### 方法

- `chat(request: ChatCompletionRequest): Promise<ChatCompletionResponse>`  
  发送聊天请求并获取响应。

- `chatStream(request: ChatCompletionRequest, handler: StreamHandler): Promise<void>`  
  发送流式聊天请求并通过处理器处理响应。


## 用法示例

### 创建客户端并发送消息

<demo vue="../../demos/tools/client/Basic.vue" />


### 使用流式响应

- 使用chatStream方法实现流式响应
- signal参数传递 AbortController用于中断请求

<demo vue="../../demos/tools/client/Stream.vue" />

