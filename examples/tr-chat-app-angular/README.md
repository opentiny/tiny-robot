# TinyRobot AI · Angular

使用 `tr-chat` Web Component 构建的独立 AI 应用。配置模型服务后，支持流式对话、停止生成、Markdown、会话历史、模型与功能选项、MCP 工具和主题切换。

## 1 准备依赖

项目使用固定版本 `1.0.1-alpha.1` 的 TinyRobot 包。使用 Node 22（至少 22.12）和 pnpm 10.34.5，在本项目目录运行：

```sh
pnpm install
```

## 2 填写 `.env`

首次启动时，将本项目的 `.env.example` 复制为 `.env`；已有 `.env` 时直接编辑。至少配置一个服务的密钥，或填写不需要前端密钥的代理地址。例如：

```env
VITE_ALIYUN_DASHSCOPE_KEY=你的开发密钥
# 或
VITE_DEEPSEEK_API_KEY=你的开发密钥
```

| 变量                        | 作用                                                              |
| --------------------------- | ----------------------------------------------------------------- |
| `VITE_QWEN_API_URL`         | Qwen 接口基础地址或完整 `chat/completions` 地址；留空使用官方地址 |
| `VITE_DEEPSEEK_API_URL`     | DeepSeek 接口地址；留空使用官方地址                               |
| `VITE_ALIYUN_DASHSCOPE_KEY` | Qwen 密钥，也用于高德 MCP 认证                                    |
| `VITE_DEEPSEEK_API_KEY`     | DeepSeek 密钥                                                     |

仅配置接口地址时可以不填密钥，用于由后端管理认证的代理。相对地址基于应用的当前站点解析；本地开发使用同源模型代理时，需要在本项目的 `proxy.conf.json` 中配置对应路由。

模型列表和 MCP 服务在 `src/chat/config.ts` 中配置。模型需要支持对应 Provider 的请求格式；思考强度、联网搜索等选项按实际服务能力使用。修改 `.env` 后重新启动开发服务，构建时重新读取配置。

`VITE_*` 是客户端配置，会进入浏览器产物。开发直连需要模型服务允许 CORS；生产凭证应由后端代理保管。

## 3 启动与构建

```sh
pnpm dev
```

打开完整聊天页 http://127.0.0.1:4348/chat ，或工作台 http://127.0.0.1:4348/workspace 。

```sh
pnpm type-check
pnpm build
```

Angular CLI 通过 `scripts/env.mjs` 在启动、类型检查和构建前读取 `.env`、`.env.local`，仅生成允许列表中的客户端变量。生成的 `src/environments/env.generated.ts` 已被 Git 忽略。进程环境变量优先于 `.env.local`，后者优先于 `.env`。

## 完整聊天与悬浮接入

项目提供两个独立页面：`/chat` 是完整聊天应用，`/workspace` 是带浮窗助手的业务工作台，根路径默认展示完整聊天。顶部链接用于访问对应页面。每个页面由应用创建 Runtime，卸载时统一释放。

工作台右下角显示圆形 AI 头像。打开后窗口头部提供新建会话、历史、全屏和关闭操作。历史面板支持搜索、切换、重命名和删除。浮窗支持拖动、缩放，全屏后按 Escape 或点击恢复按钮返回原位置和尺寸；历史面板打开时 Escape 先关闭面板。关闭再打开会保留当前会话与草稿。

在已有应用中接入时，先安装 `markdown-it`、`dompurify` 和开发依赖 `@types/markdown-it`，将本项目 `src/chat/` 中的 `floating-assistant.component.ts`、`floating-assistant.component.html`、`floating-assistant.css`、`markdown.ts`、`markdown.css`、`reply-actions.ts`、`template-renderer.ts` 放入宿主的 `src/chat/`。在业务页面挂载 `FloatingAssistantComponent`，传入所属应用创建的 `runtime`、`ui`。组件自动加载自己的样式，样式作用于助手区域。创建 Runtime 的组件销毁时调用 `dispose()`。

将 `public/assistant.svg` 放入宿主静态资源目录，确保 `/assistant.svg` 可访问，或替换组件中的图片地址。部署服务需要将 `/chat` 和 `/workspace` 的页面请求回退到 `index.html`，保留已有 API 路由。

## 助手 Markdown 与回复复制

助手的文本正文通过 `bubbleRenderers` 交给应用自己的 Markdown-it。`src/chat/markdown.ts` 配置解析规则，可添加所需插件；生成的 HTML 用 DOMPurify 清理。标题、列表、引用、表格和带语言栏的代码块样式位于 `src/chat/markdown.css`，适配浅色、深色和窄屏。用户消息保留默认 Markdown 渲染，其他内容项沿用组件的 Renderer。

`renderers['bubble-after']` 在助手回复完成后显示复制按钮，复制原始 Markdown 文本，保留换行与格式标记。失败时点击重试。浏览器剪贴板写入需要 HTTPS 或 localhost。

Angular 用 `ng-template` 定义按钮，`src/chat/template-renderer.ts` 管理嵌入视图的挂载与释放。

## MCP 与本地历史

文档 MCP 已配置开发代理 `/modelcontextprotocol-mcp`。高德 MCP 使用可选接口与认证配置。服务按需安装和启用；工具的发现、选择及调用由 Chat Runtime 管理。部署生产静态文件时，使用绝对 MCP 地址，或由部署服务提供相同代理。

会话保存到本浏览器当前站点的 localStorage；切换会话可恢复消息，刷新后从历史列表继续对话。主题选择也保存在当前站点。应用通过 `createChatRuntime()` 创建 Runtime，在宿主卸载时调用 `dispose()`，统一中止当前与后台会话请求并释放相关资源；已有历史保留。

## 源码结构

`src/chat/config.ts` 配置模型与 MCP，`src/chat/runtime.ts` 创建 Runtime；`src/pages/` 分别实现完整聊天页和工作台，`src/chat/floating-assistant.component.ts` 实现浮窗助手，`src/chat/reply-actions.ts` 实现回复复制。`src/app.component.ts` 管理页面入口、Runtime 与主题，`src/main.ts` 负责启动。应用源码不依赖其他示例目录。
