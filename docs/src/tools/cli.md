---
outline: [1, 3]
---

# CLI 命令行工具

`@opentiny/tiny-robot-cli` 用于快速创建 TinyRobot 项目脚手架。

## 快速开始

无需全局安装，直接使用 `npx` 或 `pnpm dlx`：

```bash
npx @opentiny/tiny-robot-cli create my-app
pnpm dlx @opentiny/tiny-robot-cli create my-app
```

创建完成后，进入项目并启动开发服务：

```bash
cd my-app
pnpm install
pnpm dev
```

## 命令

### create

创建一个新的 TinyRobot 项目。

```bash
tiny-robot-cli create <project-name> [options]
```

等价调用示例：

```bash
npx @opentiny/tiny-robot-cli create my-app
```

### help

查看帮助信息：

```bash
npx @opentiny/tiny-robot-cli --help
npx @opentiny/tiny-robot-cli create --help
```

## 参数说明

- `-t, --template <name>`: 指定模板名称，当前支持 `basic`
- `-h, --help`: 显示帮助信息

## 示例

使用 `basic` 模板创建项目：

```bash
npx @opentiny/tiny-robot-cli create tiny-robot-app --template basic
```

如果不传 `--template`，CLI 会在交互式流程中引导你选择模板。
