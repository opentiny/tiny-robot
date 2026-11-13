# TinyRobot 1.0 Demos

七个可以直接运行和阅读源码的 Vue 3 示例，展示 TinyRobot 的聊天界面、模型选择、扩展管理和工具确认等用法。

本分支是独立工程，使用 npm 发布的 `@opentiny/tiny-robot`、`@opentiny/tiny-robot-chat`、`@opentiny/tiny-robot-kit`、`@opentiny/tiny-robot-svgs` **1.0.1**。不需要构建 TinyRobot 主仓库。

## 快速开始

需要 Node.js **22.12 或更高版本**和 pnpm **10.34.5**。

```bash
git clone --single-branch --branch demo/v1.0-showcase https://github.com/opentiny/tiny-robot.git tinyrobot-v1-demos
cd tinyrobot-v1-demos
pnpm install --frozen-lockfile
pnpm dev
```

打开 <http://127.0.0.1:4175>。默认使用本地模拟回复，无需 API Key。端口固定为 `4175`，被占用时会明确报错。

## 示例目录

| 示例             | 页面                                                  | 主要源码与说明                                                                   |
| ---------------- | ----------------------------------------------------- | -------------------------------------------------------------------------------- |
| 会话与附件       | [/#chat](http://127.0.0.1:4175/#chat)                 | [聊天 Demo](src/demos/chat/README.md)：历史会话、图片消息、流式展示              |
| 长对话导航       | [/#anchor](http://127.0.0.1:4175/#anchor)             | [导航 Demo](src/demos/anchor/README.md)：目录跳转、滚动同步                      |
| 聊天浮窗         | [/#floating](http://127.0.0.1:4175/#floating)         | [浮窗 Demo](src/demos/floating/README.md)：打开、拖动、缩放                      |
| 模型选择         | [/#model](http://127.0.0.1:4175/#model)               | [选择器 Demo](src/demos/model/README.md)：分组、搜索、思考强度                   |
| 扩展管理         | [/#extensions](http://127.0.0.1:4175/#extensions)     | [扩展 Demo](src/demos/extensions/README.md)：安装状态、服务详情、本地 Skill 导入 |
| 工具调用确认     | [/#approval](http://127.0.0.1:4175/#approval)         | [确认 Demo](src/demos/approval/README.md)：允许、刷新恢复、拒绝                  |
| 多行输入首行提示 | [/#input-prefix](http://127.0.0.1:4175/#input-prefix) | [输入 Demo](src/demos/input-prefix/README.md)：切换任务、保留草稿、多行布局      |

每页的“重置示例”恢复该示例的初始状态。会话使用内存存储；等待工具确认的状态额外保存在当前标签页的 `sessionStorage` 中，支持刷新恢复。

## 试用真实视觉模型

```bash
cp .env.example .env.local
# 编辑 .env.local，填写 DASHSCOPE_API_KEY。
pnpm dev
```

在“会话与附件”页面，将“回复来源”切换为“阿里百炼”，再输入问题或添加图片。切换来源会重新初始化这个示例的会话和输入。

- `DASHSCOPE_API_KEY`：百炼 API Key，仅由本地服务读取。
- `DASHSCOPE_BASE_URL`：可留空，默认 `https://dashscope.aliyuncs.com/compatible-mode/v1`。其他地域使用控制台给出的百炼 HTTPS 兼容地址。
- `DASHSCOPE_MODEL`：默认 `qwen3-vl-plus`，更换时需选择有权限且支持图片输入的模型。

图片限定为 2 MB 以内的 PNG 或 JPEG。页面提供[示例图片](public/samples/chat-architecture.png)，也可以通过上传按钮、拖入文件或粘贴图片添加。发送到真实模型时，图片、提问和当前会话历史会一同发送给百炼；请求可能产生模型服务费用。

本地模拟只演示传输与界面交互，不分析图片内容。扩展安装和工具保存也使用模拟业务结果，示例不会安装 MCP 服务端程序或写入真实工作区。

## 在自己的项目中复用

1. 进入对应 `src/demos/<name>/` 目录阅读 `Demo.vue` 和说明。
2. 安装示例使用的 TinyRobot 包，并引入样式：

   ```ts
   import '@opentiny/tiny-robot/dist/style.css'
   import '@opentiny/tiny-robot-chat/dist/style.css' // 使用 Chat 时
   ```

3. 将 `src/fixtures/data.ts` 中的演示会话、扩展条目替换为自己的数据。
4. 使用 Chat 时，将 `/api/demo/chat/completions` 替换为应用的模型后端；扩展和工具示例中的模拟处理函数也由应用接入真实业务。

`src/App.vue` 负责示例导航和重置，`src/style.css` 负责展示页面样式；这两部分可按项目需要调整。示例组件本身使用公开 API，不依赖 TinyRobot 源码目录。

## 构建与测试

```bash
pnpm build
pnpm preview
```

开发服务和预览服务都包含本地模型接口。若部署为纯静态文件，需要由应用另外提供模型接口。

浏览器测试只使用本地模拟服务，不需要模型 Key：

```bash
pnpm exec playwright install chromium
pnpm test
```

Linux 环境可使用 `pnpm exec playwright install --with-deps chromium` 安装浏览器及系统依赖。验证构建后的预览服务：

```bash
TEST_PREVIEW=1 pnpm test
```

测试覆盖七个示例的关键交互、本地 SSE 接口、缺少密钥的反馈和窄屏交互。GitHub Actions 使用同样的本地模拟流程。

## 项目结构

```text
src/demos/       七个示例，分别包含 Demo.vue 和说明
src/fixtures/    内存会话存储与扩展数据
server/          本地模拟 SSE 和可选百炼代理
public/samples/  可下载的示例图片
samples/         可导入的周报 Skill 文件夹
tests/           交互与接口测试
```

更多 API 和接入说明见 [TinyRobot 文档](https://docs.opentiny.design/tiny-robot/)。本工程遵循 [MIT License](LICENSE)。
