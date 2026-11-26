---
outline: [1, 3]
---

# TinyPro 接入 TrChat WebMCP

在 TinyPro 中接入 TrChat 后，通过 WebMCP 将页面工具提供给模型。本文基于 TinyPro 默认模板和 `@opentiny/tiny-robot-cli add chat` 的实际接入过程，说明初始化、宿主接线、工具调用和跨页验证。本文代码路径以仓库根目录为基准；Markdown 文件链接相对于本文档所在目录解析。

## 接入方案

### 架构与流程

| 部分 | 职责 |
| --- | --- |
| TinyPro 页面 | 在页面生命周期中注册业务工具，并在页面离开时清理 |
| WebMCP Polyfill | 提供 `document.modelContext`，负责工具发现和执行 |
| WebMCP Adapter | 将当前页面工具接入 TrChat Runtime，并监听 `toolchange` |
| TrChat | 获取工具列表、向模型发送请求、执行模型返回的工具调用 |
| 全局导航工具（可选） | 导航到其他路由，并等待目标页工具注册完成 |

基础流程是：页面注册工具 → Adapter 读取当前工具列表 → 模型请求携带工具定义 → Adapter 将模型调用转交给 `document.modelContext` 执行。页面工具变化后，`toolchange` 通知 Adapter 更新列表，后续模型请求使用最新工具。

跨页面演示是在基础流程上增加导航：模型调用 `navigate_url` → Vue Router 完成跳转 → 目标页面注册工具 → 导航结果返回 → 后续模型请求使用新页面工具。

### 接入方式选择

基础单页接入只需要初始化 Polyfill、挂载 Chat、配置 Adapter 和页面工具。只有演示跨页面调用时，才需要实现导航等待及路由到工具名的映射。

### 运行完整示例

完整 TinyPro 案例位于 [`docs/examples/tinypro-trchat-webmcp`](../../examples/tinypro-trchat-webmcp/README.md)。准备 Node.js `^20.19.0 || >=22.12.0` 和 pnpm，在仓库根目录执行：

```bash
cd docs/examples/tinypro-trchat-webmcp
pnpm install
```

示例已包含 TinyPro 本地运行配置 `web/dev.env`，Vite 启动时会自动加载。只有接入真实模型时，才需要将 `web/.env.example` 复制为 `web/.env.local` 并填写模型凭证。然后启动 Mock 和开发服务：

```bash
pnpm run start:mock
```

启动地址以 Vite 输出为准。`VITE_*` 变量会进入浏览器构建产物，仅用于本地验证；生产环境应使用服务端代理保护模型凭证。

## 初始化与运行

首次使用时，先安装 TinyPro 初始化工具，再运行 `tiny init pro` 创建前端项目。工具已安装则直接执行初始化命令：

```bash
tiny install @opentiny/tiny-toolkit-pro
tiny init pro
```

初始化器可能在当前目录下额外创建同名项目子目录。确认生成后的真实项目根目录，再进入该目录执行 Chat CLI：

```bash
npx @opentiny/tiny-robot-cli add chat
pnpm install
```

CLI 会识别 pnpm workspace 并向对应的 `web` package 添加 Chat 代码和依赖，但不会替宿主项目修改 `main.ts`、`App.vue` 或布局。添加完成后核对文件落点和依赖所在的 package，再按下面步骤手动接线。

本次实践中默认开发端口 `3031` 已占用，Vite 使用了 `3032`。访问启动日志提供的地址，不要假定一定使用默认端口。

## 接入步骤

以下代码展示关键接线。完整实现见 [`main.ts`](../../examples/tinypro-trchat-webmcp/web/src/main.ts)、[`App.vue`](../../examples/tinypro-trchat-webmcp/web/src/App.vue)、[`TinyRobotChat.vue`](../../examples/tinypro-trchat-webmcp/web/src/tiny-robot-chat/TinyRobotChat.vue) 和 [`webmcp-tools.ts`](../../examples/tinypro-trchat-webmcp/web/src/tiny-robot-chat/webmcp-tools.ts)。

### 1. 初始化 WebMCP

在 `web/src/main.ts` 中初始化 Polyfill，并保证发生在 Vue 应用挂载及页面工具注册之前：

```ts
import { initializeWebMCPPolyfill } from '@mcp-b/webmcp-polyfill'

initializeWebMCPPolyfill()
```

页面工具、全局工具和 Chat Adapter 都应使用同一个 `document.modelContext`。

### 2. 将 Chat 挂载在全局布局

在持续存在的布局中挂载一次 `TinyRobotChat`，例如 `web/src/layout/default-layout.vue`。路由切换时布局不销毁，Chat Runtime 和当前会话也就不会随页面组件重建。不要同时在 `App.vue`、布局和业务页面重复挂载。

组件卸载时关闭 Adapter：

```ts
onUnmounted(() => {
  void webmcpAdapter.close?.()
})
```

### 3. 连接 WebMCP Adapter

使用 Tiny Robot 提供的 WebMCP Adapter 默认连接，它会读取 `document.modelContext` 中的工具、转发调用并监听 `toolchange`：

```ts
const webmcpAdapter = createWebMcpAdapter({
  server: {
    id: 'tiny-pro-webmcp',
    name: 'TinyPro 页面工具',
  },
})

const runtime = useChatRuntime({
  modelProviders,
  mcp: {
    servers: mcpServers,
    adapters: [webmcpAdapter],
  },
})
```

`createWebMcpAdapter` 从 `@opentiny/tiny-robot` 导入。默认 source 管理工具发现、调用、变化订阅和结果转换；只有需要接入非默认工具源时才传入自定义 `source`。不要在业务侧另行缓存静态工具列表，否则页面工具变化后模型可能仍拿到旧定义。

### 4. 注册页面工具和全局工具

页面工具在对应页面或功能模块注册，定义唯一名称、用途描述、参数 schema 和执行函数。将注册绑定到页面生命周期，在页面卸载时清理，避免离开页面后旧工具仍留在全局列表中。工具执行仍需进行业务输入校验和权限校验，不能只靠提示词限制副作用操作。

`system-overview`、`navigate_url` 等跨页面通用工具在应用级注册，不应依赖具体业务页面先挂载。用 `AbortController.signal` 管理其注册生命周期，并确保卸载或热更新时取消注册，避免重复注册。

## 故障定位

| 现象 | 优先检查 |
| --- | --- |
| 当前页面工具不在模型请求中 | Polyfill 是否先初始化；Adapter 是否连接同一个 `document.modelContext`；`toolchange` 是否订阅；是否缓存了旧工具列表 |
| 工具显示但调用失败 | 工具 schema 和执行参数是否匹配；展开错误详情并查看浏览器控制台 |
| 导航完成但目标页工具不可用 | 目标路由是否正确；页面是否注册工具；是否确实需要并实现导航等待 |
| 无工具页面仍然等待 | 等待逻辑是否对无预期工具的路由立即返回 |
| HMR 后重复注册或工具冲突 | 全局工具注册是否由 `AbortController` 清理；Chat 是否重复挂载 |

## 可选：跨页面导航等待

只有跨页演示需要 `navigate_url` 等待目标页工具。普通单页接入不需要新增此逻辑。

导航工具应：

1. 使用 Router 解析并跳转目标路由。
2. 对不存在路由和重定向返回明确状态。
3. 对已知有工具的目标页，监听 `toolchange` 并查询当前列表，直至预期工具注册完成。
4. 对没有 MCP 工具的页面立即返回空列表，不等待超时。
5. 设置有限超时，超时信息指出哪些工具尚未注册。

不要使用固定延时替代注册信号。延时无法保证目标工具已就绪，也会无故拖慢没有工具的页面。当前路由与工具名映射在 [`webmcp-tools.ts`](../../examples/tinypro-trchat-webmcp/web/src/tiny-robot-chat/webmcp-tools.ts)。添加新的演示页面时同步维护映射，并覆盖已注册、并发注册、超时和无工具路由等情况。

## 模型配置与安全

本地可按 `web/src/tiny-robot-chat/config/chat-runtime.ts` 配置的 Provider 进行验证。真实模型 API Key 不要写入源码或提交仓库。`VITE_*` 环境变量会被打包进浏览器产物，只适合本地验证；生产环境应通过服务端代理访问模型，由服务端保存凭证并执行访问控制。

WebMCP 工具可能触发真实业务操作。工具本身必须校验输入、身份、权限和操作边界；需要确认的副作用操作应由产品交互提供确认步骤。

## 验证

### 自动检查

在示例的 `web` package 目录执行：

```bash
cd docs/examples/tinypro-trchat-webmcp/web
pnpm exec eslint src/tiny-robot-chat/TinyRobotChat.vue src/tiny-robot-chat/webmcp-tools.ts
pnpm run test:webmcp
pnpm run build
```

跨页等待测试覆盖工具就绪、超时和无工具页面。本次自动检查通过 ESLint、WebMCP 等待测试和生产构建。

### 手动验证

1. 启动项目，使用 Vite 输出的实际地址。
2. 确认布局中只有一个 Chat 实例。
3. 在已注册工具的页面发起模型请求，确认工具进入请求并能成功执行。
4. 页面切换或注册新工具后再次请求，确认模型拿到最新列表。
5. 若验证跨页导航，确认 `navigate_url` 完成后目标页工具可被下一次模型请求调用。
6. 导航到没有工具的页面，确认流程立即结束且不报工具等待超时。
7. 触发 HMR，确认无重复工具注册或旧页面工具残留。

## 参考

- [完整 TinyPro 示例](../../examples/tinypro-trchat-webmcp/README.md)。
- [Chat Adapter 实现](../../examples/tinypro-trchat-webmcp/web/src/tiny-robot-chat/TinyRobotChat.vue)。
- [导航工具等待实现](../../examples/tinypro-trchat-webmcp/web/src/tiny-robot-chat/webmcp-tools.ts)。
- [CLI 生成的 Chat 接入说明](../../examples/tinypro-trchat-webmcp/web/src/tiny-robot-chat/README.md)。
