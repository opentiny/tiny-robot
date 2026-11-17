# Slot 支持范围与生命周期契约

本篇列出实验 Web Component `tr-chat`、`tr-chat-ui` 的内容入口、上下文和清理规则。基础用法见[普通 Slot](ordinary-slots.md)与[Scoped Slot](scoped-slots.md)。两个元素分别连接 Runtime 与宿主界面数据，内容定制使用相同形式。

## 普通内容与上下文入口

宿主通过 `slot="名称"` 提供普通内容：

`welcome-footer`、`prompts-footer`、`sender-header`、`input-prefix`、`sender-footer`、`sender-footer-right`。

`sender-footer` 和 `sender-footer-right` 既可投影普通内容，也可接收上下文。它们在启用默认输入区且 Sender 实际处于多行布局时显示；配置为 `single` 时，内容溢出也可能使输入区切换为多行。需要在单行与多行布局都显示操作时，使用 `sender-actions-inline`。其他四个普通入口的条件见[普通 Slot 支持范围](ordinary-slots.md#3-适配元素用-html-指定内容位置)。

需要上下文时，通过 `element.renderers` 配置回调。共 26 个名称，对应原 Vue 组件的 Scoped Slot：

| Web Component Renderer 位置 | `element.renderers` 中的名称                                                                                                                                                                            | 上下文                                                                  |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| 页头与主区域                | `layout-header`、`layout-main`、`layout-empty-state`                                                                                                                                                    | 会话、消息或请求；页头提供会话和侧栏操作，空状态提供 `renderComposer()` |
| 左侧栏                      | `layout-left-aside`、`layout-left-aside-brand`、`layout-left-aside-actions`、`layout-left-aside-content`、`layout-left-aside-footer`、`layout-left-aside-rail`、`layout-left-aside-history-item-prefix` | 侧栏状态与会话操作；内容包含历史，条目前缀提供当前条目                  |
| 右侧栏                      | `layout-right-aside`、`layout-right-aside-title`、`layout-right-aside-panel`                                                                                                                            | 当前面板；侧栏和面板位置还提供开关、切换操作                            |
| 输入区周边                  | `layout-footer`、`composer-before`、`composer-after`                                                                                                                                                    | 草稿、禁用、加载与提交状态，以及编辑、提交、取消和清空操作              |
| 消息周边                    | `bubble-prefix`、`bubble-suffix`、`bubble-after`、`bubble-content-footer`                                                                                                                               | 消息、角色和原消息索引数组；内容页脚还包含内容索引                      |
| 输入与操作按钮              | `sender-content`、`sender-actions-inline`、`sender-footer`、`sender-footer-right`                                                                                                                       | 分别使用下面的输入视图或 Sender 操作契约                                |
| 扩展区域                    | `extension-header-actions`、`extension-overlay`                                                                                                                                                         | 当前扩展页签 ID                                                         |

精确类型见 [ChatRenderers](../../../packages/chat/src/experimental/elementRenderers.ts)。普通布局和消息位置沿用原 Vue Slot 的数据字段与操作；宿主按相应字段类型读取内容，业务数据中的扩展值由调用方保证兼容。

## 显示条件与内容选择

入口沿用原组件的显示条件与层级。例如，关闭侧栏会隐藏侧栏区域；用 `layout-main` 替换主内容后，其内部默认消息与欢迎区出口不再显示；用 `layout-left-aside` 替换整个侧栏后，其内部局部出口由整体内容接管。`layout-footer` 替换默认输入区，`sender-content` 则保留 Sender 外层和操作区域、只替换输入视图。

同一位置配置 Renderer 时使用 Renderer；撤销配置后恢复普通内容或组件默认内容。`sender-footer` 和 `sender-footer-right` 同时提供具名节点和回调时，回调优先。动态增加或移除具名节点会同步更新对应出口；空的具名节点仍表示提供该 Slot。

替换配置时为 `element.renderers` 赋新对象。配置中的值必须是相应位置的回调函数。

## 调用有效期

| 变化                         | 通用布局 / 消息 Renderer | `sender-content`              | `layout-empty-state` 的原生输入 |
| ---------------------------- | ------------------------ | ----------------------------- | ------------------------------- |
| 对应上下文改变               | 中止旧调用，生成新内容   | 通过 `subscribe` 通知当前视图 | 有关上下文变化时重新生成        |
| 普通草稿或无关配置更新       | 对应上下文不变时保留视图 | 保留当前节点与焦点            | 保留原生输入器                  |
| 替换回调或 TrChat 的 Runtime | 中止旧调用               | 中止旧调用并释放订阅          | 重建输入器并读取组件当前草稿    |
| 卸载、撤销入口或同步渲染异常 | 中止并清理               | 中止并清理                    | 清理对应挂载                    |

每次调用拥有独立 `signal`；宿主在中止时解除监听、订阅并销毁视图。错误事件为 `renderer-error`，`event.detail[0]` 包含 `name`、`error`。修正并替换回调后可恢复该位置。

## Sender 操作

`sender-actions-inline`、`sender-footer`、`sender-footer-right` 提供：

| Web Component 上下文成员                        | 含义                             |
| ----------------------------------------------- | -------------------------------- |
| `disabled`、`loading`、`hasContent`             | 禁用、请求加载与是否有可提交内容 |
| `focus(): Promise<boolean>`                     | 聚焦当前输入视图并返回结果       |
| `blur()`                                        | 使输入失焦                       |
| `insert(text)`、`append(text)`、`replace(text)` | 插入、末尾追加或替换字面文本     |

编辑和聚焦在输入未禁用、调用仍有效时执行。失效调用不再操作输入，异步聚焦返回 `false`。具体实现见 [ElementSenderActions](../../../packages/chat/src/experimental/ElementSenderActions.ts)。

## 宿主输入视图

`sender-content` 的上下文为：

```ts
// packages/chat/src/experimental/elementRenderers.ts
export interface ChatSenderContentRendererState {
  readonly value: string
  readonly disabled: boolean
  readonly loading: boolean
}
export interface ChatSenderContentRendererContext extends ChatSenderContentRendererState {
  setInputValue(value: string): void
  subscribe(listener: (state: ChatSenderContentRendererState) => void): () => void
}
```

订阅立即交付当前状态，并返回解除订阅的函数。草稿更新保持宿主视图；禁用状态阻止 `setInputValue` 接受修改。撤销 Renderer 后，原生输入框继续显示已接受的草稿。元素的 `focusInput()` 聚焦宿主返回的可聚焦输入控件；没有可用控件时返回 `false`。

输入视图接口处理文本草稿。富文本结构、自定义编辑节点和编辑器插件使用原 Vue Sender 的相应接口。

## 欢迎区原生输入

`layout-empty-state` 提供 `renderComposer(): HTMLElement | null`。在 Renderer 回调内同步调用，将返回容器包含在返回的 DOM 中，容器进入宿主视图后，适配层在其中挂载原生输入区。同一调用得到同一容器；输入区关闭、回调已结束或调用已失效时返回 `null`。

返回结果未包含容器时，不挂载对应输入区。普通输入及无关配置更新保留它；替换外层 Renderer 等需要重建的变化保留草稿，光标与 IME 状态可能改变。Vue Slot 的同名方法返回 VNode，Web Component 适配层交付 DOM 容器，分别由各自的渲染机制处理。

## 验证入口

[组件测试](../../../packages/test/component/chat/ElementScopedComposer.spec.ts)覆盖输入、清理与组合，[区域测试](../../../packages/test/component/chat/ElementScopedRegions.spec.ts)覆盖消息与布局，[三端 E2E](../../../packages/test/web-component/common/scoped-slots.spec.ts)操作实际候选包页面。宿主桥接分别由 Angular 和 React 管理自己的视图，接入见对应 [Angular Demo](../../../examples/web-component-angular/README.md)、[React Demo](../../../examples/web-component-react/README.md)。
