<script setup>
import { useData } from 'vitepress'
const { theme } = useData()
</script>

# Angular 接入

在 Angular 应用中使用 `tr-chat` Web Component，接入聊天服务并通过 Angular 模板定制内容。以下示例适用于 Angular 20 的 standalone 组件。

## 基础接入

1. 安装 Chat 包：

   ```sh
   pnpm add -E @opentiny/tiny-robot-chat@1.0.1-alpha.1
   ```

2. 在 `src/main.ts` 注册元素并启动应用：

   ```ts
   import { bootstrapApplication } from '@angular/platform-browser'
   import { defineTrChatElements } from '@opentiny/tiny-robot-chat/experimental'
   import { AppComponent } from './app.component'

   defineTrChatElements()
   bootstrapApplication(AppComponent).catch(console.error)
   ```

3. 在 `angular.json` 的 `build.options.styles` 中加入样式，保留应用已有条目：

   ```json
   {
     "styles": ["node_modules/@opentiny/tiny-robot-chat/dist/web-component.css", "src/styles.css"]
   }
   ```

## 基础用法

在 `src/app.component.ts` 创建 Runtime，通过属性绑定传给元素。`CUSTOM_ELEMENTS_SCHEMA` 配置在实际使用元素的 Angular 组件上。

```ts
import { Component, CUSTOM_ELEMENTS_SCHEMA, DestroyRef, inject } from '@angular/core'
import { createChatRuntime, type ChatRuntimeActionErrorPayload, type ChatUIOptions } from '@opentiny/tiny-robot-chat'
import type { TrChatHTMLElement } from '@opentiny/tiny-robot-chat/experimental'

@Component({
  selector: 'app-root',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <tr-chat
      #chat
      [runtime]="runtime"
      [ui]="ui"
      (runtime-action-error)="onRuntimeError($event)"
      (ready)="focusChat(chat)"
    ></tr-chat>
  `,
  styles: [':host { display: block; height: 100dvh; } tr-chat { display: block; height: 100%; }'],
})
export class AppComponent {
  private readonly owned = createChatRuntime({
    modelProviders: [
      {
        type: 'openai',
        apiUrl: new URL('/api/chat/completions', location.origin).href,
        models: [{ id: 'your-model-id', label: '应用助手' }],
      },
    ],
  })
  readonly runtime = this.owned.runtime
  ui: ChatUIOptions = { welcome: { title: '有什么可以帮你？' } }

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      void this.owned.dispose().catch(console.error)
    })
  }
  onRuntimeError(event: Event) {
    const [payload] = (event as CustomEvent<[ChatRuntimeActionErrorPayload]>).detail
    console.error(payload.action, payload.error)
  }
  focusChat(element: HTMLElement) {
    void (element as TrChatHTMLElement).focusInput()
  }
}
```

替换模型 ID，并由应用提供 `/api/chat/completions` 接口或对应代理。Runtime 的模型、历史存储和 MCP 配置见 [Runtime](./runtime)。创建 Runtime 的组件销毁时调用 `dispose()`。

`runtime`、`ui` 等对象通过属性绑定传入。DOM 事件使用 `(runtime-action-error)` 等模板语法监听，参数从 `$event.detail[0]` 读取。示例在元素发出 `ready` 后调用 `focusInput()`；完整事件与方法清单见 [事件](./index#事件)和[元素方法](./index#元素方法)。

## 普通 Slot

普通 Slot 用 `slot` 指定内容区域，节点里的文本绑定、事件和条件显示由 Angular 管理。

在 `AppComponent` 中增加字段：

```ts
showTip = true
tip = '可以向助手咨询产品接入问题。'
```

将组件模板替换为：

```html
<tr-chat [runtime]="runtime" [ui]="ui">
  @if (showTip) {
  <div slot="welcome-footer">
    <span>{{ tip }}</span>
    <button type="button" (click)="showTip = false">关闭提示</button>
  </div>
  }
</tr-chat>
```

`@if` 放在带 `slot` 的整个节点外层，关闭提示时移除该 Slot 节点。保留空节点仍表示提供了 Slot。其他区域名称见 [普通 Slot](./customization#普通-slot)。

## Scoped Slot

Scoped Slot 通过 `renderers` 配置：回调接收当前区域的数据和操作，返回 DOM 内容。`bubble-after` 的上下文包含当前气泡的 `role`、`messages`，可据此在助手回复下方添加复制按钮。

Angular 模板通过 `fromTemplate()` 挂载到回调返回的 DOM 容器，绑定和点击事件继续由 Angular 处理。将下方辅助代码保存为 `src/chat/template-renderer.ts`、`src/chat/reply-actions.ts`。

:::: details 辅助函数：模板挂载与回复复制

::: code-group
<<< ../../../examples/tr-chat-app-angular/src/chat/template-renderer.ts [src/chat/template-renderer.ts]
<<< ../../../examples/tr-chat-app-angular/src/chat/reply-actions.ts [src/chat/reply-actions.ts]
:::

::::

在 `src/app.component.ts` 新增导入：

```ts
import { afterNextRender, ApplicationRef, ChangeDetectorRef, NgZone, TemplateRef, ViewChild } from '@angular/core'
import type { ChatBubbleSlotProps } from '@opentiny/tiny-robot-chat'
import type { ChatRenderers } from '@opentiny/tiny-robot-chat/experimental'
import { fromTemplate } from './chat/template-renderer'
import { copyReply, replyText } from './chat/reply-actions'
```

在 `AppComponent` 类中增加以下字段：

```ts
@ViewChild('replyActions', { static: true }) replyActions!: TemplateRef<{ $implicit: ChatBubbleSlotProps }>
readonly replyText = replyText
readonly copyReply = copyReply
renderers: ChatRenderers = {}
```

在现有构造函数中保留 Runtime 释放逻辑，并追加以下初始化代码：

```ts
const owner = { application: inject(ApplicationRef), zone: inject(NgZone) }
const detector = inject(ChangeDetectorRef)
afterNextRender(() =>
  owner.zone.run(() => {
    const actions = fromTemplate(this.replyActions, owner)
    this.renderers = {
      'bubble-after': (scope, lifecycle) => (replyText(scope) ? actions(scope, lifecycle) : null),
    }
    detector.detectChanges()
  }),
)
```

将组件模板替换为：

```html
<tr-chat [runtime]="runtime" [ui]="ui" [renderers]="renderers" />
<ng-template #replyActions let-scope>
  <button #button type="button" (click)="copyReply(replyText(scope), button)">
    <span class="copy-label" aria-live="polite">复制</span>
  </button>
</ng-template>
```

`replyText()` 提取助手的文本正文，回复完成后显示按钮；复制保留原始 Markdown，失败时可点击重试。剪贴板写入需要 HTTPS 或 localhost。

上下文更新或视图销毁时，会触发当前回调的 `signal` 中止事件，辅助函数据此销毁嵌入视图。需要跨更新保留的编辑状态由宿主组件持有。其他 Renderer 与上下文见 [Scoped Slot](./customization#scoped-slot-renderers)。

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

3. 在 `AppComponent` 中导入配置，并在现有 `tr-chat` 上追加 `[bubbleRenderers]` 绑定，保留前面的 `#replyActions` 模板：

   ```ts
   import { bubbleRenderers } from './chat/markdown'

   // AppComponent 类内
   readonly bubbleRenderers = bubbleRenderers
   ```

   ```html
   <tr-chat [runtime]="runtime" [ui]="ui" [renderers]="renderers" [bubbleRenderers]="bubbleRenderers" />
   ```

在 `markdown` 实例上配置规则或插件，在应用样式中设置 `.assistant-markdown` 的排版。生成的 HTML 经过 DOMPurify 清理。未匹配的内容继续使用组件默认的渲染方式。更多配置项和回调参数见 [Bubble 消息正文](./customization#bubble-消息正文)。

完整项目代码可以查看 <a :href="`${theme.sourceLinks.treeBase}/examples/tr-chat-app-angular`" target="_blank" rel="noreferrer">Angular 示例项目</a>，安装和运行步骤见 <a :href="`${theme.sourceLinks.blobBase}/examples/tr-chat-app-angular/README.md`" target="_blank" rel="noreferrer">项目 README</a>。

## 完整示例

示例的 `/chat` 页面通过 Runtime 接入聊天服务，使用 Markdown-it 渲染助手消息，并在回复下方提供复制按钮。主要代码如下：

::: code-group
<<< ../../../examples/tr-chat-app-angular/src/pages/chat-page.component.ts [chat-page.component.ts]
<<< ../../../examples/tr-chat-app-angular/src/pages/chat-page.component.html [chat-page.component.html]
:::
