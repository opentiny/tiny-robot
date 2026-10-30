# DOM 事件协议验收报告

## 结论

验收通过，映射判定为 **adapted**。Web Component 继续使用原版 `TrChatUI` 的输入区、会话列表和 History 菜单；跨边界部分改为标准 `CustomEvent`。真实交互确认 `detail` 直接承载值，事件默认 `bubbles=true`、`composed=true`，输入更新不可取消且可重复派发，`history-action` 可由宿主 `preventDefault()` 取消，并会继续调用原版 payload 的 `preventDefault()` 阻止默认删除。

## 原版基线与适配边界

- 原版：`docs/demos/chat/controlled-ui.vue`
- Web Component：`docs/demos/chat-experimental/event-contract.ts`
- 原版负责受控输入和会话操作的 UI/业务入口；Web Component Demo 只增加协议状态面板和 DOM 监听器，没有替换原版 Sender、History 或布局。
- 原版 Vue emit 不直接具有 DOM 冒泡、`composed` 和宿主取消语义，因此这些是跨框架边界的适配能力，不要求与 Vue emit 的实现形式一致。

## 验收结果

| 能力            | 浏览器结果                                                                    | 判定 |
| --------------- | ----------------------------------------------------------------------------- | ---- |
| 输入更新 detail | 两次真实编辑分别收到字符串 detail，第二次状态为 `count=2`                     | 通过 |
| 传播默认值      | `input-value-update` 显示 `bubbles=true`、`composed=true`、`cancelable=false` | 通过 |
| 可取消会话操作  | 删除菜单触发 `history-action`，显示 `cancelable=true`、`prevented=true`       | 通过 |
| 默认行为抑制    | 取消事件后“协议会话”仍留在原版 History 列表                                   | 通过 |
| 控制台          | Chromium 专项测试未记录 error 级控制台输出                                    | 通过 |

## 截图证据

- [原版 Controlled UI](./vue-controlled-ui-initial.png)
- [Web Component 初始状态](./web-component-initial.png)
- [第二次输入更新](./web-component-repeat-update.png)
- [取消 History 删除](./web-component-canceled-action.png)

## 自动化证据

- `packages/test/experimental/chat-web-component.examples.spec.ts`：真实 Sender 输入、重复事件、DOM 默认值、键盘打开 History 菜单、取消删除和会话保留。
- `packages/test/component/chat-experimental/Protocol.spec.ts`：事件名归一化、detail 身份、传播默认值和可取消事件返回值。

## 限制

- 本轮完整业务闭环在 Chromium 验收；Firefox/WebKit 仍只保留核心 smoke，完整 P1 矩阵后续补齐。
- 本报告验证公开事件协议，不承诺所有事件都可取消；当前只有定义了默认业务动作的 `history-action` 使用取消语义。
