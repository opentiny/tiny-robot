---
outline: [1, 3]
---

# CLI 接入

TinyRobot 提供官方 CLI 工具 [@opentiny/tiny-robot-cli](https://www.npmjs.com/package/@opentiny/tiny-robot-cli)，用于：

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

创建完成后：

```bash
cd my-app
pnpm install

# configure your API key
# edit .env

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

```bash
npx @opentiny/tiny-robot-cli add chat
```

执行后，CLI 会根据当前项目状态自动处理以下内容：

| 变更项                  | 说明                                   |
| ----------------------- | -------------------------------------- |
| `src/TinyRobotChat.vue` | 集成 TinyRobot Chat 组件               |
| `main.ts` / `main.js`   | 自动插入 TinyRobot 样式导入            |
| `.env`                  | 添加所需环境变量                       |
| `package.json`          | 添加或升级 `@opentiny/tiny-robot` 依赖 |

执行过程中会展示变更确认列表，可按需勾选。

```shell
? Select which file changes to apply (all selected by default):
❯◉ create TinyRobotChat.vue — integrate TinyRobot chat component
 ◉ modify main entry style import — import TinyRobot styles
 ◉ create .env — add environment variables
 ◉ modify package.json — add TinyRobot dependencies
```

### 下一步操作

**导入样式**

如果没有 `src/main.ts` 或者 `src/main.js` 文件，CLI 不会写入样式相关代码，此时你需要手动在应用入口导入样式

```shell
import '@opentiny/tiny-robot/dist/style.css'
```

**接入组件**

在你的主业务组件中，添加 CLI 创建的 `<TinyRobotChat/>` 组件代码。比如 `src/App.vue` 是你的主应用

```diff
// src/App.vue
<script setup lang="ts">
import HelloWord from './components/HelloWorld.vue'
+ import HelloWord from './TinyRobotChat.vue'
</script>

<template>
  <HelloWorld />
+ <TinyRobotChat />
</template>
```

**配置 API_KEY**

在 `.env` 文件里面配置大模型的 `API_KEY`

```shell
# .env
VITE_DEEPSEEK_API_KEY=your_api_key
```

**更新依赖**

如果依赖更新了，不要忘记安装

```shell
npm install
pnpm install
```

现在你可以启动你的应用体验 AI 聊天应用了

### Workspace 支持

CLI 支持 pnpm workspace。

当检测到多 package workspace 时：

- 自动识别 workspace 根目录
- 自动识别 package 列表
- 支持交互式选择目标 package
