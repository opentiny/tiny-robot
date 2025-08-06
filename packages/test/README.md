# Tiny Robot E2E 测试

这是 Tiny Robot 组件库的端到端（E2E）测试项目，使用 Playwright 进行自动化测试。

## 项目结构

```
packages/test/
├── src/                    # 测试应用源码
│   ├── components/         # 测试组件
│   │   ├── Home.vue       # 首页组件
│   │   └── ContainerDemo.vue # Container 组件演示
│   ├── App.vue            # 主应用组件
│   └── main.ts            # 应用入口
├── tests/                  # 测试用例
│   ├── container.spec.ts  # Container 组件测试
│   └── navigation.spec.ts # 导航测试
├── playwright.config.ts    # Playwright 配置
├── vite.config.ts         # Vite 配置
└── package.json           # 项目配置
```

## 功能特性

- ✅ 基于 Playwright 的 E2E 测试
- ✅ 只使用 Chromium 内核进行测试
- ✅ 包含完整的 Container 组件测试用例
- ✅ 支持 CI/CD 集成
- ✅ 提供测试报告和调试功能

## 快速开始

### 安装依赖

在项目根目录运行：

```bash
pnpm install
```

### 启动测试应用

```bash
# 在根目录运行
pnpm dev:test

# 或者在 packages/test 目录运行
cd packages/test
pnpm dev
```

应用将在 http://localhost:3000 启动。

### 运行测试

```bash
# 在根目录运行所有测试
pnpm test

# 在根目录运行带界面的测试
pnpm test:ui

# 在根目录运行可见浏览器模式
pnpm test:headed

# 在根目录运行调试模式
pnpm test:debug

# 查看测试报告
pnpm test:report
```

### 在 packages/test 目录运行

```bash
cd packages/test
```

> 初次需要安装 Playwright 环境

```bash
# 仅安装chromium
npx playwright install chromium
```

```bash
# 仅安装chromium shell及 系统依赖
npx playwright install --with-deps --only-shell chromium
```
# 运行测试
pnpm test

# 运行带界面的测试
pnpm test:ui

# 运行可见浏览器模式
pnpm test:headed

# 运行调试模式
pnpm test:debug

# 查看测试报告
pnpm test:report

```

## 测试用例说明

### Container 组件测试 (`tests/container.spec.ts`)

测试 Container 组件的以下功能：

1. **初始状态测试**
   - 检查组件初始显示状态
   - 验证按钮的启用/禁用状态

2. **显示/隐藏功能**
   - 测试容器的显示和隐藏
   - 验证状态更新和日志记录

3. **全屏模式切换**
   - 测试全屏模式的进入和退出
   - 验证按钮文本和状态变化

4. **内容区域测试**
   - 验证标题、内容区域、底部区域的显示
   - 测试自定义插槽内容

5. **交互功能测试**
   - 测试自定义操作按钮
   - 测试底部操作按钮
   - 测试容器内的表单交互

6. **内置控件测试**
   - 测试容器内置的关闭按钮
   - 测试容器内置的全屏切换按钮

7. **响应式测试**
   - 测试不同屏幕尺寸下的显示效果

### 导航测试 (`tests/navigation.spec.ts`)

测试应用导航功能：

1. **首页显示测试**
   - 验证页面标题和内容

2. **页面间导航**
   - 测试不同页面间的切换

3. **导航样式测试**
   - 验证导航链接的样式

4. **响应式布局测试**
   - 测试不同设备尺寸下的布局

## 配置说明

### Playwright 配置 (`playwright.config.ts`)

- **测试目录**: `./tests`
- **浏览器**: 仅使用 Chromium
- **并行执行**: 支持并行测试
- **重试机制**: CI 环境下自动重试 2 次
- **报告生成**: CI 使用 GitHub 报告，本地使用 HTML 报告
- **截图和视频**: 失败时自动保存

### Vite 配置 (`vite.config.ts`)

- **端口**: 5173
- **别名配置**: 支持 `@` 和组件库路径别名
- **构建配置**: 生成 sourcemap 便于调试

## CI/CD 集成

项目已配置 GitHub Actions 工作流 (`.github/workflows/e2e-tests.yml`)：

- 在 `push` 和 `pull_request` 时自动运行
- 使用 Ubuntu 最新版本
- 自动安装 Playwright 和 Chromium
- 构建组件后运行测试
- 上传测试报告和结果

## 调试指南

### 本地调试

1. **使用调试模式**：
   ```bash
   pnpm test:debug
   ```

2. **使用可见浏览器模式**：
   ```bash
   pnpm test:headed
   ```

3. **使用 UI 模式**：
   ```bash
   pnpm test:ui
   ```

### 测试失败调试

1. 查看生成的截图和视频（在 `test-results` 目录）
2. 查看 trace 文件（可在 Playwright 报告中查看）
3. 使用 `--debug` 模式单步调试

### 编写新测试

1. 在 `tests` 目录创建新的 `.spec.ts` 文件
2. 使用 `data-testid` 属性标识测试元素
3. 遵循现有测试的命名约定
4. 为测试组织合理的 describe 块

## 最佳实践

1. **使用语义化的测试标识符**：优先使用 `data-testid` 属性
2. **等待异步操作**：使用 `await expect()` 等待元素状态变化
3. **独立的测试用例**：每个测试应该独立，不依赖其他测试的状态
4. **清晰的测试描述**：使用中文描述测试用例的目的
5. **合理的测试粒度**：既要覆盖主要功能，又要避免过度测试

## 故障排除

### 常见问题

1. **测试超时**：检查网络连接和应用启动时间
2. **元素找不到**：确认 `data-testid` 属性正确设置
3. **测试不稳定**：使用 Playwright 的等待机制而不是固定延时

### 性能优化

1. 使用 `test.describe.configure({ mode: 'parallel' })` 并行运行测试
2. 合理设置超时时间
3. 只在必要时保存截图和视频

## 贡献指南

1. 为新组件添加相应的测试用例
2. 保持测试代码的可读性和可维护性
3. 更新文档说明新增的测试功能
4. 确保所有测试在 CI 环境中通过