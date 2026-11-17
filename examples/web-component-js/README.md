# 原生 JS Web Component 示例

使用 JavaScript 与 Vite 8，通过真实候选包运行 `tr-chat`。页面提供本地聊天、属性配置、Runtime 延后接入、浮窗状态和卸载重挂。

## 启动

使用 Node 22（至少 22.12）、pnpm 10.34.5。先在仓库根目录准备实际包和本项目依赖：

```sh
pnpm prepare:wc-examples --project=js
```

再进入 `examples/web-component-js`：

```sh
pnpm dev
```

打开 http://127.0.0.1:4327 。也可以在仓库根目录运行 `pnpm dev:wc-examples --project=js` 完成以上步骤；此启动方式会在新候选包安装校验完成后自动刷新开发服务和页面。

## 能力页面

左侧导航切换属性与事件、Runtime 接入、浮窗状态、公开方法、普通 Slot 和 Scoped Slot 六个演示。可直接在地址后添加 `#/basic/props`、`#/basic/runtime`、`#/basic/floating`、`#/basic/methods`、`#/content/ordinary-slots`、`#/content/scoped-slots`；刷新及浏览器前进后退保留当前能力。切页销毁旧视图，重新进入时从初始状态开始。

## 接入代码

直接创建 DOM 元素，在连接前设置属性和事件监听；连接后的属性更新通过 DOM 对象完成。

- [src/main.js](src/main.js)：创建展示框架，按能力目录选择挂载函数，切页前清理旧页面。
- [src/chat-preview.js](src/chat-preview.js)：原生 DOM 属性赋值、事件监听与 Runtime 清理。
- [src/demos/](src/demos/)：六个独立能力页，返回各自的清理函数。
- [src/runtime.js](src/runtime.js)：从稳定入口创建本地 Runtime，卸载时中止请求并停止本示例创建的 effect scope。
- [共享展示框架](../web-component-shared/README.md)：布局、导航、能力目录、地址处理和共享数据。

布局模式切换会重新创建聊天组件，以保持浮窗从创建起受控；当前对话会清空。事件面板显示 DOM 事件名和参数数组，例如 `ready []`、`floating-state-update [{...}]`。

## 普通 Slot

`#/content/ordinary-slots` 使用 `tr-chat`、`tr-chat-ui` 的六个普通 Slot，分别提供欢迎说明、换题按钮、咨询主题、助手标识、输入区底部提示和右下角提示。

[src/demos/ordinary-slots.js](src/demos/ordinary-slots.js)在连接前创建具名容器并保存引用；文字更新、子节点切换和监听清理由 DOM API 完成。

每个开关标明 Slot 名称，可单独添加或移除对应内容，并修改说明、主题、标识和提示文字。初始只启用 `sender-header`；移除后相应输入区布局也会收起。通用用法与边界见[普通 Slot 文档](../../docs/engineering/web-component/ordinary-slots.md)。

## Scoped Slot

`#/content/scoped-slots` 使用 `renderers` 定制页头、消息标记、Sender 按钮、输入框和欢迎区，读取组件上下文并调用操作。

[src/demos/scoped-slots.js](src/demos/scoped-slots.js)逐项配置 DOM Renderer，使用 `signal` 解除监听和订阅。

九个开关分别控制页头、欢迎区、消息前缀、消息状态、消息来源、草稿预览、自定义输入框、追问按钮和聚焦按钮。初始只启用 `layout-header`；可修改会话标题、欢迎标题、消息来源和追问内容，并卸载重挂。输入状态通过订阅更新当前视图；清理随 Renderer 的 `signal` 结束。完整接口见[Scoped Slot](../../docs/engineering/web-component/scoped-slots.md)。

## 验证

本目录可独立运行 `pnpm type-check` 和 `pnpm build`。在仓库根目录执行 `pnpm test:wc --project=js`，E2E 会操作这个项目的生产构建。

统一命令、候选包来源、报告与能力范围见 [examples 总览](../README.md)。
