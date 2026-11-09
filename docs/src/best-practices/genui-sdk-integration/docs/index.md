# TrChat 接入 GenUI SDK

在 TrChat 中接入 GenUI SDK，可以让模型根据对话生成表单等界面，并把用户在界面中的操作作为下一轮消息继续发送。

本文以订单查询表单为例，介绍如何在已有的 Chat 套件中接入提示词、Schema 渲染、能力开关和表单交互。示例已通过真实模型手动验证。

## 效果预览

完整体验动图（待补充）。

动图将展示以下完整流程：

1. 使用真实模型进行普通文本对话。
2. 点击输入区“生成式 UI”按钮，开启 GenUI。
3. 请求生成订单查询表单，观察界面随回复逐步出现。
4. 填写关键词、选择订单状态并提交，模型接收并确认查询条件。
5. 关闭 GenUI，继续普通对话，已生成的历史卡片保留。

本例完成“生成表单 → 填写提交 → 回传对话”的交互闭环。实际查询订单需要接入业务接口或工具。

## 下载示例并体验

[查看完整示例项目][project]

> 当前示例链接指向演示分支，正式发布前需切换到上游仓库。完整项目包含源代码和环境变量示例。

准备 Node.js 22 LTS 和 pnpm 10。下载仓库并解压，进入 [`docs/src/best-practices/genui-sdk-integration/project`][project] 目录，安装依赖：

```bash
pnpm install
```

### 配置真实模型

复制项目根目录的 `.env.example` 为 `.env.local`，填写所选模型对应的认证配置：

| 模型服务 | 认证变量 |
| --- | --- |
| DashScope | `VITE_ALIYUN_DASHSCOPE_KEY` |
| DeepSeek | `VITE_DEEPSEEK_API_KEY` |

使用自定义模型接口时，可选配置如下；留空时使用对应服务的默认地址：

| 用途 | 变量 |
| --- | --- |
| Qwen 完整模型接口地址 | `VITE_QWEN_API_URL` |
| DeepSeek 完整模型接口地址 | `VITE_DEEPSEEK_API_URL` |

模型配置位于 [`src/App.vue`][app] 的 `modelProviders`。选择账号实际可用的模型；模型名称需要与服务端支持的名称一致。

示例保留了模板的高德 MCP 配置，`VITE_AMAP_MCP_URL` 可用于指定其地址。本文的表单生成与提交只需要模型服务。

::: warning
以 `VITE_` 为前缀的变量会暴露给浏览器代码。浏览器直连适用于服务端支持 CORS 的本地验证场景；生产环境应由后端保管密钥并转发模型请求。
:::

### 启动并操作

```bash
pnpm dev --host 127.0.0.1 --port 5181
```

访问 http://127.0.0.1:5181，使用输入区的模型选择器选择已配置的模型，先发送一条普通消息，验证模型连接。

点击“生成式 UI”按钮后，发送：

> 生成一个订单查询表单，包含关键词、订单状态和提交按钮。订单状态支持全部、待处理和已完成。

表单完整生成后，填写关键词并提交，模型会收到查询条件。关闭“生成式 UI”后，新回复只按普通 Markdown 展示。修改环境变量后需要重启 Vite。

## 接入方案

完整示例由以下三个部分协作：

| 部分 | 职责 |
| --- | --- |
| TrChat | 模型选择、请求发送、流式响应、停止生成、会话与消息展示 |
| GenUI Core | 使用 `genPrompt` 组织界面生成提示词，使用 `repairJson` 修复流式 JSON |
| 独立 Schema 渲染器 | 将经过校验的 Schema 展示为 Vue 界面 |

整体流程为：用户发送消息 → 插件补充本轮提示词 → 模型返回 Markdown 与 Schema → Chat 消息区渲染卡片 → 宿主将表单提交转换为下一轮消息。

本例使用 `@opentiny/genui-sdk-core` 与 `@opentiny/tiny-schema-renderer` 组合。GenUI Core 和界面渲染分别接入，选择其他渲染器时，需要同步调整输出协议与校验规则。

以下为示例采用的版本组合：

| 依赖 | 版本 |
| --- | --- |
| TinyRobot 相关包 | `1.0.0-rc.8` |
| `@opentiny/genui-sdk-core` | `1.4.0` |
| `@opentiny/tiny-schema-renderer` | `1.0.0-beta.6` |

TinyRobot 相关包保持版本一致，本例未引入 `@opentiny/genui-sdk-vue`。

## 从基础 TrChat 项目开始接入

本节面向需要在自己的 Chat 项目中复现接入过程的开发者。下载完整示例的用户可以直接阅读对应源码。

### 1. 创建基础项目

使用正式发布的 `@opentiny/tiny-robot-cli` 创建 TrChat 项目：

```bash
pnpm dlx @opentiny/tiny-robot-cli create tiny-robot-genui-chat
cd tiny-robot-genui-chat
pnpm install
```

当前 `create` 提供的 `basic` 模板已包含 `TrChat`。按前文配置真实模型并启动，先验证基础聊天，再安装 GenUI 依赖：

```bash
pnpm add @opentiny/genui-sdk-core@1.4.0 @opentiny/tiny-schema-renderer@1.0.0-beta.6 @opentiny/tiny-robot-kit@1.0.0-rc.8 --save-exact
```

### 2. 约定模型输出的界面协议

在 [`src/genui/prompt.ts`][prompt] 中使用 `genPrompt`，声明允许的组件和输出规则。普通说明使用 Markdown，界面使用独立的 `schemaJson` 代码块。

下面是界面内容的结构示意：

````markdown
下面是生成的界面：

```schemaJson
{
  "componentName": "Page",
  "children": [
    { "componentName": "h3", "children": "订单查询" }
  ]
}
```
````

本例要求根节点为 `Page`，节点只包含 `componentName`、`props` 和 `children`。允许的组件、属性与静态 Schema 校验规则位于 [`src/genui/schema.ts`][schema]。

订单表单另有以下约定：

| 项目 | 约定 |
| --- | --- |
| 表单 | 原生 `form`，设置 `data-action="order-query"` |
| 关键词字段 | `keyword`，最多 80 个字符 |
| 订单状态字段 | `status`，值为 `""`、`pending` 或 `completed` |
| 提交按钮 | 原生 `button`，设置 `type="submit"` |

`schemaJson` 标记和表单字段属于本示例的接入约定。提示词、前端校验与渲染器应遵循同一协议。

### 3. 将 GenUI 开关关联到每轮请求

在原有 `useChatRuntime` 上注册插件，保留模板的模型和 MCP 配置：

```ts
import { shallowRef } from 'vue'
import { createGenuiPlugin } from './genui/prompt'

const genuiEnabled = shallowRef(false)
const genuiPlugin = createGenuiPlugin(() => genuiEnabled.value)
const runtime = useChatRuntime({
  mcpServers,
  modelProviders,
  conversation: {
    useMessageOptions: { plugins: [genuiPlugin] },
  },
})
```

插件通过三个生命周期连接开关和模型回复：

| 生命周期 | 处理逻辑 |
| --- | --- |
| `onTurnStart` | 将开关状态保存到本轮 `customContext` |
| `onBeforeRequest` | 开启时补充 GenUI 提示词；关闭时要求普通 Markdown 回复 |
| `onCompletionChunk` | 将本轮状态写入回复的 `metadata.genuiEnabled` |

提示词只补充到当前请求中。每轮固定状态，使工具续请求沿用同一能力设置；回复携带自己的标记，使历史卡片保持原有展示。

通过 `ui.sender.toolbar` 追加输入区按钮：

```ts
sender: {
  toolbar: defaults => [
    ...defaults,
    {
      type: 'custom',
      id: 'genui',
      label: '生成式 UI',
      icon: IconGenerativeUi,
      active: genuiEnabled.value,
      disabled: busy.value,
      onClick: () => {
        if (!busy.value) genuiEnabled.value = !genuiEnabled.value
      },
    },
  ],
},
```

该配置位于 `computed<ChatUIOptions>` 中，`busy` 根据当前会话是否正在生成计算。按钮默认关闭，生成期间禁止切换，`...defaults` 保留原有工具栏按钮。

`active` 负责按钮高亮；实际能力由请求插件和下一节的渲染判断共同控制。

### 4. 在消息区渲染 Schema

在原有 `chatUi.bubble` 中注册内容解析和渲染器，以下为核心配置片段，完整导入与类型见 [`src/App.vue`][app]：

```ts
bubble: {
  bubbleList: {
    contentRenderMode: 'split',
    contentResolver: message => {
      const source = message.state?.content ?? message.content
      if (typeof source !== 'string') return message.content
      return message.role === 'assistant'
        && (message as ChatMessageItem).metadata?.genuiEnabled === true
        ? splitContent(source)
        : source
    },
  },
  bubbleProvider: {
    contentRendererMatches: [{
      find: (message, content) =>
        (message as ChatMessageItem).metadata?.genuiEnabled === true
        && content.type === 'schema-json',
      renderer: markRaw(SchemaContent),
    }],
  },
},
```

`splitContent` 保留普通 Markdown，只将独立的 `schemaJson` 围栏拆分为卡片内容。渲染权限读取消息自己的 `metadata.genuiEnabled`，因此关闭后新回复不会渲染卡片，历史卡片继续显示。

[`SchemaContent.vue`][schema-content] 负责界面展示和生成状态：

- 流式接收时使用 `repairJson` 尝试解析并预览界面。
- 代码块闭合且消息结束后严格解析 JSON，再校验组件和属性白名单。
- 内容未完整生成或会话正在生成时禁用表单，防止提前提交。
- 解析或渲染失败时展示错误，并提供原始 Schema 查看入口。

JSON 修复用于流式预览，完整内容仍需严格校验。

### 5. 将表单操作回传对话

模型负责生成静态表单，提交事件由宿主处理。[`SchemaContent.vue`][schema-content] 捕获原生 `submit` 事件，读取并校验 `keyword` 和 `status`，通过注入的 `queryContextKey` 发送条件。

在 [`App.vue`][app] 中提供提交入口：

```ts
provide(queryContextKey, {
  busy,
  submit: fields => runtime.actions.send({
    text: '提交订单查询：' + JSON.stringify(fields),
  }),
})
```

提交后，原有 TrChat 请求链路继续发送消息，模型根据条件回复。旧卡片在关闭 GenUI 后仍可提交；该操作发送普通用户消息，是否生成新界面取决于新一轮的开关状态。

当前提示词要求模型确认查询条件，实际订单查询需由业务接口或工具执行。

## 示例代码位置

| 文件 | 职责 |
| --- | --- |
| [`src/App.vue`][app] | 关联运行时、输入区按钮与消息渲染 |
| [`src/genui/prompt.ts`][prompt] | 生成提示词、固定每轮状态、标记回复 |
| [`src/genui/schema.ts`][schema] | 拆分内容、修复 JSON、校验静态 Schema |
| [`src/components/SchemaContent.vue`][schema-content] | 展示界面、处理生成状态和表单提交 |
| [`src/genui/context.ts`][context] | 连接卡片提交与 Chat 发送入口 |
| [`src/schema-renderer.d.ts`][renderer-types] | 补充本例所用独立渲染器版本的类型声明 |

## 当前能力范围

本例支持静态 HTML Schema，包含文本、表单和表格等白名单元素。模型生成的表达式、方法、事件和外部资源不在支持范围内；表单操作由宿主实现，未提交的填写值不持久化。

示例已完成真实模型手动验证。完整动图将在发布前补充。

## 参考文档

- [CLI 接入](../../../guide/cli-integration.md)：创建项目和配置运行时版本。
- [Chat 快速上手](../../../suites/quick-start.md)：了解基础接入流程。
- [界面与交互配置](../../../suites/chat.md)：配置输入区按钮和消息渲染。
- [数据与逻辑配置](../../../suites/chat-runtime.md)：配置模型服务、会话和消息发送。
- [GenUI SDK](https://github.com/opentiny/genui-sdk)。
- [独立 Schema 渲染器](https://github.com/opentiny/tiny-schema-renderer)。

[project]: https://github.com/SonyLeo/tiny-robot/tree/fix/cli-readme-file/docs/src/best-practices/genui-sdk-integration/project
[app]: https://github.com/SonyLeo/tiny-robot/blob/fix/cli-readme-file/docs/src/best-practices/genui-sdk-integration/project/src/App.vue
[prompt]: https://github.com/SonyLeo/tiny-robot/blob/fix/cli-readme-file/docs/src/best-practices/genui-sdk-integration/project/src/genui/prompt.ts
[schema]: https://github.com/SonyLeo/tiny-robot/blob/fix/cli-readme-file/docs/src/best-practices/genui-sdk-integration/project/src/genui/schema.ts
[schema-content]: https://github.com/SonyLeo/tiny-robot/blob/fix/cli-readme-file/docs/src/best-practices/genui-sdk-integration/project/src/components/SchemaContent.vue
[context]: https://github.com/SonyLeo/tiny-robot/blob/fix/cli-readme-file/docs/src/best-practices/genui-sdk-integration/project/src/genui/context.ts
[renderer-types]: https://github.com/SonyLeo/tiny-robot/blob/fix/cli-readme-file/docs/src/best-practices/genui-sdk-integration/project/src/schema-renderer.d.ts
