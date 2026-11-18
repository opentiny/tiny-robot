<script setup>
import { useData } from 'vitepress'
const { theme } = useData()
</script>

# React 接入

在 React 应用中使用 `tr-chat` Web Component，通过 DOM ref 接入聊天服务并使用 JSX 定制内容。以下示例适用于 React 19。

## 基础接入

1. 安装 Chat 包：

   ```sh
   pnpm add -E @opentiny/tiny-robot-chat@1.0.1-alpha.1
   ```

2. 在浏览器入口、首次渲染前注册元素并引入样式：

   ```ts
   import { defineTrChatElements } from '@opentiny/tiny-robot-chat/experimental'
   import '@opentiny/tiny-robot-chat/experimental/web-component.css'

   defineTrChatElements()
   ```

3. 在 TypeScript 项目中添加 `src/custom-elements.d.ts`：

   ```ts
   import type { DetailedHTMLProps, HTMLAttributes } from 'react'
   import type { TrChatHTMLElement } from '@opentiny/tiny-robot-chat/experimental'

   declare module 'react' {
     namespace JSX {
       interface IntrinsicElements {
         'tr-chat': DetailedHTMLProps<HTMLAttributes<TrChatHTMLElement>, TrChatHTMLElement>
       }
     }
   }
   ```

## 基础用法

创建 `src/chat-panel.tsx`，在已有页面中使用 `<ChatPanel />`。Runtime 在 effect 内创建，在清理函数中释放：

```tsx
import { useLayoutEffect, useRef } from 'react'
import { createChatRuntime, type ChatRuntimeActionErrorPayload } from '@opentiny/tiny-robot-chat'
import type { TrChatHTMLElement } from '@opentiny/tiny-robot-chat/experimental'

export function ChatPanel() {
  const ref = useRef<TrChatHTMLElement>(null)
  useLayoutEffect(() => {
    const chat = ref.current!
    const owned = createChatRuntime({
      modelProviders: [
        {
          type: 'openai',
          apiUrl: new URL('/api/chat/completions', location.origin).href,
          models: [{ id: 'your-model-id', label: '应用助手' }],
        },
      ],
    })
    const onRuntimeError = (event: CustomEvent<[ChatRuntimeActionErrorPayload]>) =>
      console.error(event.detail[0].action, event.detail[0].error)
    const onReady = () => {
      void chat.focusInput()
    }
    chat.addEventListener('runtime-action-error', onRuntimeError)
    chat.addEventListener('ready', onReady)
    chat.runtime = owned.runtime
    chat.ui = { welcome: { title: '有什么可以帮你？' } }
    return () => {
      chat.removeEventListener('runtime-action-error', onRuntimeError)
      chat.removeEventListener('ready', onReady)
      void owned.dispose().catch(console.error)
    }
  }, [])
  return <tr-chat ref={ref} style={{ display: 'block', height: '100dvh' }} />
}
```

替换模型 ID，并由应用提供 `/api/chat/completions` 接口或对应代理。Runtime 的模型、历史存储和 MCP 配置见 [Runtime](./runtime)。React StrictMode 的重新挂载会创建独立 Runtime 实例。

`runtime`、`ui` 等对象通过元素属性赋值。DOM 事件用 `addEventListener()` 监听，在 effect 清理时移除；事件参数从 `event.detail[0]` 读取。示例在 `ready` 后调用 `focusInput()`；完整清单见 [事件](./index#事件)和[元素方法](./index#元素方法)。

## 普通 Slot

普通 Slot 用 `slot` 指定内容区域，节点中的文本、事件和条件显示由 React 管理。

从 React 导入 `useState`，在 `ChatPanel` 内增加状态，并将返回的 JSX 替换为：

```tsx
const [showTip, setShowTip] = useState(true)
const tip = '可以向助手咨询产品接入问题。'

return (
  <tr-chat ref={ref} style={{ display: 'block', height: '100dvh' }}>
    {showTip && (
      <div slot="welcome-footer">
        <span>{tip}</span>
        <button type="button" onClick={() => setShowTip(false)}>
          关闭提示
        </button>
      </div>
    )}
  </tr-chat>
)
```

条件渲染包含带 `slot` 的整个节点，关闭提示时移除该 Slot 节点。保留空节点仍表示提供了 Slot。其他区域名称见 [普通 Slot](./customization#普通-slot)。

## Scoped Slot

Scoped Slot 通过 `renderers` 配置：回调接收当前区域的数据和操作，返回 DOM 内容。`bubble-after` 的上下文包含当前气泡的 `role`、`messages`，可据此在助手回复下方添加复制按钮。

`fromReact()` 将 JSX 挂载到回调返回的 DOM 容器。将下面两个模块保存为 `src/chat/react-renderer.tsx`、`src/chat/reply-actions.tsx`：

::: details 辅助函数：React 视图挂载与回复复制

<<< ../../../examples/tr-chat-app-react/src/chat/react-renderer.tsx [src/chat/react-renderer.tsx]

```tsx [src/chat/reply-actions.tsx]
import { useLayoutEffect, useRef, useState } from 'react'
import type { ChatBubbleSlotProps, ChatMessageItem } from '@opentiny/tiny-robot-chat'

/** 复制助手可读正文，保留 Markdown，不包含思考过程和工具信息。 */
export function replyText(scope: ChatBubbleSlotProps): string {
  if (
    scope.role !== 'assistant' ||
    scope.messages.some(
      (message: ChatMessageItem) =>
        message.loading || (message.streamState !== undefined && message.streamState !== 'finished'),
    )
  )
    return ''
  return scope.messages
    .filter((message) => message.role === 'assistant')
    .map((message) => {
      if (typeof message.content === 'string') return message.content
      return (message.content ?? [])
        .filter((item) => item.type === 'text' && typeof item.text === 'string')
        .map((item) => item.text)
        .join('\n\n')
    })
    .filter(Boolean)
    .join('\n\n')
}

export function CopyReply({ text }: { text: string }) {
  const [status, setStatus] = useState('复制')
  const [busy, setBusy] = useState(false)
  const mounted = useRef(false)
  useLayoutEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])
  const copy = async () => {
    setBusy(true)
    let label = '已复制'
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      label = '复制失败，点击重试'
    }
    if (mounted.current) {
      setStatus(label)
      setBusy(false)
    }
  }
  return (
    <div className="reply-actions">
      <button
        type="button"
        className="reply-copy"
        disabled={busy}
        aria-label={status === '复制' ? '复制回复' : status}
        onClick={copy}
      >
        <span className="copy-label" aria-live="polite">
          {status}
        </span>
      </button>
    </div>
  )
}
```

:::

在 `src/chat-panel.tsx` 的组件外定义 Renderer 配置：

```tsx
import type { ChatRenderers } from '@opentiny/tiny-robot-chat/experimental'
import { fromReact } from './chat/react-renderer'
import { CopyReply, replyText } from './chat/reply-actions'

const renderers: ChatRenderers = {
  'bubble-after': fromReact((scope) => {
    const text = replyText(scope)
    return text ? <CopyReply text={text} /> : null
  }),
}
```

在创建 Runtime 的 effect 中，给元素赋值：

```ts
chat.renderers = renderers
```

`replyText()` 提取助手的文本正文，回复完成后显示按钮；复制保留原始 Markdown，失败时可点击重试。剪贴板写入需要 HTTPS 或 localhost。

上下文更新或视图销毁时，会触发当前回调的 `signal` 中止事件，辅助函数据此卸载 React root。需要跨更新保留的编辑状态由宿主组件持有。其他 Renderer 与上下文见 [Scoped Slot](./customization#scoped-slot-renderers)。

## Bubble Renderers

`bubbleRenderers` 用于定制消息正文。下面匹配助手的 `text` 内容项，使用应用自己的 Markdown-it 解析器生成正文。默认的用户消息 Markdown 渲染继续可用。

1. 安装解析与 HTML 清理依赖：

   ```sh
   pnpm add markdown-it dompurify
   pnpm add -D @types/markdown-it
   ```

2. 创建 `src/chat/markdown.ts`：

   ```ts
   import MarkdownIt from 'markdown-it'
   import DOMPurify from 'dompurify'
   import type { ChatBubbleRenderers } from '@opentiny/tiny-robot-chat/experimental'

   const markdown = new MarkdownIt({ html: false, linkify: true })
   export const bubbleRenderers: ChatBubbleRenderers = {
     contentRendererMatches: [
       {
         find: (message, content) => message.role === 'assistant' && content.type === 'text',
         renderer: ({ content }) => {
           const article = document.createElement('article')
           article.className = 'assistant-markdown'
           article.innerHTML = DOMPurify.sanitize(markdown.render(typeof content.text === 'string' ? content.text : ''))
           return article
         },
       },
     ],
   }
   ```

3. 在 `src/chat-panel.tsx` 导入配置，在创建 Runtime 的 effect 中赋给元素：

   ```ts
   import { bubbleRenderers } from './chat/markdown'

   // useLayoutEffect 回调内，chat 为 ref.current
   chat.bubbleRenderers = bubbleRenderers
   ```

在 `markdown` 实例上配置规则或插件，在应用样式中设置 `.assistant-markdown` 的排版。生成的 HTML 经过 DOMPurify 清理。未匹配的内容继续使用组件默认的渲染方式。更多配置项和回调参数见 [Bubble 消息正文](./customization#bubble-消息正文)。

完整项目代码可以查看 <a :href="`${theme.sourceLinks.treeBase}/examples/tr-chat-app-react`" target="_blank" rel="noreferrer">React 示例项目</a>，安装和运行步骤见 <a :href="`${theme.sourceLinks.blobBase}/examples/tr-chat-app-react/README.md`" target="_blank" rel="noreferrer">项目 README</a>。

## 完整示例

示例的 `/chat` 页面通过 Runtime 接入聊天服务，使用 Markdown-it 渲染助手消息，并在回复下方提供复制按钮。主要代码如下：

<<< ../../../examples/tr-chat-app-react/src/pages/chat-page.tsx [chat-page.tsx]
