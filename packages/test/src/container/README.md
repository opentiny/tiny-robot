# Container 组件测试工具

这个目录包含了 Container 组件测试相关的所有文件，包括选择器常量、测试辅助工具、测试用例和演示组件。

## 📁 文件结构

```
packages/test/src/container/
├── Selectors.ts      # 选择器常量定义
├── TestHelper.ts     # 测试辅助工具
├── index.spec.ts     # 完整的测试用例
├── index.vue         # 测试演示组件
└── README.md         # 文档说明
```

## 📚 API 参考

### 测试范围

- 测试 Container 组件的基本功能，包括显示/隐藏、全屏模式切换等
- 验证组件的结构和样式是否正确
- 测试插槽内容和自定义操作按钮的显示

### 核心文件说明

#### `Selectors.ts` - 选择器常量定义

```typescript
// 主要导出
export const CONTAINER_SELECTORS: Record<string, string>
export type ContainerSelectors = typeof CONTAINER_SELECTORS
export function getContainerSelector(key: keyof ContainerSelectors): string
```

#### `TestHelper.ts` - 测试辅助工具

```typescript
// 主要导出
export interface ContainerTestHelperOptions extends TestUtilsOptions {
  containerSelectors?: Partial<ContainerSelectors>
}

export function createContainerTestHelper(
  page: Page,
  options?: ContainerTestHelperOptions
): ContainerTestHelper

// 返回的对象包含以下方法
interface ContainerTestHelper {
  // 容器操作
  showContainer(): Promise<void>
  hideContainer(): Promise<void>
  toggleFullscreen(): Promise<void>
  closeContainerByInternalBtn(): Promise<void>
  toggleFullscreenByInternalBtn(): Promise<void>

  // 容器状态检查
  expectContainerVisible(visible: boolean): Promise<void>
  expectContainerFullscreen(fullscreen: boolean): Promise<void>

  // 插槽内容检查
  expectTitleSlot(title: string): Promise<void>
  expectDefaultSlot(content: string): Promise<void>
  expectFooterSlot(footer: string): Promise<void>
  expectOperationsSlot(operations: string): Promise<void>

  // 交互操作
  clickCustomOperation(operation: string): Promise<void>

  // 工具方法
  getContainer(): Locator

  // 暴露基础测试工具
  ...testUtils,

  // 暴露选择器配置
  selectors: ContainerSelectors
}
```

## 🚀 快速开始

### 安装依赖

```bash
# 确保安装了必要的依赖
pnpm install @playwright/test
```

### 基本使用

```typescript
import { test } from '@playwright/test'
import { createContainerTestHelper } from './TestHelper'

test('Container 基础功能测试', async ({ page }) => {
  // 创建测试助手
  const helper = createContainerTestHelper(page)

  // 执行测试操作
  await helper.showContainer()
  await helper.expectContainerStatus(true, false)
  await helper.toggleFullscreen()
  await helper.expectContainerStatus(true, true)
})
```

## 📋 可用选择器

| 选择器键 | 描述 | 默认值 |
|---------|------|--------|
| `toggleShowBtn` | 切换容器可见性按钮 | `[data-testid="toggle-show-btn"]` |
| `toggleFullscreenBtn` | 切换全屏模式按钮 | `[data-testid="toggle-fullscreen-btn"]` |
| `container` | 主容器元素 | `[data-testid="test-container"]` |
| `containerDraggingBar` | 拖拽条 | `.tr-container__dragging-bar` |
| `containerHeader` | 头部区域 | `.tr-container__header` |
| `containerHeaderOperations` | 头部操作区域 | `.tr-container__header-operations` |
| `containerFooter` | 底部区域 | `.tr-container__footer` |
| `containerCloseBtn` | 关闭按钮 | `.tr-container__header-operations button:last-child` |
| `containerFullscreenBtn` | 全屏按钮 | `.tr-container__header-operations button:nth-last-child(2)` |
| `containerTitle` | 标题区域 | `[data-testid="container-title"]` |
| `containerContent` | 内容区域 | `[data-testid="container-content"]` |
| `containerFooterContent` | 底部内容区域 | `[data-testid="container-footer"]` |
| `customOperationBtn` | 自定义操作按钮 | `[data-testid="custom-operation-btn"]` |

## 🔧 详细使用指南

### 1. 基本使用模式

```typescript
import { test, expect } from '@playwright/test'
import { createContainerTestHelper } from './TestHelper'

test.describe('Container 组件测试套件', () => {
  let helper: ReturnType<typeof createContainerTestHelper>

  test.beforeEach(async ({ page }) => {
    helper = createContainerTestHelper(page)
    await helper.waitForPageLoad('/container-demo')
  })

  test('显示和隐藏容器', async () => {
    await helper.showContainer()
    await helper.expectContainerStatus(true, false)

    await helper.hideContainer()
    await helper.expectContainerStatus(false, false)
  })

  test('全屏模式切换', async () => {
    await helper.showContainer()
    await helper.toggleFullscreen()
    await helper.expectContainerStatus(true, true)
  })
})
```

### 2. 自定义配置

```typescript
import { createContainerTestHelper } from './TestHelper'

test('使用自定义选择器', async ({ page }) => {
  const helper = createContainerTestHelper(page, {
    defaultTimeout: 10000, // 自定义超时时间
    containerSelectors: {
      toggleShowBtn: '[data-testid="my-custom-show-btn"]',
      demoInput: '[data-testid="my-custom-input"]'
    }
  })

  // 使用自定义选择器进行测试
  await helper.showContainer() // 使用自定义的 showBtn 选择器
})
```

## 🔧 最佳实践

### 1. 选择器管理

```typescript
// ✅ 推荐：使用常量
const showBtn = CONTAINER_SELECTORS.toggleShowBtn

// ❌ 避免：硬编码字符串
const showBtn = '[data-testid="toggle-show-btn"]'
```

### 2. 类型安全

```typescript
// ✅ TypeScript 编译时检查
const validSelector = CONTAINER_SELECTORS.toggleShowBtn // 编译通过
// const invalidSelector = CONTAINER_SELECTORS.nonExistent // 编译错误

// ✅ 类型安全的动态访问
const selector = getContainerSelector('toggleShowBtn') // 类型安全

// ✅ 自定义选择器类型安全
const customSelectors: Partial<ContainerSelectors> = {
  toggleShowBtn: '[data-testid="my-show-btn"]'
}
```