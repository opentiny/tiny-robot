# DeepSeek Chat Demo · TinyRobot Chat 套件版

Vue 3 与 TinyRobot 实现的 DeepSeek API 聊天应用，对照 DeepSeek 官方 [chat-demo](https://github.com/deepseek-ai/chat-demo) v0.1.1（`5d5dd754ebc1948e977ddb880a9eb5aa25f37b4c`）。

## 运行

需要 Node.js 22.12+ 和 pnpm 10。

```sh
pnpm install --frozen-lockfile
pnpm dev  # http://127.0.0.1:8094
pnpm type
pnpm test
pnpm build
```

在设置 → 数据管理中输入自己的 DeepSeek API Key。浏览器直连 `https://api.deepseek.com`，使用模型 `deepseek-flash` 和 Anthropic 兼容的 Messages/Files API；普通 OpenAI 文本接口不能替代搜索、文件、引用和语音功能。实际调用可能产生费用。

构建输出为 `dist/`，可部署到任意静态子目录，也支持在具备 file:// 存储能力的浏览器里直接打开 `dist/index.html`。API 服务需要允许相应来源的跨域请求。构建期可通过 `API_ORIGIN` 指定兼容 API 服务。

## 功能与数据

- 多会话、流式回复、思考、搜索与引用、阅读链接、消息分支、编辑提问、重新生成、符合条件的回复续写。
- 文件选择、粘贴、拖拽、上传状态与重试；WAV 语音输入、PCM 流式朗读。
- Markdown、代码高亮、KaTeX、Mermaid；中文/英文、浅色/深色/跟随系统、移动布局。
- DeepSeek v3 历史 ZIP 双向互操作，完整消息树与本地图片；校验失败不覆盖已有数据。
- Skill 导入与启停，启用指令进入模型 system 上下文。
- MCP Streamable HTTP 服务配置、连接、工具发现、用户确认调用、结果加入输入框。

MCP 工具由用户从扩展面板显式调用，不是模型自动选择工具。网页只能连接允许 CORS 的 HTTP MCP 服务；stdio 服务需另行桥接。工具结果只有点击“将结果加入输入框”并发送后才进入对话。DeepSeek 原版服务端搜索工具与 MCP 是不同的协议和执行链路。

API Key 与设置保存在当前浏览器、当前站点的 localStorage，对话与附件保存在 IndexedDB。Skill 内容和 MCP 服务地址也仅本地持久化。历史归档不包含 API Key、设置、Skill 或 MCP 配置，图片以外的原始附件不导出，具体规则见 [归档文档](src/services/chat/history/README.md)。不要将密钥写入源码或打包产物。

## 测试

`pnpm test` 运行协议与消息树单元测试。端到端测试默认检查 `http://127.0.0.1:8095` 上的生产构建，原版对照服务为 `http://127.0.0.1:8090`：

```sh
pnpm build
python3 -m http.server 8095 --bind 127.0.0.1 --directory dist
# 另一终端
pnpm exec playwright test
```

需要与 Playwright 版本对应的浏览器。测试包含隔离的 API fixtures、本地真实 HTTP MCP 服务及浏览器模拟录音设备。它们不能替代真实 DeepSeek API、真实麦克风和人工听音验收。

## 组件与协议分层

- `src/services/chat/store.ts`：`useConversation` 管理会话列表、消息引擎、请求取消与串行保存；`useChatRuntimeFromConversation` 提供 Chat Runtime。`useChatStore` 只读投影供消息树渲染/归档使用，不再持有另一套聊天状态。
- `src/services/chat/provider.ts`：Kit `ResponseProvider` 的 DeepSeek 协议适配器，保留服务端工具、思考签名、文件失效补传、续写与错误展示。
- `src/App.vue`：`useChatRuntimeAdapter` 把 Runtime 接入 `TrChatUI`，套件负责布局、历史列表、消息列表、欢迎页、输入编辑器、滚动和右栏。
- `src/components/ChatMessage.vue`：套件的自定义内容渲染器，展示完整分支、编辑、附件和搜索引用。
- `src/components/useComposer.ts`：每会话草稿、附件和语音适配，发送经 Runtime action 进入 Kit engine。
- `src/components/SelectField.vue`：复用 `TrDropdownMenu` 的定位、键盘导航与菜单关闭行为。
- `src/services/chat/db.ts`、`history/`：IndexedDB 存储策略与 DeepSeek ZIP 互操作。导入采用原子事务，旧引擎快照带历史版本标记，防止迟到保存覆盖新导入数据。
- `src/services/extensions.ts`：Skill 上下文与官方 MCP SDK，SDK 管理握手、JSON-RPC、SSE、会话和取消。

采用套件公开的 **Runtime Adapter + TrChatUI** 组合。受控输入保留每会话草稿、语音与 MCP 结果插入；未整体替换内置主区或输入区。消息引擎保存完整分支树，界面与 DeepSeek 请求仅投影选中路径。框架通用能力由 Kit/Chat 提供，DeepSeek 特有协议与兼容归档留在适配层。重命名使用套件行内编辑，设置菜单等存在少量 UI 差异。

相邻 `deepseek-chat-demo-vue/` 是上一版独立小组件组合实现；本目录独立安装、构建和运行。数据命名空间为 `deepseek-vue-chat`，不读取旧版 `deepseek-vue` 的 Key 和对话；可通过 ZIP 导入导出迁移历史。本版本尚未发布到线上，不会修改上一版站点。

## 授权与出处

保留 DeepSeek chat-demo 的 MIT 许可，见 [LICENSE.deepseek](LICENSE.deepseek)。协议、归档、语音处理、翻译、图标与主题等来自该项目，Vue 界面和增强逻辑在此实现。TinyRobot 及第三方依赖遵循各自许可证。发布 `dist/` 时保留许可证文件。

真实接口测试默认跳过。获得费用授权后，可用不入库的本地环境文件运行：

```sh
DEEPSEEK_ENV_FILE=/absolute/path/to/.env LIVE_API_TEST=1 pnpm exec playwright test tests/e2e/live-api.spec.ts
# .env 中使用 DEEPSEEK_API_KEY；请勿把密钥写在命令行
LONG_AUDIO_TEST=1 pnpm exec playwright test tests/e2e/recording-limit.spec.ts
```

真实测试关闭截图、视频与 trace；报告只包含状态、公开测试回答和响应块类型。`LIVE_API_REPORT` 可指定脱敏报告路径；`LIVE_API_PHASE=media` / `tools` 可只跑对应专项。120秒录音专项使用合成麦克风与可控ASR响应。截图证据默认写入 `test-results/evidence`，可用 `ARTIFACT_DIR` 覆盖。原版对照服务需单独启动，不属于本项目的应用依赖。
