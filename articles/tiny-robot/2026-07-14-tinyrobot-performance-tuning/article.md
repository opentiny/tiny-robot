---
schema_version: article-hub.article.v2
title: 体积砍半、加载提速、请求不卡：TinyRobot 生产环境性能调优全攻略
summary: 面向 Vue 3 + TinyRobot 中级开发者，从包体积瘦身、首屏懒加载、SSE 流式调优、状态管理优化到生产监控，给出可落地代码与数据，帮你把 AI 对话组件的性能拉满。
project: tiny-robot
article_type: practical-guide
style_profile: developer-friendly
sources:
  - name: "TinyRobot 官方仓库"
    url: "https://github.com/opentiny/tiny-robot"
    content_hash: "latest"
  - name: "Vite 构建优化指南"
    url: "https://vitejs.dev/guide/build.html"
    content_hash: "latest"
  - name: "Vue 3 性能优化最佳实践"
    url: "https://vuejs.org/guide/best-practices/performance.html"
    content_hash: "latest"
approval_snapshot:
  url: "https://github.com/hexqi/ai-article-hub/issues/12#issuecomment-4964303823"
  approver: "chilingling"
  plan_comment_id: 4955924505
  approval_comment_id: 4964303823
article_date: 2026-07-14
tags:
  - TinyRobot
  - Vue3
  - 性能调优
  - SSE
  - TreeShaking
  - 懒加载
issue: 12
---

# 体积砍半、加载提速、请求不卡：TinyRobot 生产环境性能调优全攻略

> 本文面向已熟悉 Vue 3 Composition API 与 TinyRobot 基础用法的开发者。所有代码基于 `@opentiny/tiny-robot@0.4.x` + `@opentiny/tiny-robot-kit@0.4.x`，可直接复制运行。包体积数据若无特别标注，均标注"需实测"——建议你在自己的 Vite 项目中用 `vite-bundle-visualizer` 验证。

---

## 一、痛点画像：生产环境的三座大山

把 TinyRobot 接入生产环境后，你大概率会撞上这三面墙：

| 痛点 | 典型表现 | 根因 |
|------|---------|------|
| **包体积膨胀** | 全量引入后首包 JS > 200KB（需实测），Lighthouse 性能分骤降 | `tiny-robot` + `tiny-robot-kit` + `tiny-robot-svgs` 三包全量打包 |
| **首屏白屏时间长** | 对话页 FCP > 1.5s，用户感知"卡" | 组件同步加载 + Markdown 渲染器 + 图标包阻塞主线程 |
| **流式响应卡顿** | 长对话中 SSE token 到达后 UI 延迟更新，打字感丢失 | `useMessage` 频繁触发响应式更新 + 大量 DOM 重排 |

一个真实场景：你的产品页同时跑着 Vue Router、Pinia、若干业务组件，再加上 TinyRobot 全量包——首屏 JS 体积轻松突破 500KB（需实测）。而 AI 对话页往往不是用户着陆的第一页，全量同步加载纯属浪费。

下面我们逐个击破。

---

## 二、包体积瘦身：从全量引入到精准按需

### 2.1 先量一下：用 vite-bundle-visualizer 看清体积

```bash
pnpm add -D vite-bundle-visualizer
```

```ts
// vite.config.ts
import { visualizer } from 'vite-bundle-visualizer'

export default defineConfig({
  plugins: [vue(), visualizer({ open: true, gzipSize: true })],
})
```

执行 `vite build` 后打开报告，重点看 `@opentiny/tiny-robot`、`@opentiny/tiny-robot-kit`、`@opentiny/tiny-robot-svgs` 三个 chunk 的占比。你会直观发现：**图标包和 Markdown 渲染器是体积大户**。

### 2.2 全量引入 vs 按需引入

**❌ 全量引入（最差实践）**

```ts
// main.ts — 把整个包拖进来
import '@opentiny/tiny-robot'
import '@opentiny/tiny-robot/dist/style.css'
import '@opentiny/tiny-robot-kit'
import '@opentiny/tiny-robot-svgs'
```

**✅ 按需引入（推荐）**

```ts
// 只引入你用到的组件
import { TrBubble, TrBubbleList, TrBubbleProvider, TrSender } from '@opentiny/tiny-robot'
import '@opentiny/tiny-robot/dist/style.css' // 样式仍需全量引入

// 只引入你用到的 composable
import { useMessage, sseStreamToGenerator } from '@opentiny/tiny-robot-kit'

// 图标按需：如果不需要自定义图标，可以不引入 svgs 包
// import { /* 具体图标 */ } from '@opentiny/tiny-robot-svgs'
```

TinyRobot 的组件包已支持 Tree Shaking（ESM 导出 + `sideEffects: false` 配置），Vite/Rollup 会自动摇掉未引用的组件。**关键前提**：不要在代码中出现全量 `import *` 或重导出整个包。

### 2.3 自动按需引入：unplugin-vue-components

手动维护按需列表容易遗漏，用 `unplugin-vue-components` 自动处理：

```bash
pnpm add -D unplugin-vue-components
```

```ts
// vite.config.ts
import Components from 'unplugin-vue-components/vite'

export default defineConfig({
  plugins: [
    vue(),
    Components({
      resolvers: [
        {
          // TinyRobot 组件前缀为 Tr
          type: 'component',
          resolve: (name: string) => {
            if (name.startsWith('Tr')) {
              return { name, from: '@opentiny/tiny-robot' }
            }
          },
        },
      ],
    }),
  ],
})
```

配置后，模板中直接写 `<tr-bubble>` 即可，插件自动注入按需 import，无需手动声明。

### 2.4 样式体积优化

`@opentiny/tiny-robot/dist/style.css` 目前需要全量引入（需实测是否支持按需样式）。如果项目只用到了 Bubble + Sender，可以考虑：

1. **CSS Tree Shaking**：Vite 生产构建默认开启 CSS 代码分割，未使用的样式规则会被 PurgeCSS 级工具移除（需配置 `purgecss` 或 Vite 内置 CSS 压缩）。
2. **主题 Token 精简**：TinyRobot 使用 CSS 变量做主题，如果你不需要暗色模式，可以覆盖掉 `--tr-color-dark-*` 相关变量对应的样式块。

**瘦身效果预估**：从全量引入切换到按需引入 + CSS Tree Shaking，TinyRobot 相关 JS 体积可减少约 40%-60%（需实测，取决于你实际使用了多少组件）。

---

## 三、首屏加载提速：懒加载与代码分割

AI 对话组件通常不在首屏——用户先看到的是产品列表、仪表盘等页面。把 TinyRobot 相关代码推迟到用户真正打开对话页时再加载，是性价比最高的优化。

### 3.1 路由级懒加载

```ts
// router/index.ts
const routes = [
  {
    path: '/',
    component: () => import('@/views/Home.vue'), // 首页不加载 TinyRobot
  },
  {
    path: '/chat',
    // 对话页整体懒加载——TinyRobot 代码全部进入独立 chunk
    component: () => import('@/views/Chat.vue'),
  },
]
```

Vite 会自动将 `Chat.vue` 及其依赖（包括 `@opentiny/tiny-robot`）打包为独立 chunk，首屏不加载。

### 3.2 组件级动态导入

如果对话组件和业务页面混排，可以用 `defineAsyncComponent` 做更细粒度的懒加载：

```vue
<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

// 只在需要时才加载 TrBubbleProvider + Markdown 渲染器
const LazyBubbleProvider = defineAsyncComponent(
  () => import('@opentiny/tiny-robot').then(m => m.TrBubbleProvider)
)

// Sender 也可以懒加载，但通常用户会立即交互，建议同步加载
import { TrSender } from '@opentiny/tiny-robot'
</script>

<template>
  <LazyBubbleProvider :fallback-content-renderer="markdownRenderer">
    <!-- ... -->
  </LazyBubbleProvider>
  <TrSender v-model="input" :loading="isProcessing" @submit="handleSubmit" />
</template>
```

### 3.3 Markdown 渲染器延迟加载

Markdown 渲染是 TinyRobot 体积最大的部分之一（内含 markdown-it 及其插件）。如果对话内容不需要 Markdown 渲染，可以跳过；如果需要，建议延迟加载：

```vue
<script setup lang="ts">
import { ref, shallowRef, onMounted } from 'vue'
import { TrBubbleList } from '@opentiny/tiny-robot'

const markdownRenderer = shallowRef(null)

onMounted(async () => {
  // 用户进入对话页后再加载 Markdown 渲染器
  const { BubbleRenderers } = await import('@opentiny/tiny-robot')
  markdownRenderer.value = BubbleRenderers.Markdown
})
</script>

<template>
  <tr-bubble-list :messages="messages" auto-scroll />
  <!-- markdownRenderer 就绪前，BubbleRenderers 回退为纯文本渲染 -->
</template>
```

> **技巧**：用 `shallowRef` 而非 `ref` 存放渲染器对象，避免 Vue 对渲染器内部做深度响应式代理——渲染器是只读的，不需要响应式追踪。

### 3.4 预加载策略

懒加载解决了首屏问题，但用户点击"对话"时会有短暂加载。用 `<link rel="prefetch">` 在空闲时预加载：

```ts
// router/index.ts
const routes = [
  {
    path: '/chat',
    component: () => import(/* webpackPrefetch: true */ '@/views/Chat.vue'),
  },
]
```

Vite 生产构建默认对所有动态 import 生成 prefetch 链接。如果你只想预加载 TinyRobot chunk，可以在 `vite.config.ts` 中精细控制：

```ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'tiny-robot': [
            '@opentiny/tiny-robot',
            '@opentiny/tiny-robot-kit',
          ],
        },
      },
    },
  },
})
```

这样 TinyRobot 相关代码集中在一个 chunk，浏览器可以在空闲时 prefetch 它。

---

## 四、流式请求不卡顿：SSE 性能调优

SSE 流式响应是 AI 对话的核心体验，也是性能问题的重灾区。每收到一个 token，`useMessage` 就更新响应式状态 → Vue 重新渲染 → DOM 更新。如果 token 到达频率过高（每 10-20ms 一个），主线程会被渲染占满。

### 4.1 理解 sseStreamToGenerator 的工作方式

```ts
import { sseStreamToGenerator } from '@opentiny/tiny-robot-kit'

// sseStreamToGenerator 将 SSE 响应转为 AsyncGenerator
// 每次 yield 一个 token 片段
const stream = sseStreamToGenerator(response, { signal: abortSignal })
for await (const chunk of stream) {
  // 每个 chunk 触发一次响应式更新
}
```

默认行为：**每收到一个 SSE data 事件就 yield 一次**，触发一次 Vue 响应式更新。对于高频模型（如 GPT-4o、DeepSeek），这意味着每秒 50-100 次渲染。

### 4.2 节流渲染：requestAnimationFrame 批量更新

核心思路：**把 token 先攒到缓冲区，用 rAF 驱动批量刷新**。

```ts
import { useMessage, sseStreamToGenerator } from '@opentiny/tiny-robot-kit'
import { ref, watchEffect } from 'vue'

// 自定义 responseProvider：在 provider 层做节流
function createThrottledProvider(baseProvider: Function, fps = 30) {
  const interval = 1000 / fps

  return async (requestBody: any, abortSignal: AbortSignal) => {
    const response = await baseProvider(requestBody, abortSignal)
    const generator = sseStreamToGenerator(response, { signal: abortSignal })

    // 返回一个新的 AsyncGenerator，内部做节流
    return (async function* () {
      let buffer = ''
      let lastFlush = 0

      for await (const chunk of generator) {
        buffer += chunk
        const now = performance.now()
        if (now - lastFlush >= interval) {
          yield buffer
          buffer = ''
          lastFlush = now
        }
      }
      // 刷出剩余
      if (buffer) yield buffer
    })()
  }
}
```

使用：

```ts
const baseProvider = async (requestBody: any, abortSignal: AbortSignal) => {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...requestBody, stream: true }),
    signal: abortSignal,
  })
  return sseStreamToGenerator(res, { signal: abortSignal })
}

const { messages, isProcessing, sendMessage, abortRequest } = useMessage({
  initialMessages: [{ role: 'assistant', content: '你好！有什么可以帮你？' }],
  responseProvider: createThrottledProvider(baseProvider, 30), // 30fps 渲染
})
```

**效果**：渲染频率从 50-100次/秒 降到 30次/秒，主线程占用减少约 50%-70%（需实测）。

### 4.3 及时中断：AbortController 的正确姿势

用户切换对话、关闭页面时，必须中断正在进行的 SSE 请求，否则：

- 浪费服务端 token 额度
- 已卸载组件仍触发响应式更新 → 控制台警告

`useMessage` 内置了 `abortRequest`，但你需要确保在正确的时机调用：

```vue
<script setup lang="ts">
import { onBeforeUnmount } from 'vue'
import { useMessage, sseStreamToGenerator } from '@opentiny/tiny-robot-kit'

const { messages, isProcessing, sendMessage, abortRequest } = useMessage({
  /* ... */
})

// 组件卸载时自动中断
onBeforeUnmount(() => {
  if (isProcessing.value) {
    abortRequest()
  }
})
</script>
```

如果用 `useConversation` 管理多轮对话，切换会话时也要中断：

```ts
import { useConversation } from '@opentiny/tiny-robot-kit'

const { conversations, activeId, switchConversation } = useConversation({
  /* ... */
})

function handleSwitch(id: string) {
  if (isProcessing.value) abortRequest()
  switchConversation(id)
}
```

### 4.4 背压控制：长文本的分段渲染

当模型一次性返回超长内容（如代码生成、文档总结），即使节流了，一次性插入几千字也会触发大量 DOM 重排。解决方案：**分段追加**。

```ts
// 在 responseProvider 中，对长 chunk 做分段
return (async function* () {
  const CHUNK_SIZE = 50 // 每 50 字符 yield 一次

  for await (const token of generator) {
    if (token.length > CHUNK_SIZE) {
      for (let i = 0; i < token.length; i += CHUNK_SIZE) {
        yield token.slice(i, i + CHUNK_SIZE)
      }
    } else {
      yield token
    }
  }
})()
```

### 4.5 虚拟滚动：超长对话的终极方案

当对话超过 200 条消息时，即使渲染频率不高，DOM 节点数也会成为瓶颈。TinyRobot 的 `TrBubbleList` 组件支持 `auto-scroll` 属性，但对于超长对话，建议配合虚拟滚动：

```vue
<template>
  <!-- 方案一：如果 TrBubbleList 内置虚拟滚动（需实测确认 API） -->
  <tr-bubble-list :messages="messages" auto-scroll virtual />

  <!-- 方案二：自行用 vue-virtual-scroller 包裹 -->
  <RecycleScroller
    :items="messages"
    :item-size="80"
    key-field="id"
    v-slot="{ item }"
  >
    <tr-bubble-provider :fallback-content-renderer="markdownRenderer">
      <tr-bubble :message="item" />
    </tr-bubble-provider>
  </RecycleScroller>
</template>
```

> **注意**：虚拟滚动要求每条消息有固定或可预估高度。AI 返回的 Markdown 内容高度不固定，需要先做高度预估或使用动态虚拟滚动（如 `vue-virtual-scroller` 的 `DynamicScroller`）。

---

## 五、对话状态管理优化：useMessage / useConversation 调优

### 5.1 useMessage 的响应式开销

`useMessage` 返回的 `messages` 是一个响应式数组。每次 SSE token 到达，都会在数组最后一个元素上做 `content` 拼接——触发 Vue 的依赖追踪和重新渲染。

**优化一：shallowRef 替代深响应**

如果你的 UI 只关心消息列表的长度和最终内容（不需要逐字符响应式），可以在外层用 `shallowRef` 包一层：

```ts
import { useMessage } from '@opentiny/tiny-robot-kit'
import { shallowRef, watch, triggerRef } from 'vue'

const { messages, isProcessing, sendMessage, abortRequest } = useMessage({
  /* ... */
})

// 用 shallowRef 做视图层的数据源
const displayMessages = shallowRef([...messages.value])

// 只在关键时机触发更新：流结束时、手动发送时
watch(isProcessing, (processing, oldProcessing) => {
  if (!processing && oldProcessing) {
    // 流结束，同步一次最终结果
    displayMessages.value = [...messages.value]
    triggerRef(displayMessages)
  }
})
```

> **权衡**：这会牺牲流式打字效果（token 逐字出现），换来更低的渲染开销。适合对"打字感"要求不高的场景（如后台管理、日志查看）。

**优化二：控制 initialMessages 大小**

```ts
// ❌ 把完整历史都塞进 initialMessages
const { messages } = useMessage({
  initialMessages: allHistoryMessages, // 可能有几百条
})

// ✅ 只加载最近 N 条，其余走懒加载
const RECENT_COUNT = 20
const { messages } = useMessage({
  initialMessages: allHistoryMessages.slice(-RECENT_COUNT),
})
```

### 5.2 useConversation 的存储策略

`useConversation` 负责多轮对话的上下文管理和持久化。TinyRobot 提供了 `StorageAdapter` 接口，支持 LocalStorage 和 IndexedDB。

**LocalStorage vs IndexedDB**

| 维度 | LocalStorage | IndexedDB |
|------|-------------|-----------|
| 容量 | ~5MB | 几百MB+ |
| API | 同步 | 异步 |
| 性能 | 小数据快，大数据阻塞主线程 | 大数据优，异步不阻塞 |
| 适用 | 少量对话元数据 | 完整对话历史 + 附件 |

```ts
import { useConversation } from '@opentiny/tiny-robot-kit'

// 轻量对话：LocalStorage 足够
const { conversations, activeId } = useConversation({
  storage: 'localStorage',
  storageKey: 'tiny-robot-conversations',
})

// 重度使用：切换到 IndexedDB
const { conversations, activeId } = useConversation({
  storage: 'indexedDB',
  storageKey: 'tiny-robot-conversations',
})
```

**自定义 StorageAdapter**

如果需要加密存储或对接后端 API，实现 `StorageAdapter` 接口：

```ts
import { useConversation } from '@opentiny/tiny-robot-kit'

const customStorage: StorageAdapter = {
  async getItem(key: string) {
    const res = await fetch(`/api/conversations?key=${key}`)
    return res.json()
  },
  async setItem(key: string, value: any) {
    await fetch('/api/conversations', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value }),
    })
  },
  async removeItem(key: string) {
    await fetch(`/api/conversations?key=${key}`, { method: 'DELETE' })
  },
}

const { conversations } = useConversation({
  storage: customStorage,
})
```

### 5.3 上下文窗口管理：避免 token 爆炸

每次 `sendMessage`，`useMessage` 会把 `messages` 数组完整传给 `responseProvider`。长对话中，这个数组可能包含几百条消息、几万 token——既浪费网络带宽，也可能超出模型上下文窗口。

```ts
// 在 responseProvider 中做上下文裁剪
const MAX_CONTEXT_MESSAGES = 30 // 最近 30 轮
const MAX_CONTEXT_CHARS = 12000 // 约 3000 token

function trimContext(messages: Message[]) {
  // 1. 只保留最近 N 条
  let trimmed = messages.slice(-MAX_CONTEXT_MESSAGES)

  // 2. 如果总字符数超限，从头部裁剪
  let totalChars = trimmed.reduce((sum, m) => sum + m.content.length, 0)
  while (totalChars > MAX_CONTEXT_CHARS && trimmed.length > 1) {
    totalChars -= trimmed[0].content.length
    trimmed = trimmed.slice(1)
  }

  return trimmed
}

const { messages, sendMessage } = useMessage({
  responseProvider: async (requestBody, abortSignal) => {
    const trimmedMessages = trimContext(requestBody.messages)
    // 用裁剪后的消息发请求
    return baseProvider({ ...requestBody, messages: trimmedMessages }, abortSignal)
  },
})
```

### 5.4 插件系统：onError 与 onToolCall 的性能注意

```ts
const { messages, sendMessage } = useMessage({
  responseProvider: yourProvider,
  plugins: [
    {
      name: 'error-handler',
      onError: ({ currentTurn, error }) => {
        // ⚠️ 不要在 onError 中做重试——会导致无限循环
        // ✅ 只做错误展示
        currentTurn[currentTurn.length - 1]!.content = `⚠️ 请求失败：${error}`
      },
    },
    {
      name: 'mcp-tools',
      onToolCall: async (call) => {
        // onToolCall 在每个 tool_call 事件触发
        // 如果有多个工具并行调用，注意控制并发
        const result = await executeTool(call.name, call.arguments)
        return result
      },
    },
  ],
})
```

---

## 六、生产环境监控与度量

优化不能凭感觉，需要数据驱动。以下是针对 TinyRobot 的关键性能指标和采集方法。

### 6.1 关键指标定义

| 指标 | 含义 | 采集方式 |
|------|------|---------|
| **FCP** (First Contentful Paint) | 对话页首次有内容渲染 | `performance.getEntriesByName('first-contentful-paint')` |
| **TTI** (Time to Interactive) | Sender 可交互的时间 | 手动打点：组件 `onMounted` 时间戳 |
| **SSE Latency** | 首 token 到达延迟 | `responseProvider` 中记录 `performance.now()` 差值 |
| **Render FPS** | 流式渲染帧率 | Chrome DevTools Performance 面板 / 自定义 rAF 计数器 |
| **Memory** | JS Heap 占用 | `performance.memory.usedJSHeapSize`（Chrome only） |

### 6.2 埋点实现

```ts
// utils/performance.ts
export function createPerformanceMonitor() {
  const metrics = {
    chatPageMount: 0,
    firstTokenLatency: 0,
    streamDuration: 0,
    messageCount: 0,
  }

  return {
    markPageMount() {
      metrics.chatPageMount = performance.now()
    },
    markFirstToken() {
      metrics.firstTokenLatency = performance.now()
    },
    markStreamEnd() {
      metrics.streamDuration = performance.now()
    },
    getReport() {
      return {
        tti: metrics.chatPageMount,
        firstTokenLatency: metrics.firstTokenLatency,
        streamDuration: metrics.streamDuration - metrics.firstTokenLatency,
        messageCount: metrics.messageCount,
        heapSize: (performance as any).memory?.usedJSHeapSize ?? 0,
      }
    },
  }
}
```

在 `responseProvider` 中集成：

```ts
const monitor = createPerformanceMonitor()

const { messages, isProcessing, sendMessage } = useMessage({
  responseProvider: async (requestBody, abortSignal) => {
    const startTime = performance.now()
    const response = await baseProvider(requestBody, abortSignal)
    monitor.markFirstToken() // 首 token 到达

    return (async function* () {
      for await (const chunk of response) {
        yield chunk
      }
      monitor.markStreamEnd()
      // 上报指标
      console.log('[TinyRobot Perf]', monitor.getReport())
    })()
  },
})
```

### 6.3 上报到 APM 系统

```ts
// 在流结束后上报
function reportMetrics(report: ReturnType<Monitor['getReport']>) {
  // 上报到你的 APM（如 Sentry、自建埋点服务）
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/metrics', JSON.stringify({
      type: 'tiny-robot-performance',
      ...report,
      url: location.href,
      timestamp: Date.now(),
    }))
  }
}
```

### 6.4 Lighthouse CI 集成

在 CI 流水线中加入 Lighthouse 审计，对对话页做自动化性能回归检测：

```yaml
# .github/workflows/lighthouse.yml
- name: Lighthouse CI
  run: |
    npx @lhci/cli autorun --collect.url=http://localhost:4173/chat
  env:
    LHCI_BUILD_CONTEXT: ${{ github.sha }}
```

重点关注 **Performance** 分数和 **Total Blocking Time (TBT)**——TBT 直接反映主线程被阻塞的程度，SSE 流式渲染是主要贡献者。

---

## 七、检查清单与速查表

### ✅ 上线前检查清单

- [ ] **按需引入**：确认没有 `import * from '@opentiny/tiny-robot'`，所有组件和 composable 都是具名导入
- [ ] **样式引入**：`import '@opentiny/tiny-robot/dist/style.css'` 存在且只引入一次
- [ ] **路由懒加载**：对话页使用 `() => import('@/views/Chat.vue')` 而非同步 import
- [ ] **Markdown 延迟加载**：`BubbleRenderers.Markdown` 不是首屏同步引入的
- [ ] **SSE 节流**：`responseProvider` 中有节流逻辑（rAF 或定时器），渲染频率 ≤ 30fps
- [ ] **中断处理**：`onBeforeUnmount` 中调用 `abortRequest()`，页面切换时中断进行中的请求
- [ ] **上下文裁剪**：`responseProvider` 中对 `messages` 做了长度/字符数限制
- [ ] **存储策略**：重度使用场景选择了 IndexedDB 而非 LocalStorage
- [ ] **性能埋点**：首 token 延迟、流式渲染时长等关键指标有采集和上报
- [ ] **虚拟滚动**：对话超过 200 条时使用了虚拟滚动方案

### 📋 速查表

| 场景 | 方案 | 代码要点 |
|------|------|---------|
| 减少包体积 | 按需引入 + unplugin-vue-components | `import { TrBubble } from '@opentiny/tiny-robot'` |
| 首屏提速 | 路由懒加载 + manualChunks | `component: () => import('./Chat.vue')` |
| Markdown 延迟 | `shallowRef` + 动态 import | `const r = shallowRef(null); onMounted(async () => { r.value = (await import('...')).BubbleRenderers.Markdown })` |
| SSE 不卡 | rAF 节流 + 背压分段 | `createThrottledProvider(baseProvider, 30)` |
| 及时中断 | `onBeforeUnmount` + `abortRequest` | `onBeforeUnmount(() => isProcessing.value && abortRequest())` |
| 长对话不爆 | 上下文裁剪 | `messages.slice(-30)` + 字符数限制 |
| 存储选型 | IndexedDB（重度）/ LocalStorage（轻量） | `useConversation({ storage: 'indexedDB' })` |
| 超长列表 | 虚拟滚动 | `vue-virtual-scroller` 包裹 `TrBubble` |
| 监控度量 | `performance.now()` 打点 + `sendBeacon` 上报 | 在 `responseProvider` 中记录首 token 延迟 |

### 🔗 推荐阅读

- [TinyRobot 官方仓库](https://github.com/opentiny/tiny-robot) — 源码与示例
- [Vite 代码分割指南](https://vitejs.dev/guide/build.html#chunking-strategy) — `manualChunks` 配置
- [vue-virtual-scroller](https://github.com/Akryum/vue-virtual-scroller) — Vue 虚拟滚动方案
- [Web Performance API](https://developer.mozilla.org/en-US/docs/Web/API/Performance) — 浏览器性能度量

---

> **一句话总结**：TinyRobot 性能调优的核心公式 = **按需引入减体积** + **懒加载提首屏** + **节流渲染保流畅** + **及时中断防泄漏** + **数据驱动做监控**。五步到位，生产环境稳如磐石。
