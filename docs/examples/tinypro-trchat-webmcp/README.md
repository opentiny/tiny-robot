# TinyPro + TrChat WebMCP 示例

这是 TinyPro 默认模板通过 `@opentiny/tiny-robot-cli add chat` 接入 TrChat WebMCP 的完整案例。接入说明见[最佳实践文档](../../src/best-practices/tinypro-trchat-webmcp.md)。

## 运行

准备 Node.js `^20.19.0 || >=22.12.0` 和 pnpm，在此目录执行：

```bash
pnpm install
```

如需使用真实模型，将 `web/.env.example` 复制为 `web/.env.local` 并填写对应模型凭证，然后启动 Mock 和开发服务器：

```bash
pnpm run start:mock
```

按终端输出的地址打开应用。`VITE_*` 环境变量会打包到浏览器，仅用于本地验证；生产环境请通过服务端代理保护凭证。

运行导航工具等待测试：

```bash
pnpm --dir web run test:webmcp
```

## WebMCP 代码

- `web/src/main.ts` 初始化 Polyfill。
- `web/src/tiny-robot-chat/TinyRobotChat.vue` 将页面工具接入 TrChat Adapter。
- `web/src/tiny-robot-chat/webmcp-tools.ts` 动态读取当前工具，并在跨页面演示中等待目标页面工具。
- `web/src/App.vue` 注册全局概览与导航工具。
