# Container 组件测试工具

这个目录包含了 Container 组件测试相关的所有文件，包括选择器常量、测试辅助工具、测试用例和演示组件。

## 📁 文件结构

```
packages/test/src/container/
├── containerSelectors.ts      # 选择器常量定义
├── containerTestHelper.ts     # 测试辅助工具
├── container.spec.ts          # 完整的测试用例
├── ContainerDemo.vue          # 测试演示组件
└── README.md                  # 文档说明
```

## 📚 API 参考

### 核心文件说明

#### `containerSelectors.ts` - 选择器常量定义

```typescript
// 主要导出
export const CONTAINER_SELECTORS: Record<string, string>
export type ContainerSelectors = typeof CONTAINER_SELECTORS
export function getContainerSelector(key: keyof ContainerSelectors): string
```

#### `containerTestHelper.ts` - 测试辅助工具

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
  expectContainerStatus(visible: boolean, fullscreen: boolean): Promise<void>

  // 日志操作
  expectLogContains(message: string): Promise<void>
  clearLogs(): Promise<void>

  // 交互操作
  testContainerInteraction(inputText: string): Promise<void>
  setDemoInput(input: string): Promise<void>
  expectDemoInput(input: string): Promise<void>

  // 元素获取
  getContainer(): Locator

  // 基础测试工具
  click(selector: string, timeout?: number): Promise<void>
  waitForText(selector: string, text: string, timeout?: number): Promise<void>
  // ... 更多基础方法

  // 配置信息
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
import { createContainerTestHelper } from './src/container/containerTestHelper'

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
| `showBtn` | 显示容器按钮 | `[data-testid="show-container-btn"]` |
| `hideBtn` | 隐藏容器按钮 | `[data-testid="hide-container-btn"]` |
| `toggleFullscreenBtn` | 全屏切换按钮 | `[data-testid="toggle-fullscreen-btn"]` |
| `container` | 主容器元素 | `[data-testid="test-container"]` |
| `containerStatus` | 容器状态显示 | `[data-testid="container-status"]` |
| `fullscreenStatus` | 全屏状态显示 | `[data-testid="fullscreen-status"]` |
| `actionLog` | 操作日志区域 | `[data-testid="action-log"]` |
| `clearLogsBtn` | 清空日志按钮 | `[data-testid="clear-logs-btn"]` |
| `demoInput` | 演示输入框 | `[data-testid="demo-input"]` |
| `demoInputValue` | 输入值显示 | `[data-testid="demo-input-value"]` |
| `containerTitle` | 容器标题 | `[data-testid="container-title"]` |
| `containerContent` | 容器内容区域 | `[data-testid="container-content"]` |
| `containerFooter` | 容器底部区域 | `[data-testid="container-footer"]` |
| `containerDraggingBar` | 拖拽条 | `.tr-container__dragging-bar` |
| `containerHeaderOperations` | 头部操作区域 | `.tr-container__header-operations` |
| `customOperationBtn` | 自定义操作按钮 | `[data-testid="custom-operation-btn"]` |
| `footerActionBtn` | 底部操作按钮 | `[data-testid="footer-action-btn"]` |

## 🔧 详细使用指南

### 1. 基本使用模式

```typescript
import { test, expect } from '@playwright/test'
import { createContainerTestHelper } from './src/container/containerTestHelper'

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
import { createContainerTestHelper } from './src/container/containerTestHelper'

test('使用自定义选择器', async ({ page }) => {
  const helper = createContainerTestHelper(page, {
    defaultTimeout: 10000, // 自定义超时时间
    containerSelectors: {
      showBtn: '[data-testid="my-custom-show-btn"]',
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
const showBtn = CONTAINER_SELECTORS.showBtn

// ❌ 避免：硬编码字符串
const showBtn = '[data-testid="show-container-btn"]'
```

### 2. 类型安全

```typescript
// ✅ TypeScript 编译时检查
const validSelector = CONTAINER_SELECTORS.showBtn // 编译通过
// const invalidSelector = CONTAINER_SELECTORS.nonExistent // 编译错误

// ✅ 类型安全的动态访问
const selector = getContainerSelector('showBtn') // 类型安全

// ✅ 自定义选择器类型安全
const customSelectors: Partial<ContainerSelectors> = {
  showBtn: '[data-testid="my-show-btn"]'
}
```