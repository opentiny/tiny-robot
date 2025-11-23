# ChatInput 组件测试编写规范

本规范基于 Playwright 测试框架，旨在统一 `chat-input` 组件的测试用例编写风格，确保测试的可维护性和稳定性。

## 1. 目录结构

测试代码应遵循以下目录结构：

```
packages/test/src/chat-input/
├── specs/                  # 测试用例目录
│   ├── basic.spec.ts       # 基础功能测试
│   ├── mention/            # 复杂特性按目录分层
│   │   ├── trigger.spec.ts # 触发逻辑
│   │   └── list.spec.ts    # 列表交互
│   └── template-block/     # 模板块特性
│       ├── backspace.spec.ts
│       └── delete.spec.ts
├── helpers/                # 测试辅助函数 (Page Object 模式)
│   ├── index.ts            # 通用 helper
│   ├── mention-helper.ts   # 特性专用 helper
│   └── template-block-helper.ts
├── selectors.ts            # 统一管理 CSS 选择器
└── index.vue               # 测试 Demo 页面
```

## 2. 测试分层策略

为避免单文件过大，应按**功能模块**和**操作类型**进行分层：

- **模块级**：每个独立特性（如 Mention, TemplateBlock）应在 `specs/` 下拥有独立目录。
- **文件级**：按用户交互行为拆分文件。
  - ❌ `template-block.spec.ts` (包含所有增删改查，太杂)
  - ✅ `backspace.spec.ts` (专注退格删除逻辑)
  - ✅ `delete.spec.ts` (专注 Delete 键逻辑)
  - ✅ `boundary.spec.ts` (专注边界情况)

## 3. 编写规范

### 3.1 选择器 (Selectors)

所有 CSS 选择器必须在 `selectors.ts` 中定义，禁止在测试代码中硬编码。

```typescript
// selectors.ts
export const CHAT_INPUT_SELECTORS = {
  // 推荐使用 data-testid 增强稳定性
  submitBtn: '[data-testid="submit-btn"]',
  // 复杂组件使用类名
  mentionList: '.skill-mention-list',
} as const
```

### 3.2 辅助函数 (Helpers)

使用 **Page Object 模式** 封装 DOM 操作。Helper 只负责**操作**和**获取状态**，不负责断言（Assertion）。

```typescript
// helpers/feature-helper.ts
export function createFeatureHelper(page: Page) {
  const selectors = CHAT_INPUT_SELECTORS
  return {
    // 动作：点击按钮
    async clickButton() {
      await page.click(selectors.submitBtn)
    },
    // 状态：获取文本
    async getText() {
      return await page.textContent(selectors.result)
    },
  }
}
```

### 3.3 测试页面 (Demo Page)

测试页面 `index.vue` 应提供**纯 UI 交互**的方式来设置测试环境，避免测试代码直接修改组件内部状态。

- **推荐**：添加测试专用按钮（如 "设置空模板"），点击按钮触发状态变更。
- **禁止**：在测试代码中使用 `page.evaluate` 修改组件实例的 `ref` 或 `data`。

### 3.4 测试用例 (Spec)

每个 `test` 应只测试一个具体的场景（Single Responsibility）。

- **命名**：`TC-[模块]-[编号]: [预期行为]`
- **结构**：
  1.  **Arrange**: 准备数据（点击 Demo 页按钮设置状态）
  2.  **Act**: 执行操作（调用 Helper 方法）
  3.  **Assert**: 验证结果（使用 `expect`）

```typescript
test('TC-BS-01: 应该能够删除模板块内的字符', async () => {
  // 1. Arrange
  await helper.setSimpleTemplate()

  // 2. Act
  await helper.focusTemplateBlockEnd(0)
  await helper.pressBackspace()

  // 3. Assert
  await helper.expectTemplateBlockText(0, '张')
})
```

## 4. 开发流程

1.  **修改 Demo (`index.vue`)**：添加必要的测试按钮或状态显示。
2.  **定义选择器 (`selectors.ts`)**：添加新元素的选择器。
3.  **编写 Helper (`helpers/*.ts`)**：封装操作逻辑。
4.  **编写测试 (`specs/*/*.spec.ts`)**：组合 Helper 方法进行测试。
