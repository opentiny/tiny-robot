# TrChatUI 设计

## 1. 定位

`TrChatUI` 是不依赖 Runtime 的聊天页面 UI Shell。

```txt
业务数据层 -> ChatRuntime -> TrChat -> ChatUIData + ChatUIOptions -> TrChatUI
```

| 模块 | 职责 |
| --- | --- |
| `TrChatUI` | Layout、History、Messages、Sender、Model/MCP 控件组合 |
| `TrChat` | Runtime 适配、输入恢复、Model/MCP 编排、pending 管理 |
| 业务数据层 | 请求、流式、持久化、Provider、Transport、Tool 调用 |

`TrChatUI` 只接受普通数据，不依赖 Runtime、Kit、Vue Ref 或 controller。

## 2. 公共契约

```ts
export interface ChatUIProps {
  data?: ChatUIData
  ui?: ChatUIOptions
}
```

| 输入 | 作用 |
| --- | --- |
| `data` | 当前展示事实，包括会话、消息、Sender、Model、MCP |
| `ui` | 布局、组件 Props、标签和组件级回调 |
| 根 Emits | 页面级用户意图 |
| Slots | 区域替换或默认组件扩展 |

Data 和 UI 分离：UI 配置不能覆盖 Data 中的加载、禁用、选择和 pending 状态。

## 3. Data

`ChatUIData` 包含 `conversation`、`bubble`、`sender`、`model` 和 `mcp`。

- `conversation` 提供会话列表、当前会话 ID 和标题。
- `bubble.messages` 是消息唯一来源。
- `sender` 提供外部输入同步值、loading、disabled 和 submitDisabled。
- `model` 提供模型列表、当前选择、feature 和 pending。
- `mcp` 提供 Server、Tool、启用状态和 pending。
- Model/MCP 未提供时不渲染对应控件。
- Data 只读，`TrChatUI` 不直接修改调用方对象。

## 4. UI Options

`ChatUIOptions` 包含 `layout`、`brand`、`labels`、`header`、`history`、`welcome`、`prompts`、`bubble`、`sender`、`model` 和 `mcp`。

解析规则：

| 输入 | 语义 |
| --- | --- |
| `undefined` | 使用默认值 |
| `false` | 关闭对应区域及交互 |
| object | 仅覆盖已提供字段 |
| array/function/VNode | 完整替换 |

不使用递归 deep merge。`undefined` 不覆盖默认值，数组和 callback 不合并。

## 5. Sender

- `TrSender` 保存实时草稿，`data.sender.inputValue` 只用于外部同步。
- `inputValue === undefined` 表示不执行同步，清空必须传入 `''`。
- 用户输入通过 `ui.sender.onInput(value)` 通知调用方。
- 不提供 `v-model`、`defaultInputValue` 或根级 `update:inputValue`。
- Prompt 先写入 Sender，再调用 `prompts.onItemClick`。
- Clear 触发根级 `clear`，内容变化通过 `onInput('')` 通知。
- Submit 使用 Sender 实际内容并触发根级 `submit`。
- `clearOnSubmit` 默认开启，自动清空不触发根级 `clear`。
- 发送失败后的草稿恢复由 `TrChat` 负责。
- 空内容、超长、Sender disabled 或 submitDisabled 时不可提交。

## 6. 根级 Emits

根 Emits 只表达页面级意图：

`submit`、`cancel`、`clear`、`createConversation`、`switchConversation`、`renameConversation`、`deleteConversation`。

Prompt、Bubble、Model 和 MCP 事件通过对应 `ui.*` callback 暴露，不增加统一事件出口。

## 7. Slots

区域 Slots 替换区域默认内容，但保留外层布局和滚动结构：

| Slot | 行为 |
| --- | --- |
| `layout-header` | 替换 Header 默认内容，保留 Header 容器和 notice |
| `layout-left-aside` | 替换左栏展开区默认内容 |
| `layout-main` | 替换 Welcome/BubbleList，保留主滚动容器 |
| `layout-footer` | 替换默认 Sender 内容 |
| `layout-right-aside` | 提供右栏正文，并在未配置时自动启用右栏 |
| `layout-right-aside-title` | 替换右栏默认标题 |

扩展 Slots 保留默认组件：

`header-notice`、`welcome-footer`、`prompts-footer`、`bubble-prefix`、`bubble-suffix`、`bubble-after`、`bubble-content-footer`、`sender-footer`、`sender-footer-right`。

`sender-footer` 追加在 Model/MCP 默认控件之后，不覆盖它们。当前公共 Slots 不提供 slot props。

## 8. Model/MCP

- `TrChatUI` 消费普通 View Data，并同步调用 `ui.model`、`ui.mcp` callback。
- `TrChatUI` 不等待 callback，不维护业务 pending，也不伪造成功状态。
- `ui.model === false` 或 `ui.mcp === false` 时关闭对应 UI 和交互。
- `TrChat` 负责 Runtime action、pending、防重复、错误捕获和 MCP Tool 自动加载。
- 禁用 MCP Server 不修改 Tool 选择；重新启用后复用原选择，数据缺失时重新加载。
- 具体 Runtime 行为见 [chat-runtime-design.md](./chat-runtime-design.md)。

## 9. Bubble

- system 角色默认隐藏。
- BubbleList 接收过滤后的可见消息。
- `onStateChange` 和 `onBubbleEvent` 保留原子组件 payload。
- payload 中的 `messageIndex` 指向可见消息列表，不保证对应原始消息数组下标。
- ChatUI 接管滚动容器，BubbleList 内部 `autoScroll` 固定关闭。

## 10. Layout

- Desktop 断点为 `960px`，左栏默认使用 dock。
- Mobile 强制使用 drawer，左栏宽度不超过 viewport 的 `86%`。
- 创建或切换会话后关闭移动端左栏。
- Right Aside 支持内部状态和受控 `open`。
- 提供 `open` 时以外部值为准，变化通过 `onOpenChange` 通知。
- `layout.rightAside === false` 始终关闭右栏。
- Right Aside 未配置但存在正文 Slot 时，使用默认右栏配置。

## 11. 默认值

- 内容最大宽度 `980`，面板 padding/gap 均为 `12`。
- 左栏宽度 `300`，折叠宽度 `56`，默认关闭。
- Header、History、Welcome、Sender、Model 和 MCP 默认启用。
- Sender 默认 multiple、clearable、最大长度 `1000`、显示字数限制。
- `bubble.autoScroll` 和 `sender.clearOnSubmit` 默认开启。
- Right Aside 默认关闭。
- 默认会话标题、提示文本和组件文案由 `labels` 提供。

## 12. 可访问性

图标按钮必须提供 `aria-label`；可点击操作使用 button 或语义组件；长标题必须省略显示；移动端标题、按钮和 Drawer 内容不得重叠。
