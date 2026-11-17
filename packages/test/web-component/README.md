# Web Component 宿主 E2E

这组 Playwright 测试直接操作 [examples 中的三个独立项目](../../../examples/README.md)。在仓库根目录运行：

```sh
pnpm test:wc
pnpm test:wc --project=react
pnpm test:wc --project=react --dev
```

默认流程构建真实候选包、校验实际安装、检查类型、构建三个项目并启动生产静态服务；`--dev` 使用相应项目的开发服务器。候选标识随测试传入，并与测试服务提供的 `/candidate.json` 核对。服务端口已占用时直接报错。

| 目录                        | 运行范围                                         |
| --------------------------- | ------------------------------------------------ |
| `common/`                   | 相同用例在 js、angular、react 上分别运行         |
| `js/`、`angular/`、`react/` | 对应宿主的特定场景，有需要时添加                 |
| `support/`                  | 公用测试 fixture，检查整个交互过程中的浏览器异常 |

用例直接访问 `/#/basic/props`、`/#/basic/runtime`、`/#/basic/floating`、`/#/basic/methods` 等能力地址。导航验收覆盖直达与刷新、前进后退、未知路径回退、切页后的浮窗销毁和状态初始化，窄屏操作，以及历史缓存生命周期恢复后继续聊天与导航。

公开方法页通过各宿主的真实元素调用设置输入、清空、聚焦与发送，并读取结果。直接转换与适配组件的通用兼容契约另由 `packages/test/component/chat/ElementBaseline.spec.ts` 对照验收。

能力验收包括注册与就绪、本地发送回复及布尔属性回写、字符串和对象配置、延后接入 Runtime、浮窗初值和更新、拖动事件载荷、卸载重挂后继续聊天。React 页面使用 StrictMode；开发模式验收覆盖其 effect 重复初始化与清理。

新增用例应验证消费者可见的行为和稳定接口。后续能力恢复到对应示例后，再将其验收加入本目录；不通过绕过宿主绑定或直接调用组件内部对象使测试通过。

HTML、JSON 报告及失败截图、trace 位于 `.artifacts/web-component/`，开发模式使用 `development/` 子目录。原有 E2E 与 Vue 组件 CT 使用各自的配置，不扫描此目录。
