# TinyRobot 1.0 Demos

可直接运行和阅读源码的 Vue 3 示例，展示 TinyRobot 的聊天界面、模型选择、扩展管理和工具确认等用法。

## 快速开始

需要 Node.js **22.12 或更高版本**和 pnpm。

```bash
git clone --single-branch --branch demo/v1.0-showcase https://github.com/opentiny/tiny-robot.git tinyrobot-v1-demos
cd tinyrobot-v1-demos
pnpm install --frozen-lockfile
pnpm dev
```

打开 <http://127.0.0.1:4175>。默认使用本地模拟回复，无需 API Key。扩展安装和工具保存也使用模拟业务结果。

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

## 试用真实视觉模型

停止开发服务，复制配置并填写百炼密钥后重新启动：

```bash
cp .env.example .env.local
# 编辑 .env.local，填写 DASHSCOPE_API_KEY。
pnpm dev
```

在“会话与附件”页面，将“回复来源”切换为“阿里百炼”。切换来源会重置当前示例的会话和输入。

可上传、拖入或粘贴 2 MB 以内的 PNG 或 JPEG，也可以使用[示例图片](public/samples/chat-architecture.png)。图片、提问和当前会话历史会一同发送给百炼，可能产生模型服务费用。

本地模拟回复不分析图片内容。

## 在自己的项目中复用

1. 进入对应 `src/demos/<name>/` 目录阅读 `Demo.vue` 和说明。
2. 安装示例使用的 TinyRobot 包，并引入样式：

   ```ts
   import '@opentiny/tiny-robot/dist/style.css'
   import '@opentiny/tiny-robot-chat/dist/style.css' // 使用 Chat 时
   ```

3. 将 `src/fixtures/data.ts` 中的演示会话、扩展条目替换为自己的数据。
4. 使用 Chat 时，将 `/api/demo/chat/completions` 替换为应用的模型后端；扩展和工具示例中的模拟处理函数也由应用接入真实业务。

## 构建与预览

```bash
pnpm build
pnpm preview
```

开发服务和预览服务都包含本地模型接口。若部署为纯静态文件，需要由应用另外提供模型接口。

更多 API 和接入说明见 [TinyRobot 文档](https://docs.opentiny.design/tiny-robot/)。本工程遵循 [MIT License](LICENSE)。
