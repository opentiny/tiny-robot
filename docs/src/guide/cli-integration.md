---
outline: [1, 3]
---

# CLI 接入

TinyRobot 提供官方 CLI 工具 [`@opentiny/tiny-robot-cli`](https://www.npmjs.com/package/@opentiny/tiny-robot-cli)，用于：

- `create` 创建完整的 TinyRobot 示例工程
- `add` 向现有 Vue 项目快速注入聊天能力

## 安装方式

无需全局安装，可直接通过 `npx` 或 `pnpm dlx` 使用。

```bash
# npm
npx @opentiny/tiny-robot-cli

# pnpm
pnpm dlx @opentiny/tiny-robot-cli
```

## create

创建一个完整的 TinyRobot 工程。

```bash
npx @opentiny/tiny-robot-cli create <project-name> --template basic
```

示例：

```bash
npx @opentiny/tiny-robot-cli create my-app --template basic
```

### 运行时版本

`create` 和 `add chat` 都根据 CLI 包版本生成 TinyRobot 运行时依赖：prerelease 使用同一精确版本，stable 使用 `^` 范围。`--runtime-version <version>` 仅用于本地 CLI 开发或诊断，并遵循相同规则。

```bash
npx @opentiny/tiny-robot-cli create my-app --template basic --runtime-version 0.5.2-rc.2
npx @opentiny/tiny-robot-cli add chat --runtime-version 0.5.2-rc.2
```

`create` 会将版本写入生成项目的 TinyRobot 运行时依赖。`add chat` 使用该版本处理 TinyRobot 运行时依赖；稳定版本会保留能够满足目标版本的依赖，预发布版本按精确版本处理。

创建完成后：

```bash
cd my-app
pnpm install

# configure your API key
# copy .env.example to .env.local

pnpm dev
```

create 命令特性

- 自动生成 Vue 工程结构
- 内置 TinyRobot 基础聊天能力
- 自动生成环境变量模板
- 提供可直接运行的示例页面

## add

向现有项目添加 TinyRobot 能力。

```bash
npx @opentiny/tiny-robot-cli add chat
```

CLI 会自动检测当前项目或 workspace 包，并引导选择目标 package。

执行后，CLI 会根据当前项目状态自动处理以下内容：

| 变更项                 | 说明                                   |
| ---------------------- | -------------------------------------- |
| `src/tiny-robot-chat/` | 集成 TinyRobot Chat 组件和功能样式     |
| `main.ts` / `main.js`  | 自动插入 TinyRobot 样式导入            |
| `.env.example`         | 添加所需环境变量模板                   |
| `package.json`         | 添加或保留 TinyRobot Chat 所需依赖     |
| `App.vue`              | 在可安全解析的 `src/App.vue` 中尝试自动挂载 `<TinyRobotChat />` |

交互模式下会展示变更确认列表，可按需勾选；使用 `--yes` 或 `--dry-run` 时不进行交互选择。

CLI 会处理以下依赖：`@opentiny/tiny-robot`、`@opentiny/tiny-robot-chat`、`@opentiny/tiny-robot-kit`、`@opentiny/tiny-robot-svgs` 和 `@vueuse/core`。稳定版本会保留能够满足目标版本的依赖，预发布版本按精确版本处理。

```shell
? Select which file changes to apply (all selected by default):
❯◉ Chat feature files
 ◉ main entry style imports
 ◉ .env.example
 ◉ package.json
 ◉ App.vue mount
```

`add chat` 不会创建或修改用户项目的 `vite.config.*`。这是宿主项目的构建配置，需要手动补充 Model Context MCP 代理。

### 配置 Model Context MCP 代理

在用户项目根目录现有的 `vite.config.ts`、`vite.config.js`、`vite.config.mts` 或 `vite.config.mjs` 中，将下面的路由添加到 `server.proxy`。如果已有 `server.proxy`，只追加该路由；修改后重启 Vite。

```ts
export default defineConfig({
  server: {
    proxy: {
      '/modelcontextprotocol-mcp': {
        target: 'https://modelcontextprotocol.io/mcp',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/modelcontextprotocol-mcp/, ''),
      },
    },
  },
})
```

### 下一步操作

**导入样式**

如果没有 `src/main.ts` 或者 `src/main.js` 文件，CLI 不会写入样式相关代码，此时你需要手动在应用入口导入样式

```shell
import '@opentiny/tiny-robot/dist/style.css'
import '@opentiny/tiny-robot-chat/dist/style.css'
import './tiny-robot-chat/index.css'
```

**接入组件**

仅当未选择 `App.vue mount` 或 CLI 未能安全自动挂载时，才需要在你的主业务组件中手动添加 CLI 创建的 `<TinyRobotChat/>` 组件代码。比如 `src/App.vue` 是你的主应用

```vue
<!-- src/App.vue -->
<script setup lang="ts">
import HelloWord from './components/HelloWorld.vue'
import TinyRobotChat from './tiny-robot-chat/TinyRobotChat.vue' // [!code ++]
</script>

<template>
  <HelloWorld />
  <!-- [!code ++] -->
  <TinyRobotChat />
</template>
```

**配置 API_KEY**

复制 `.env.example` 为 `.env.local`，根据使用的模型配置对应变量：Qwen 使用 `VITE_QWEN_API_URL` 和 `VITE_ALIYUN_DASHSCOPE_KEY`，DeepSeek 使用 `VITE_DEEPSEEK_API_URL` 和 `VITE_DEEPSEEK_API_KEY`；自定义 MCP 地址使用 `VITE_AMAP_MCP_URL`。`VITE_*` 变量会被写入浏览器产物，仅限开发使用，禁止配置生产密钥；生产环境应通过服务端代理保护 Provider 凭证。比如

```shell
# .env.local
VITE_DEEPSEEK_API_KEY=your_api_key
```

**更新依赖**

如果依赖更新了，不要忘记安装

```shell
pnpm install
```

现在你可以启动你的应用体验 AI 聊天应用了

### Workspace 支持

CLI 支持 pnpm workspace。

当检测到多 package workspace 时：

- 自动识别 workspace 根目录
- 自动识别 package 列表
- 支持交互式选择目标 package

如果 `pnpm-workspace.yaml` 没有 `packages` 字段，CLI 会按 pnpm 默认规则递归发现 workspace 包；如果当前命令从 workspace 根目录执行且存在多个包，`--yes` 或 `--dry-run` 会要求改为从目标 package 目录执行。`packages: []` 不会回退到 workspace 根目录。
