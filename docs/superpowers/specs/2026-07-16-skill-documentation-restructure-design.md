# Skill 单页文档重构设计

## 背景

`docs/src/tools/skill.md` 已覆盖 SkillDefinition、Loader、Storage、Vue skillPlugin、SkillRequestContext 和主要 API，但当前信息顺序更接近内部模块架构。主要读者是 Vue 开发者，他们需要先完成一次可工作的 skill 接入，再按任务了解导入、持久化、自动选择和资源能力。

本次只整理文档和现有演示，不修改 `packages/kit` 的实现或公共 API。Skill 文档暂时保持为单个页面。

## 目标

- 让 Vue 开发者在页面开头通过一个完整示例完成首次接入。
- 按用户任务组织内容，同时保留 Loader、Storage、Node 和完整 API 的查询能力。
- 清楚说明 manual、auto、inline skills、storage provider 之间的选择关系。
- 所有主要示例符合当前实现，并明确哪些代码可以直接复制、哪些只是局部片段。
- 补充生产使用所需的错误排查、安全边界和性能提示。
- 降低手工复制 TypeScript 类型造成文档再次过时的风险。

## 非目标

- 不拆分成多个 VitePress 页面。
- 不修改 kit 的 Skill 类型、Loader、Storage、capability 或 plugin 行为。
- 不新增 command execution、搜索资源、范围读取或其他尚未实现的能力。
- 不为特定模型 provider 封装新的 instructions 注入 API。
- 不建立完整的自动 API 文档生成系统。

## 目标读者

主要读者是已经使用 `@opentiny/tiny-robot-kit` 和 Vue `useMessage`、希望为对话启用 skill 的应用开发者。次要读者包括需要从浏览器、GitHub 或 Node 文件系统导入 skill，以及需要持久化 skill 的开发者。

文档默认读者理解 Vue Composition API 和基础 TypeScript，但不要求预先理解 Skill toolchain 的内部架构。

## 单页信息架构

页面按以下顺序重构：

1. **概览**
   - 用一段话解释 skill 的用途。
   - 简要说明 kit 的责任边界。
   - 提供页面内导航提示，但不在开头展开内部层次。
2. **快速开始**
   - 使用 Vue、manual 模式和内联 `SkillDefinition`。
   - 提供完整 imports、skill、`useMessage`、`skillPlugin`、instructions 注入和最小 `responseProvider`。
   - 明确 `skillPlugin` 生成 instructions，但应用负责将其写入 provider 请求。
3. **选择接入方式**
   - 用决策表映射常见需求与推荐组合。
   - 覆盖 manual/auto、inline/storage、browser/node。
4. **在 Vue 中启用 Skill**
   - 提取可复用的 `injectSkillInstructions` 示例，避免后续重复完整注入逻辑。
   - 先讲 manual，再讲 auto，最后讲高级 `selection`。
   - 保留 Vue 交互演示，并明确 mock provider 验证最终请求。
5. **导入和保存 Skill**
   - 先解释 Loader 与 Storage 的区别，再按浏览器、GitHub、IndexedDB、Memory、Node 文件系统组织。
   - 保留 Skill Inspector 演示。
   - 正确区分正常加载、取消 job、warnings 和 strict 模式。
6. **使用资源文件**
   - 用合法对象示例解释 eager 和 lazy resource。
   - 说明 `list_skill_files`、`read_skill_file`、`toolPlugin` 依赖和二进制限制。
7. **请求状态与生命周期**
   - 说明 `SkillRequestContext`、`onSkillsResolved`、`onInstructionsResolved` 和 auto 两阶段。
   - 强调 context 是请求级状态，不应跨请求缓存。
8. **安全与生产注意事项**
   - 说明外部 instructions 的信任边界、资源数据发送给模型的条件、敏感信息和导入来源控制。
   - 说明 auto 模式的额外 tool-calling 请求、延迟和候选数量成本。
9. **常见问题**
   - 采用“现象 / 原因 / 处理”形式覆盖主要运行时约束和常见误用。
10. **API 参考**
    - 使用参数表呈现常用公开 API、入口、适用环境、必填条件和默认值。
    - 只保留理解组合关系所需的精简类型；复杂联合类型指向源码定义或用合法对象示例替代。

## 快速开始设计

Quick Start 必须是页面中第一个大段代码示例，并满足以下条件：

- 代码块独立完整，不依赖 `selectedSkills`、`manualMode`、`storage` 等未声明变量。
- 使用响应式数组持有一个内联、无资源的 skill，避免首次接入同时引入 `toolPlugin`，并允许读者清空数组观察禁用效果。
- `responseProvider` 使用已有 kit 类型实现页面内最小 mock provider；它读取最终 `requestBody` 并返回合法响应，使示例无需外部服务即可运行和验证 instructions。
- `onBeforeRequest` 调用 `getSkillRequestContext(context)?.instructions`，仅在非空时添加临时 system message。
- 说明临时 system message 只修改当前 `requestBody`，不会写回持久消息历史。
- 说明 manual 是 Vue 插件默认模式，示例可省略 `mode`，但为了教学可以显式写出。

Quick Start 后给出预期结果：发送消息时，最终 provider 请求包含 skill instructions；没有选择 skill 时不添加对应 system message。

## 示例规范

- 完整示例必须包含所需 imports 和变量定义。
- 局部示例在代码前明确标注“以下只展示关键配置”。
- 同一段 instructions 注入逻辑只完整解释一次，其他章节复用命名辅助函数。
- 示例使用 Vue 开发者熟悉的 `ref`、`computed` 和 `useMessage` 组合，不以 core plugin 配置作为主路径。
- Node-only 示例明确使用 `@opentiny/tiny-robot-kit/node`。
- 异步 job 示例不得在无错误处理的情况下先 `cancel()` 再 `await`。
- warnings 示例不启用 strict；strict 示例使用 `try/catch` 说明 warning 会升级为错误。
- 不展示未实现的 command execution、二进制文本读取或资源搜索能力。

## 决策表设计

决策表至少覆盖：

| 用户需求 | 推荐组合 |
| --- | --- |
| 已有完整 skill，直接启用 | manual + `skills` |
| UI 只保存选中名称 | manual + `skillNames` + `getSkillByName` |
| 由模型根据请求选择 skill | auto + 候选 provider + resolver + `toolPlugin` |
| 浏览器临时导入 | `loadSkill` + manual `skills` |
| 浏览器跨会话保存 | IndexedDB storage + names/resolver |
| Node 从目录加载或保存 | node 子入口的 Loader/Fs storage |

表后说明：已知最终选择时优先 manual；auto 用于选择不明确的场景，并会增加工具选择阶段。

## 错误处理与排查

常见问题至少覆盖：

- instructions 没有出现在模型请求中：未在 `onBeforeRequest` 中按 provider 协议注入。
- manual + `skillNames` 报 resolver 错误：缺少 `getSkillByName`。
- auto 启动失败：缺少或禁用了 `toolPlugin`、缺少候选 provider 或 resolver。
- skill 未启用：查看 `unresolvedSkillNames`，并检查 resolver 返回的 `skill.name` 是否与请求名称一致。
- 资源工具没有进入请求：未注册 `toolPlugin` 或所选 skill 没有 resources。
- 二进制文件无法读取：`read_skill_file` 只读取 `kind: 'text'`。
- 浏览器目录选择不可用：回退到 `<input type="file" webkitdirectory>`。
- Loader warning 行为不符合预期：区分 details 模式与 strict 模式。

## 安全与性能说明

- 从 GitHub、本地目录或用户上传导入的 instructions 会影响模型行为，只应启用可信来源。
- 文本资源在模型调用资源工具后可能进入模型上下文，不应存放未经授权发送给 provider 的敏感内容。
- 应用负责限制导入来源、文件大小、用户权限和必要的审核流程。
- auto 模式依赖模型 tool calling，通常包含选择阶段和选择后的执行阶段，会增加延迟与 token 消耗。
- 候选摘要也会进入模型上下文，候选很多时应由应用先过滤。
- 已知用户明确选择时使用 manual，避免无必要的自动选择开销。

## API 参考设计

API 参考按 Loader、Storage、Vue skillPlugin、SkillRequestContext 分组。每组优先使用表格，至少包含：

- API 或参数名
- 导入入口
- 适用环境或模式
- 是否必需及必需条件
- 默认值
- 简短说明

`UseMessageSkillPluginOptions` 不再以整段手工复制的接口作为唯一参考。文档保留 `SkillSelection` 和 `SkillRequestContext` 这类能解释运行流程的精简类型，但明确它们是说明性摘要，具体类型以包导出为准。

## 演示调整

- `VueSkillPlugin.vue` 继续作为 manual + reactive names + instructions/resource tools 的端到端演示。
- 演示说明放在演示之前，先告诉读者操作步骤和预期结果，再显示组件。
- `SkillInspector.vue` 继续演示导入、持久化、列表和选择；放在“导入和保存 Skill”章节。
- 不为本次重构新增第三个大型演示，避免维护成本。

## 验收标准

- 页面保持单个 `docs/src/tools/skill.md`。
- 页面前 25% 内出现完整 Vue Quick Start 和接入决策表。
- 开发者无需阅读 Loader/Storage 即可完成内联 manual skill 接入。
- 主要完整示例不存在未声明变量或缺失 imports。
- Loader 取消、warnings 和 strict 示例语义正确且相互独立。
- manual、auto、storage、resources 的依赖条件均有明确说明。
- 文档包含安全说明、auto 性能提示和常见问题。
- 现有两个演示仍可构建并位于对应任务章节。
- `pnpm --dir docs build` 在沙盒外成功完成。
- 修改后的 Vue 演示通过仓库 ESLint；Markdown 通过 `git diff --check`。

## 文件范围

- 主要修改：`docs/src/tools/skill.md`
- 按需要修改：`docs/demos/tools/skill/VueSkillPlugin.vue`
- 按需要修改：`docs/demos/tools/skill/SkillInspector.vue` 及其现有辅助文件
- 不修改：`packages/kit/src/skills/**`
- 不修改：`packages/kit/src/vue/message/plugins/skillPlugin.ts`
