---
schema_version: article-hub.article.v2
title: Vue 工程接入 WebMCP SDK 最佳实践：从零构建智能前端应用
summary: 在一个新建的 Vue 3 + TypeScript 工程里，把订单列表页改造成可被 AI 查询与筛选的 WebMCP 工具页，并挂载 TinyRemoter 对话入口，跑通 Client → Server → Remoter → WebAgent 最小闭环。
project: webmcp-sdk
article_type: practical-guide
style_profile: developer-friendly
sources:
  - name: WebMCP SDK 源码
    repository: https://github.com/opentiny/webmcp-sdk
    commit: c3a3843702266fd56f04cc112710e9f3952f2fd9
  - name: TinyRemoter 组件官方文档
    url: https://docs.opentiny.design/next-sdk/remoter/basic.html
    content_hash: docs-2026-07
  - name: OpenTiny NEXT-SDK 发布文
    url: https://segmentfault.com/a/1190000047631287
    content_hash: sf-2026-07
approval_snapshot:
  url: https://github.com/hexqi/ai-article-hub/issues/96#issuecomment-5125169673
  approver: wuyiping0628
  plan_comment_id: 5115781408
  approval_comment_id: 5115849545
article_date: 2026-07-29
issue: 96
tags:
  - WebMCP
  - Vue3
  - TypeScript
  - TinyRemoter
  - 最佳实践
---

# Vue 工程接入 WebMCP SDK 最佳实践：从零构建智能前端应用

订单列表页里，用户想查「上周已发货的华东区订单」——传统做法是点筛选、选日期、选区域，再翻页核对。如果 AI 能直接调用页面上的查询能力，把自然语言翻译成工具调用，少点几次鼠标，差别就在这一层。本文跟一条可复现主线：在一个新建的 Vue 3 + TypeScript 工程里，把**同一份订单列表页**变成可被 AI 查询/筛选的 WebMCP 工具页，并挂上 TinyRemoter 对话入口。

<!-- 素材待补：传统前端 vs 智能前端对比示意图 -->

## 先搞清楚：WebMCP 在这条链路里做什么

不少团队把「接 AI」理解成「调一个大模型 API」。WebMCP 管的是另一层：**让 AI 能调用你页面里已经写好的业务能力**。页面侧用 `WebMcpServer` 把「查订单、改筛选」注册成 MCP 工具；全局用 `WebMcpClient` 连到 WebAgent，把工具暴露给远端智能体；`TinyRemoter` 负责对话 UI。

这里有个容易踩坑的点：**Client 和 Server 必须在同一应用内成对初始化**，否则工具注册了也传不到 Agent。下文所有步骤都围绕同一份订单数据推进，不在每章另起一个 demo。

## 搭脚手架：目录约定比框架选择更影响后续接入

先用 pnpm 创建 Vue 3 + TypeScript 工程：

```bash
pnpm create vue@latest order-mcp-demo
# 选项：TypeScript ✓、Vue Router ✓、Pinia ✓
cd order-mcp-demo
pnpm install
```

建议的目录约定（后续 MCP 代码都落在这里，避免和页面组件搅在一起）：

```text
src/
  mcp/              # WebMCP Client / Server 初始化
  composables/      # 订单数据与 MCP 工具绑定
  views/OrderListView.vue
  App.vue           # 挂载 TinyRemoter
```

**常见坑**：把 MCP 初始化散落到多个页面组件的 `onMounted` 里，路由切换后 Client 断连、工具列表不同步。更稳的做法是在 `main.ts` 或根级 composable 里初始化 Client，页面只负责注册本页工具。

## 安装依赖：两个包各司其职

WebMCP 接入只需要两个 npm 包（版本以你 lockfile 为准，正文 API 以官方文档/源码核验）：

```bash
pnpm add @opentiny/next-sdk @opentiny/next-remoter
```

| 包 | 职责 |
| --- | --- |
| `@opentiny/next-sdk` | `WebMcpClient`、`WebMcpServer`、`createMessageChannelPairTransport`、`z` |
| `@opentiny/next-remoter` | `TinyRemoter` 对话组件及其样式 |

只装 SDK 不装 Remoter 也能跑通工具注册与 Agent 连接，但没有对话 UI，调试工具调用只能看控制台。建议两个都装，端到端验收省很多来回切换。

## 建立全局 Client：MessageChannel 是页面内的「总线」

`WebMcpClient` 负责连接 WebAgent，并承载页面 Server 注册的工具。官方四步接入里，Client 与 Server 通过 `createMessageChannelPairTransport()` 配对——同一 Tab 内的一条内存通道，比 SSE 更适合「页面工具 ↔ 本页 Client」这种同进程场景。

在 `src/mcp/useWebMcp.ts` 里初始化（简化示例，保留核心顺序）：

```typescript
import { ref, provide, inject, type InjectionKey, type Ref } from 'vue'
import {
  WebMcpClient,
  WebMcpServer,
  createMessageChannelPairTransport,
  type ClientConnectOptions
} from '@opentiny/next-sdk'

export interface WebMcpContext {
  client: WebMcpClient
  server: WebMcpServer
  sessionId: Ref<string>
}

const WebMcpKey: InjectionKey<WebMcpContext> = Symbol('webmcp')

export async function setupWebMcp(app: { provide: typeof provide }) {
  const [serverTransport, clientTransport] = createMessageChannelPairTransport()

  const server = new WebMcpServer({ name: 'order-app-server', version: '1.0.0' })
  const client = new WebMcpClient({ name: 'order-app-client', version: '1.0.0' })

  await server.connect(serverTransport)
  await client.connect(clientTransport)

  const sessionId = ref('')

  const ctx: WebMcpContext = { client, server, sessionId }
  app.provide(WebMcpKey, ctx)
  return ctx
}

export function useWebMcp() {
  const ctx = inject(WebMcpKey)
  if (!ctx) throw new Error('WebMcp 未初始化，请先在 main.ts 调用 setupWebMcp')
  return ctx
}
```

在 `main.ts` 里等待初始化完成再挂载应用：

```typescript
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { setupWebMcp } from './mcp/useWebMcp'

const app = createApp(App)
app.use(router)

setupWebMcp(app).then(() => {
  app.mount('#app')
})
```

预期结果：控制台无 transport 报错，`useWebMcp()` 在任意子组件可用。若 Client 连接顺序写反（先连 Agent 再连 Server transport），工具列表会是空的——这是接入时最高频的坑。

<!-- 素材待补：MCP Client 初始化后控制台日志截图 -->

## 在订单列表页注册 Server 工具：让 AI 能「查」和「筛」

订单列表页是本文的贯穿实例。假设 `useOrders()` 返回 `{ orders, setFilter, reload }`，我们在**同一页面**把查询能力注册为 MCP 工具。

`src/composables/useOrderMcpTools.ts`：

```typescript
import { z } from '@opentiny/next-sdk'
import { useWebMcp } from '../mcp/useWebMcp'
import type { Ref } from 'vue'

interface Order {
  id: string
  region: string
  status: 'pending' | 'shipped' | 'cancelled'
  createdAt: string
}

export function registerOrderTools(orders: Ref<Order[]>, setFilter: (f: Partial<Order>) => void) {
  const { server } = useWebMcp()

  server.registerTool(
    'list_orders',
    {
      title: '列出订单',
      description: '返回当前筛选条件下的订单列表',
      inputSchema: {
        region: z.string().optional().describe('区域，如华东、华北'),
        status: z.enum(['pending', 'shipped', 'cancelled']).optional().describe('订单状态')
      }
    },
    async ({ region, status }) => {
      if (region) setFilter({ region })
      if (status) setFilter({ status })
      const rows = orders.value.filter((o) => {
        if (region && o.region !== region) return false
        if (status && o.status !== status) return false
        return true
      })
      return {
        content: [{ type: 'text', text: JSON.stringify(rows, null, 2) }]
      }
    }
  )
}
```

在 `OrderListView.vue` 的 `onMounted` 里调用 `registerOrderTools`。工具 handler 里应复用页面已有的 `setFilter`，不要在工具里另写一套查询逻辑——否则 AI 改筛选后，表格和 Pinia 会对不上。

❌ 在工具回调里直接 `fetch('/api/orders')` 但不更新 Pinia → 页面表格仍显示旧数据。✅ 工具调用走同一套 `setFilter` + 响应式 `orders`，AI 与人工操作看到同一份列表。

## 挂上 TinyRemoter：对话入口与遥控器模式

工具注册完，还需要一个 UI 让业务同学「说人话」触发 Agent。`TinyRemoter` 提供 `remoter`（右下角悬浮图标）和 `chat-dialog`（侧边对话框）两种 `mode`，默认 `remoter`。

在 `App.vue` 挂载（`:session-id` 绑定 `setupWebMcp` 里连接 WebAgent 后写入的 `sessionId`，见下一节）：

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { TinyRemoter } from '@opentiny/next-remoter'
import '@opentiny/next-remoter/dist/style.css'
import { useWebMcp } from './mcp/useWebMcp'

const { sessionId } = useWebMcp()
const show = ref(false)
</script>

<template>
  <router-view />
  <TinyRemoter
    v-model:show="show"
    mode="remoter"
    title="订单助手"
    :session-id="sessionId"
    agent-root="https://agent.opentiny.design"
    system-prompt="你是订单列表助手，优先调用 list_orders 工具回答查询。"
  />
</template>
```

官方文档里，`agentRoot` 是后端 Web Agent 代理地址；`sessionId` 由 Client 连接 WebAgent 后返回。`llmConfig` 与 `llmConfigs` 同时传入时，`llmConfig` 优先生效——多模型场景只传 `llmConfigs` 更省心，避免配置打架。

<!-- 素材待补：TinyRemoter remoter 悬浮入口 / chat-dialog 模式 GIF 或截图 -->

## 连接 WebAgent：sessionId 是对话与页面的「挂钩」

Client 在配对 Server transport 之后，还需要一次 `connect({ agent: true, url })` 向 WebAgent 注册，拿到 `sessionId` 供 TinyRemoter 使用。

在 `setupWebMcp` 末尾追加（URL 来自 `@opentiny/next-sdk` README 公开的试用端点）：

```typescript
const AGENT_URL = 'https://agent.opentiny.design/api/v1/webmcp-trial/mcp'

const { sessionId: sid } = await client.connect({
  agent: true,
  url: AGENT_URL
} as ClientConnectOptions)
sessionId.value = sid
console.log('[WebMCP] sessionId:', sid)
```

**素材缺口说明**：若你的环境无法访问上述试用端点，或企业内网 WebAgent 地址/认证方式不可公开，请替换为运维提供的代理 URL，并自行处理 token——本文不编造内网地址。扫码登录（`qrCodeUrl`）依赖可公开的 Remoter 落地页，生产环境需维护者确认是否可写入文档。

验收：打开页面 → 点击 TinyRemoter 图标 → 输入「列出华东区已发货订单」→ 看工具是否被调用、表格筛选是否同步。Agent 已连上但工具不触发时，先查本地 Server 工具是否在 Remoter 的已启用工具列表里。

<!-- 素材待补：WebAgent 扫码登录流程截图（若可公开） -->

## 工程化扩展：多路由、多模型与自定义渲染

订单列表示例跑通后，常见扩展有三类——点到为止，不展开 GenUI 生产方案：

1. **多路由多工具**：每个 `views/*.vue` 在 `onMounted` 注册本页工具，在 `onUnmounted` 调用 `server` 侧注销（若 API 支持）或整页刷新时重建 Server。避免多个页面重复注册同名工具。
2. **多模型切换**：给 TinyRemoter 传 `llmConfigs` 数组，用 `v-model:selectedModelId` 控制当前模型；每项需 `id`、`label`、`model` 及 Provider 配置。
3. **自定义流渲染**：监听 `before-ai-render`，配合 `registerContentRenderer` 处理 Markdown 以外的消息类型——订单场景里可用于把工具返回的 JSON 渲染成表格卡片。

<!-- 素材待补：多模型切换 UI 截图 -->

## 上线前检查清单

| 检查项 | 说明 |
| --- | --- |
| transport 成对连接 | Server / Client 均 `connect` 成功，无 unhandled rejection |
| 工具与 UI 状态一致 | 工具改筛选后，表格与 Pinia 同步 |
| session 生命周期 | 页面 `pagehide` / `beforeunload` 时按需 `terminateSession`（见官方 runtime 示例） |
| 构建体积 | `@opentiny/next-remoter` 含 UI 与依赖，建议路由级懒加载 Remoter 或拆 chunk |
| 敏感信息 | 生产 `llmConfig.apiKey`、`agentRoot` 走环境变量，勿提交仓库 |

按 `@opentiny/next-sdk` README，WebMCP 方案兼容 Chrome 内置 WebMCP 协议——若目标浏览器支持原生 `navigator.modelContext`，可评估是否叠加 polyfill，本文不展开。

## 关于 OpenTiny NEXT

OpenTiny NEXT 是一套企业智能前端开发解决方案，以生成式 UI 和 WebMCP 两大核心技术为基础，对现有传统的 TinyVue 组件库、TinyEngine 低代码引擎等产品进行智能化升级，构建出面向 Agent 应用的前端 NEXT-SDKs、AI Extension、TinyRobot 智能助手、GenUI 等新产品，实现 AI 理解用户意图自主完成任务，加速企业应用的智能化改造。

欢迎加入 OpenTiny 开源社区。添加微信小助手：opentiny-official 一起参与交流前端技术～
OpenTiny 官网：[opentiny.design](https://opentiny.design)
WebMCP SDK 代码仓库：[github.com/opentiny/webmcp-sdk](https://github.com/opentiny/webmcp-sdk)（欢迎 star ⭐）
如果你也想要共建，可以进入代码仓库，找到 good first issue 标签，一起参与开源贡献～如果你有任何问题，欢迎在评论区留言交流！
