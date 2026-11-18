# Runtime 创建与释放

`createChatRuntime(options)` 为 Angular、React 和原生 JavaScript 创建独立的聊天 Runtime。将返回的 `runtime` 绑定到 `tr-chat`，在所属页面或应用销毁时调用 `dispose()`。

```ts
import { createChatRuntime } from '@opentiny/tiny-robot-chat'

const owned = createChatRuntime({
  modelProviders: [
    {
      type: 'openai',
      apiUrl: new URL('/api/chat/completions', location.origin).href,
      models: [{ id: 'your-model-id', label: '应用助手' }],
    },
  ],
})

chat.runtime = owned.runtime
await owned.runtime.actions.send({ text: '你好' })

// 所属页面销毁时执行。
await owned.dispose()
```

## 模型、历史与 MCP

配置项沿用 `UseChatRuntimeOptions`：

| 配置             | 作用                                                       |
| ---------------- | ---------------------------------------------------------- |
| `modelProviders` | 模型服务、认证、模型列表及功能字段                         |
| `conversation`   | 会话存储、自动保存及消息请求配置                           |
| `mcpServers`     | 由 Runtime 管理的 MCP 服务                                 |
| `mcp`            | 由应用管理的 MCP 适配器；与 `mcpServers` 二选一            |
| `beforeSend`     | 发送前的业务处理，可返回 `continue`、`handled` 或 `reject` |
| `titleGenerator` | 从首条消息生成会话标题                                     |
| `composer`       | 业务控制的输入禁用状态                                     |

模型 Provider 和配置字段见 [Chat Runtime](../suites/chat-runtime)。应用代码中的配置可放在独立文件，避免与框架视图生命周期混在一起。

默认开启消息自动保存。需要自定义存储键时：

```ts
import { localStorageStrategyFactory } from '@opentiny/tiny-robot-kit'

const owned = createChatRuntime({
  modelProviders,
  conversation: {
    storage: localStorageStrategyFactory({ key: 'my-app-chat-history' }),
  },
  mcpServers: [
    {
      id: 'knowledge',
      name: '知识库',
      baseUrl: new URL('/api/mcp', location.origin).href,
    },
  ],
})
```

直接导入存储策略时，安装相同版本的 Kit 包：

```sh
pnpm add -E @opentiny/tiny-robot-kit@1.0.1-alpha.1
```

MCP 服务按需安装和启用；模型服务和 MCP 地址应由浏览器可访问。存储中的会话可以从聊天界面的历史列表恢复。

## 操作与读取状态

```ts
const runtime = owned.runtime
await runtime.actions.createConversation({ title: '新任务' })
await runtime.actions.send({ text: '帮我梳理需求' })
await runtime.actions.abort?.()

const conversation = runtime.activeConversation.value
const histories = runtime.conversations.value
```

`runtime.actions` 还提供 `switchConversation(id)`、`renameConversation(id, title)`、`deleteConversation(id)` 和 `clearActiveConversation()`。后者返回空白聊天状态，并保留历史。

`.value` 用于读取当前快照；给 `tr-chat` 绑定 Runtime 后，聊天界面会同步更新。Angular 或 React 自己的视图需要跟随 Runtime 状态更新时，应另行对接宿主状态，不能把一次 `.value` 读取当成宿主框架的订阅。

## 释放约定

- Runtime 的创建者负责调用 `dispose()`。多个聊天元素共用同一 Runtime 时，在全部使用者结束后释放。
- 释放会中止当前及后台会话请求，关闭自建 MCP 连接，停止监听与定时任务，并完成必要的历史保存。已保存的会话保留。
- `dispose()` 返回 `Promise<void>`；重复调用返回同一 Promise。保存或释放失败时 Promise 拒绝，应用可以记录或处理错误。
- 释放后不能继续发送、切换或修改会话；需要再次使用时创建新的 Runtime。
- 传入 `mcp` 的外部适配器由应用负责释放。自定义请求、插件和业务异步任务应响应所收到的取消信号；应用自行启动的外部工作由应用收尾。
- 悬浮窗口收起时保留 Runtime；所属页面销毁或整个聊天功能移除时才释放。

Angular 使用 `DestroyRef.onDestroy()`，React 使用 effect 清理函数。框架清理函数可用 `void owned.dispose().catch(handleError)` 发起释放；需要确保保存完成的应用操作可以显式 `await owned.dispose()`。浏览器关闭页面不能保证等待异步保存，重要数据应在交互过程中持续保存。
