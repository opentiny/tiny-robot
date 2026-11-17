# React Web Component 示例

使用 React / React DOM 19.3.1 与 Vite 8，通过真实候选包运行 `tr-chat`。页面提供本地聊天、属性配置、Runtime 延后接入、浮窗状态和卸载重挂。

## 启动

使用 Node 22（至少 22.12）、pnpm 10.34.5。先在仓库根目录准备实际包和本项目依赖：

```sh
pnpm prepare:wc-examples --project=react
```

再进入 `examples/web-component-react`：

```sh
pnpm dev
```

打开 http://127.0.0.1:4329 。也可以在仓库根目录运行 `pnpm dev:wc-examples --project=react` 完成以上步骤。

## 能力页面

左侧导航切换属性与事件、Runtime 接入、浮窗状态、公开方法四个演示。可直接在地址后添加 `#/basic/props`、`#/basic/runtime`、`#/basic/floating`、`#/basic/methods`；刷新及浏览器前进后退保留当前能力。切页销毁旧视图，重新进入时从初始状态开始。

## 接入代码

使用 DOM ref 赋值对象和 Runtime，在 layout effect 中安装原生事件监听并清理。本示例选择 ref 接入；React 19 JSX 属性简写不在当前验收范围。

- [src/main.tsx](src/main.tsx)：连接共享导航，通过 useSyncExternalStore 选择能力组件。
- [src/chat-demo.tsx](src/chat-demo.tsx)：DOM ref、layout effect、原生事件与预览状态。
- [src/demos/](src/demos/)：四个独立能力组件，各自持有页面状态。
- [src/runtime.ts](src/runtime.ts)：从稳定入口创建本地 Runtime，卸载时中止请求并停止本示例创建的 effect scope。
- [共享展示框架](../web-component-shared/README.md)：布局、导航、能力目录、地址处理和共享数据。

布局模式切换会重新创建聊天组件，以保持浮窗从创建起受控；当前对话会清空。事件面板显示 DOM 事件名和参数数组，例如 `ready []`、`floating-state-update [{...}]`。

## 验证

本目录可独立运行 `pnpm type-check` 和 `pnpm build`。在仓库根目录执行 `pnpm test:wc --project=react`，E2E 会操作这个项目的生产构建。

`pnpm test:wc --project=react --dev` 验证开发模式的 StrictMode effect 初始化与清理。

统一命令、候选包来源、报告与能力范围见 [examples 总览](../README.md)。
