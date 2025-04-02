# AI Mocker

AI API 模拟服务，模拟类似 OpenAI 的 API 响应，方便开发测试。


## 启动命令

```bash
# 开发模式（自动重启）
npm run dev
# 或
npm start
```

服务器将在 http://localhost:3001 上启动。


## API

```
POST /v1/chat/completions
```

### 请求参数

```json
{
  "messages": [
    { "role": "system", "content": "你是一个助手" },
    { "role": "user", "content": "请给我一段代码示例" }
  ],
  "stream": true,
  "model": "gpt-3.5-turbo"
}
```

- `messages`: 聊天消息数组，包含角色和内容
- `stream`: 是否使用流式响应（布尔值）
- `model`: 模型名称（可选）

## 自定义响应模板

可以在 `src/mockTemplates.ts` 文件中自定义响应模板。目前支持以下类型的模板：

- `code`: 代码示例响应
- `list`: 列表或步骤响应
- `default`: 默认响应


## 前端集成

在前端应用中，可以将 API 请求指向模拟服务器：

```javascript
const response = await fetch('http://localhost:3001/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    messages: [
      { role: 'user', content: '请给我一段代码示例' }
    ],
    stream: false
  })
});

const data = await response.json();
console.log(data.choices[0].message.content);
```

## 流式响应处理

```javascript
const response = await fetch('http://localhost:3001/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    messages: [
      { role: 'user', content: '请给我一段代码示例' }
    ],
    stream: true
  })
});

const reader = response.body.getReader();
let decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const chunk = decoder.decode(value);
  // 处理 SSE 格式的数据
  console.log(chunk);
}
```