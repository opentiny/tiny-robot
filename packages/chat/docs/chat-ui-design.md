# TrChatUI 设计

## 1. 定位

`TrChatUI` 是不依赖 Runtime 的聊天页面 UI Shell。

```txt
ChatRuntime -> TrChat -> ChatUIData + ChatUIOptions -> TrChatUI -> Emits
```

| 模块 | 职责 |
| --- | --- |
| `TrChatUI` | Layout、History、Messages、Sender、Model/MCP 控件组合 |
| `useChatRuntimeAdapter` | Runtime 适配、草稿管理、数据映射、动作执行和 pending 状态 |
| 业务数据层 | 请求、流式、持久化、Provider、Transport、Tool 调用 |

`TrChatUI` 不依赖 Runtime、Kit、Vue Ref 或 controller，只消费普通只读 Data 和 UI Options。

## 2. 公共契约

```ts
export interface ChatUIProps {
  data?: Readonly<ChatUIData>
  ui?: Readonly<ChatUIOptions>
  inputValue?: string
  defaultInputValue?: string
}
```

输入规则：

- `inputValue` 存在时为受控模式，输入变化通过 `update:inputValue` 派发。
- `defaultInputValue` 只作为非受控模式的初始化值。
- 两者都没有时使用空字符串。
- 生命周期内不切换受控和非受控模式。
- `''` 表示明确清空，`undefined` 不作为输入值传递给底层 Sender。

`ChatComposer` 的 `update:value` 仅用于 `ChatUI` 与受控 Sender 之间的通信，不属于 `TrChatUI` 公共事件协议；输入通过 `modelValue` 和 `update:model-value` 同步，不使用命令式 Composer 控制。

`data` 表示展示事实，`ui` 只表示布局、品牌、标签和底层组件静态配置。UI Options 不覆盖 Data 中的 loading、disabled、selected 和 pending 状态。

## 3. Data

`ChatUIData` 包含：

- `conversation`：会话列表、当前会话 ID 和标题。
- `bubble.messages`：消息唯一来源。
- `sender`：loading、disabled 和 submitDisabled。
- `request`：请求状态、处理状态和错误。
- `model`：模型列表、当前选择、feature 和 pending。
- `mcp`：Server、Tool、启用状态和 pending。

```ts
export interface ChatRequestView {
  state: ChatRequestState
  processingState?: ChatProcessingState
  error?: unknown
}
```

Model/MCP Data 未提供时不渲染对应控件。所有公共 Data 类型均为只读。

## 4. UI Options

`ChatUIOptions` 包含 `layout`、`brand`、`labels`、`header`、`history`、`welcome`、`prompts`、`bubble`、`sender`、`model` 和 `mcp`。

解析规则：

| 输入 | 语义 |
| --- | --- |
| `undefined` | 使用默认值 |
| `false` | 关闭对应区域及交互 |
| object | 覆盖已提供字段 |
| array/function/VNode | 作为底层组件静态配置使用 |

不使用递归 deep merge。数组按整体替换；`roleConfigs` 按 role 合并，同一 role 的字段按用户配置覆盖。

UI Options 不包含业务 callback。以下交互全部通过根级 Emits 输出：

```txt
update:inputValue
submit
cancel
clear
create-conversation
switch-conversation
rename-conversation
delete-conversation
history-action
prompt-click
bubble-state-change
bubble-event
model-select
model-feature-change
mcp-add-server
mcp-remove-server
mcp-server-enabled-change
mcp-tool-enabled-change
left-aside-open-change
right-aside-open-change
```

事件 payload 使用对象；`submit.text` 由 `TrChat` trim，`TrChatUI` 只派发 Sender 的实际内容。

## 5. Sender

- `TrChatUI` 只负责 Shell；草稿协调由 `useChatDraft` 完成。
- Submit 只派发 `submit`，不自动清空。
- Clear 同时派发 `update:inputValue('')` 和 `clear`。
- Prompt 点击先写入输入值，再派发 `prompt-click`。
- `sender` 不再包含 `inputValue`。
- `sender` 只包含底层 Sender 的静态配置。
- 发送成功、返回 `false` 或 reject 后的清空与恢复由 `useChatDraft` 负责。
- 空内容、超长、Sender disabled 或 submitDisabled 时不可提交。

## 6. 请求状态与错误

`request` 只负责展示请求事实：

- `state`：`idle`、`processing`、`completed`、`aborted` 或 `error`。
- `processingState`：请求过程中的细分状态。
- `error`：当前请求错误。

存在错误时，ChatUI 默认展示错误区域，也可通过 `request-error` Slot 替换展示内容。错误区域不负责重试或请求处理。

## 7. Slots

区域 Slot 保留外层布局和滚动结构：

| Slot | Slot props |
| --- | --- |
| `layout-header` | `title`、`conversation`、会话创建和左右 Aside 操作 |
| `layout-left-aside` | `conversation`、会话 CRUD、左栏操作 |
| `layout-main` | `messages`、`request`、`conversation` |
| `layout-footer` | `value`、Sender 状态、输入、提交、取消和清空操作 |
| `request-error` | `error` |
| `layout-right-aside` | 右栏正文，无 Slot props |
| `layout-right-aside-title` | 右栏标题，无 Slot props |

Slot props 只暴露公开数据和操作函数，不暴露内部组件实例。

扩展 Slots：

```txt
header-notice
welcome-footer
prompts-footer
bubble-prefix
bubble-suffix
bubble-after
bubble-content-footer
sender-footer
sender-footer-right
```

## 8. Model、MCP、Prompt 和 Bubble

- Model 交互通过 `model-select` 和 `model-feature-change` 输出。
- MCP 交互通过四个 `mcp-*` Emits 输出。
- Prompt 通过 `prompt-click` 输出。
- Bubble 通过 `bubble-state-change` 和 `bubble-event` 输出。
- ChatUI 不等待事件处理、不维护业务 pending，也不伪造成功状态。
- `useChatRuntimeAdapter` 负责 Runtime action、错误捕获、并发去重和临时 pending。

Bubble payload 保留 `messageIndex` 和 `contentIndex`。`messageIndex` 指向过滤后的可见消息列表。

## 9. Aside

- Desktop 断点为 `960px`，左栏默认使用 dock。
- Mobile 强制使用 drawer，左栏宽度不超过 viewport 的 `86%`。
- `defaultOpen` 只用于初始化。
- `open` 存在时为受控模式。
- 外部修改 `open` 只更新展示状态，不触发 `*-aside-open-change`。
- 用户操作和 viewport 行为才触发 `*-aside-open-change`，payload 为：

```ts
interface ChatAsideOpenChangePayload {
  open: boolean
  source: 'user' | 'viewport'
}
```

- `user` 表示用户点击 Header、Aside 或 Drawer 等控制。
- `viewport` 表示响应式断点切换导致组件主动关闭 Aside。
- 外部修改 `layout.*Aside.open` 只更新展示，不派发 `open-change`。
- `layout.rightAside === false` 优先级最高。
- `layout.rightAside` 是右栏唯一的启用开关：未配置或设置为 `false` 时不创建右栏，设置为对象时创建右栏。
- `layout-right-aside` 和 `layout-right-aside-title` Slot 只提供右栏内容，不参与右栏启用判断。
- 右栏关闭后可从 Header 重新打开。
- 左栏关闭时，Header 保留新建会话入口。

## 10. TrChat 事件边界

`TrChat` 消费会话、提交、Model 和 MCP 事件；`useChatRuntimeAdapter` 调用 Runtime 并报告动作错误，不向外重复转发。Prompt、Bubble 和 Aside 事件由 `TrChat` 原样转发；`history-action` 中的 `delete` 由 Adapter 调用 Runtime 删除会话，其他 action 原样转发。

## 11. 默认值与高度

- 内容最大宽度 `980`，面板 padding/gap 均为 `12`。
- 左栏宽度 `300`，折叠宽度 `56`，默认关闭。
- Header、History、Welcome、Sender、Model 和 MCP 默认启用。
- Sender 默认 multiple、clearable、最大长度 `1000`、显示字数限制。
- `bubble.autoScroll` 默认开启。
- Right Aside 默认关闭。
- ChatUI 必须放置在有明确高度的父容器中；可通过布局相关 CSS 变量调整嵌入尺寸和面板间距。

## 12. 可访问性

图标按钮必须提供 `aria-label`；可点击操作使用 button 或语义组件；长标题省略显示；移动端标题、按钮和 Drawer 内容不得重叠。
