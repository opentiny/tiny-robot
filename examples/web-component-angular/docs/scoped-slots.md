# Angular Scoped Slot 模板桥接

Angular 可以用自己的模板显示 Chat 的标题、消息索引和输入状态，并通过上下文调用操作。本篇使用 `tr-chat-ui`；它通过 DOM 事件交付提交、新建会话等操作，由宿主更新界面数据。通用契约见[Scoped Slot](../../../docs/engineering/web-component/scoped-slots.md)。

## 1 定义接收上下文的模板

```html
<ng-template #header let-scope>
  <header>
    <strong>{{ scope.title }}</strong>
    <button (click)="scope.createConversation()">新建会话</button>
  </header>
</ng-template>
<tr-chat-ui [data]="data" [renderers]="renderers"></tr-chat-ui>
```

`let-scope` 读取模板上下文中的 `$implicit`。标题来自 Chat 的 `layout-header` 上下文，按钮调用同一上下文的新建会话操作。

## 2 创建并释放 Angular 视图

[src/shared/template-renderer.ts](../src/shared/template-renderer.ts) 中的 `fromTemplate` 接收 `TemplateRef`、`ApplicationRef` 和 `NgZone`，返回 DOM Renderer。它为每次调用创建独立 Angular 视图，执行变更检测，再返回包含视图根节点的 DOM 容器。

宿主组件取得模板后注册回调：

```ts
// examples/web-component-angular/src/demos/scoped-slots.ts
const owner = { application: inject(ApplicationRef), zone: inject(NgZone) }
afterNextRender(() =>
  owner.zone.run(() => {
    this.renderers = {
      'layout-header': fromTemplate(this.header, owner),
    }
  }),
)
```

完整组件中的 `@ViewChild('header')` 取得 `TemplateRef`。模板由 Angular 创建，绑定、事件和变更检测仍由 Angular 管理；Web Component 将返回的 DOM 放入对应位置。

`fromTemplate` 监听本次 Renderer 的 `signal`。中止时解除订阅、从应用分离视图并调用 `view.destroy()`；创建视图或执行首次变更检测失败时也执行清理。上下文改变后，旧视图结束，新视图取得新上下文。

## 3 输入状态通过订阅更新当前视图

`sender-content` 的草稿变化保持同一调用。桥接需要监听状态通知，让 Angular 更新现有模板：

```ts
// examples/web-component-angular/src/demos/scoped-slots.ts
this.inputRenderer = fromTemplate(this.input, owner, (scope, update) => scope.subscribe(update))
```

模板读取上下文中的实时状态，把用户输入交回 Chat：

```html
<ng-template #input let-scope>
  <textarea
    aria-label="自定义输入框"
    [value]="scope.value"
    [disabled]="scope.disabled"
    (input)="scope.setInputValue($any($event.target).value)"
  ></textarea>
</ng-template>
```

订阅使外部草稿与禁用状态更新同一个视图，保留输入节点与焦点。视图销毁时，桥接解除订阅。

## 4 欢迎模板组合原生输入区

在 Renderer 回调内取得原生输入容器，再将它交给 Angular 模板：

```ts
// examples/web-component-angular/src/demos/scoped-slots.ts
const welcome = fromTemplate(this.welcome, owner)
this.renderers = {
  'layout-empty-state': (scope, lifecycle) => welcome({ composer: scope.renderComposer() }, lifecycle),
}
```

模板通过 [ComposerContainerDirective](../src/shared/composer-container.directive.ts) 将 DOM 容器放到指定位置：

```html
<ng-template #welcome let-scope>
  <section>
    <h2>开始你的产品咨询</h2>
    <div [chatComposer]="scope.composer"></div>
  </section>
</ng-template>
```

`renderComposer()` 在回调内同步调用，模板后续使用已取得的容器。指令只负责把该容器放入模板位置，输入区仍由 Chat 管理。

## 5 运行示例

[src/demos/scoped-slots.html](../src/demos/scoped-slots.html)直接声明页头、消息标记、Sender 追问按钮、宿主输入框和欢迎内容模板；[组件](../src/demos/scoped-slots.ts)逐项配置 `renderers`。页面支持切换 TrChat / TrChatUI、替换输入视图、撤销自定义内容与卸载重挂。

```sh
pnpm test:wc --project=angular --grep 'Scoped Slot'
```

命令在仓库根目录执行。E2E 使用与手工查看相同的 `#/content/scoped-slots` 页面，验证模板绑定、上下文操作、草稿、宿主输入视图与清理。
