# 示例共享展示框架

三个独立项目通过原生 JavaScript 共用整体布局和导航，各自实现能力页。

布局参考 [Mantine AppShell](https://mantine.dev/core/app-shell/) 的固定导航模式，用 CSS Grid 将应用约束在视口内。页头和导航保持位置，右侧内容区独立滚动；长菜单在导航内部滚动。内容区支持键盘滚动，切换能力后回到顶部。

| 文件                | 职责                                              |
| ------------------- | ------------------------------------------------- |
| `catalog.js`        | 能力 ID、分组、标题、地址、说明，以及默认能力解析 |
| `shell.js`          | 顶栏、左侧导航、右侧容器与 hash 地址同步          |
| `style.css`         | 展示框架、能力控制面板和窄屏布局                  |
| `data.js`           | 固定回复、初始浮窗数据                            |
| `scoped-slots.js`   | Scoped Slot 页的消息数据与界面配置                |
| `ordinary-slots.js` | 普通 Slot 页的提示词数据与界面配置                |

`createDemoShell(root, { host })` 返回稳定的 `outlet` 容器、`getCurrentDemo()`、`subscribe(listener)` 和 `destroy()`。订阅仅在当前能力变化时通知，调用方用返回的函数取消订阅。展示框架更新导航与标题，各宿主管理容器里的视图。

原生 JS 在切页前执行上一页返回的清理函数；Angular 使用组件切换；React 使用外部状态订阅选择组件。能力页使用各自的模板、DOM ref 或 DOM API 绑定 Web Component。就绪状态、事件日志和 Runtime 也由各能力页管理。

地址示例为 `#/basic/runtime`。未识别或空路径通过 `replaceState` 归一到默认页，保留现有查询参数。切换时只挂载选中的能力，重新进入时初始化本页状态。

新增能力的步骤见 [examples 总览](../README.md#增加能力演示)。
