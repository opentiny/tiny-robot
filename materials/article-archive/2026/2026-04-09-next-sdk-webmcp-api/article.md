---
title: 炸裂！NEXT SDK 已内置 WebMCP，浏览器能自己调 API 了
source_platform: juejin
source_url: https://juejin.cn/post/7626339569270685734
source_urls:
  juejin: https://juejin.cn/post/7626339569270685734
author: OpenTiny社区
published_at: 2026-04-09
archived_at: 2026-06-23
tags:
  - 前端
category: 前端
original_article_id: "7626339569270685734"
---

# 炸裂！NEXT SDK 已内置 WebMCP，浏览器能自己调 API 了

本文由郑志超原创。

在 Web AI 技术飞速发展的今天，如何让 AI Agent 有效地感知并操作网页端业务逻辑，已成为提升开发者体验的关键。随着谷歌 Chrome 近期推出 **WebMCP (Model Context Protocol for Web)** ，浏览器正在从一个单纯的渲染工具，演变为具备“原生工具调用能力”的智能交互平台。

本文将深入探讨 WebMCP 的核心机制、行业现状，以及 **OpenTiny next-sdk** 如何通过兼容性适配层，助力开发者平滑接入这一前沿协议。

## 一、 WebMCP 协议概述

传统意义上的 AI 操作网页往往依赖于外部插件或复杂的 DOM 模拟。而 **WebMCP** 则定义了一套标准化的通信协议，允许浏览器直接作为 MCP（模型上下文协议）工具的承载容器。

- **生态定位**：如果说 MCP 解决了 AI 与后端服务的连接，那么 WebMCP 则补齐了 AI 与**浏览器前端业务上下文**交互的最后一块版图。
- **交互逻辑**：AI 代理通过浏览器提供的原生接口，直接发现并调用网页中注册的“工具 (Tools)”，从而实现对业务功能的语义化操控。

核心差异：以前 AI 需通过视觉或代码猜测用户意图，现在只需通过浏览器暴露的标准化接口直接获取业务元数据。

## 二、 现有 Web AI 方案的局限性剖析

在 WebMCP 出现之前，业界主要通过 DOM 解析、无障碍树（AOM）和视觉模型（VLM）来实现 AI 对页面的操控。然而，这些技术在面对复杂业务场景时存在显著瓶颈：

1. **DOM 解析成本高且语义缺失**：DOM 是为“渲染”设计的，而非“逻辑”。即便经过精简，它的规模依然庞大，且无法表达按钮背后的业务校验规则。
2. **视觉模型性能差且易偏移**：VLM 对动态 UI（如弹窗、遮罩）的感知识别不稳定，且截图、编码、推理的链路耗时极长。
3. **上下文负载重**：将数万行的 HTML 输入模型，会迅速耗尽 Token 额度，并引入严重的幻觉风险。

![去除图片图标文字.png](assets/image-01.webp)

## 三、 Chrome 原生 WebMCP 的双刃剑

WebMCP 的核心创新在于它从“逆向推导”转向了**“正向显式声明”**。它通过两个关键接口定义了调用的闭环：

### 1. 业务端：工具注册 (Server)

通过 `navigator.modelContext` 接口，开发者可以在页面中注册业务逻辑。

```php
// 业务页面：注册一个财务汇总查询工具
navigator.modelContext.registerTool({
  name: 'finance_summary',
  description: '查询本月核心财务指标',
  inputSchema: {
    /* ... */
  },
  execute: async (args) => {
    // 页面内的业务逻辑代码
    return { content: [{ type: 'text', text: '收益：¥10,000' }] }
  }
})
```

### 2. 客户端：工具发现与调用 (Client)

通过 `navigator.modelContextTesting` 接口，对话系统（Client）可以发现当前环境下的工具并执行。

```csharp
// 对话组件：发现并调用
const tools = await navigator.modelContextTesting.listTools()
const result = await navigator.modelContextTesting.executeTool('finance_summary', {})
```

## 四、 OpenTiny next-sdk：生产级 WebMCP 增强方案

虽然原生 WebMCP 提供了基础能力，但它目前尚处于实验性阶段（需开启标志位），且在 SPA 路由跳转、工具发现时序、Polyfill 支持方面存在不足。**OpenTiny next-sdk** 对此进行了深度补全。

### 1. 全平台 Polyfill 支持

目前原生 WebMCP 仅在 Chrome Canary 等特定版本可用。通过在应用入口调用 `initializeBuiltinWebMCP()`，`next-sdk` 会为所有浏览器自动注入符合规范的 `navigator.modelContext` 接口。

```javascript
// src/main.ts
import { initializeBuiltinWebMCP } from '@opentiny/next-sdk'

// 一行代码，让旧版浏览器立享 WebMCP 标准能力
initializeBuiltinWebMCP()
```

### 2. “按需加载”带来的幻觉抑制 (中大型项目)

在大型 SPA 项目中，如果全局注册成百上千个工具，AI 的幻觉风险将急剧增加。`next-sdk` 推荐在 Vue 组件的 `onMounted` 中注册、`onUnmounted` 中注销。

- **优势**：工具只在对应的业务页面激活。当 AI 判定用户想查询订单时，由 **WebSkills** 引导其跳转页面，随后页面加载并自动注册工具。
- **结果**：大模型每次看到的工具集始终是极简且精准的，极大地提升了调用决策的准确率。

### 3. 自动化路由跳转桥接

`next-sdk` 提供了 `setNavigator` 与 `registerPageTool` 机制。开发者只需在声明工具时配合 `routeConfig` 声明所属路由，SDK 即可在 AI 发起指令时，完全自动化地驱动前端导航：

1. **匹配意图**：AI 命中工具，SDK 发现其路由在 `/finance`。
2. **触发导航**：SDK 驱动应用跳转。
3. **时序保证**：SDK 等待目标页面就绪并刷新工具目录，随后执行指令。

立即体验：[docs.opentiny.design/next-sdk/gu…](https://link.juejin.cn?target=https%3A%2F%2Fdocs.opentiny.design%2Fnext-sdk%2Fguide%2F)

![小.gif](assets/image-02.gif)

## 五、 现状与未来

WebMCP 的核心价值在于：**它将 Web 的交互逻辑从“视觉呈现”中剥离，通过结构化契约重新交付给 AI。**

**OpenTiny next-sdk** 将这一前沿协议转化为生产力，帮助开发者构建不仅“可看”，而且可由 AI “深入交流、精准操控”的智能 Web 应用。通过 `initializeBuiltinWebMCP` 这一扇窗，开发者今天就可以开始为明天的原生 AI 时代进行布局。

💡 **相关资料：**

- [OpenTiny NEXT-SDKs 官方主页](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fopentiny%2Fwebmcp-sdk)
- [WebMCP 标准提案与实践](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fmodelcontextprotocol%2Fmcp)
- [Vue 接入 WebMCP 最佳实践文档](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fopentiny%2Fwebmcp-sdk%2Fblob%2Fdev%2Fdocs%2Fguide%2Fvue-webmcp-best-practice.md)

## 关于 OpenTiny NEXT

OpenTiny NEXT 是一套企业智能前端开发解决方案，以生成式 UI 和 WebMCP 两大核心技术为基础，对现有传统的 TinyVue 组件库、TinyEngine 低代码引擎等产品进行智能化升级，构建出面向 Agent 应用的前端 NEXT-SDKs、AI Extension、TinyRobot智能助手、GenUI等新产品，实现AI理解用户意图自主完成任务，加速企业应用的智能化改造。

欢迎加入 OpenTiny 开源社区。添加微信小助手：opentiny-official 一起参与交流前端技术～  
 OpenTiny 官网：[opentiny.design](https://link.juejin.cn?target=https%3A%2F%2Fopentiny.design)  
 NEXT SDK 代码仓库：[github.com/opentiny/we…](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fopentiny%2Fwebmcp-sdk) （欢迎star ⭐）  
 关于我们：[opentiny.design/opentiny-de…](https://link.juejin.cn?target=https%3A%2F%2Fopentiny.design%2Fopentiny-design%2Fabout)

如果你也想要共建，可以进入代码仓库，找到 good first issue标签，一起参与开源贡献~如果你有任何问题，欢迎在评论区留言交流！
