# Suggestion 功能测试案例

本目录包含 ChatInput 组件 Suggestion（智能联想）功能的测试案例。

## 测试文件结构

```
suggestion/
├── basic.spec.ts      # 基础功能测试 (4个测试)
├── keyboard.spec.ts   # 键盘交互测试 (6个测试)
└── list.spec.ts       # 列表显示测试 (6个测试)
```

## 测试案例列表

### basic.spec.ts - 基础功能

| 测试ID    | 测试描述                                   | 验证点                             |
| --------- | ------------------------------------------ | ---------------------------------- |
| TC-SUG-01 | 输入任意字符应显示所有建议项（默认不过滤） | 列表可见、数量正确、默认高亮第一项 |
| TC-SUG-02 | 键盘导航建议列表                           | 向下/向上导航、高亮状态切换        |
| TC-SUG-03 | 按 Enter 键选中建议项                      | 选中后内容正确、列表关闭           |
| TC-SUG-04 | 点击选中建议项                             | 鼠标点击选中、列表关闭             |

### keyboard.spec.ts - 键盘交互

| 测试ID       | 测试描述                            | 验证点                 |
| ------------ | ----------------------------------- | ---------------------- |
| TC-SUG-KB-01 | 按 Tab 键应用自动补全               | 自动补全功能、列表关闭 |
| TC-SUG-KB-02 | 按 Esc 键关闭建议列表               | 列表关闭、内容保持     |
| TC-SUG-KB-03 | 向下导航到最后一项后应循环到第一项  | 循环导航逻辑           |
| TC-SUG-KB-04 | 向上导航到第一项后应循环到最后一项  | 反向循环导航           |
| TC-SUG-KB-05 | 导航后按 Enter 应选中当前高亮项     | 导航+选中组合操作      |
| TC-SUG-KB-06 | 导航后按 Tab 应应用当前项的自动补全 | 导航+Tab 组合操作      |

### list.spec.ts - 列表显示

| 测试ID         | 测试描述                     | 验证点             |
| -------------- | ---------------------------- | ------------------ |
| TC-SUG-LIST-01 | 空内容时不应显示建议列表     | 初始状态验证       |
| TC-SUG-LIST-02 | 输入内容后应显示建议列表     | 触发显示逻辑       |
| TC-SUG-LIST-03 | 清空内容后应关闭建议列表     | 清空后关闭         |
| TC-SUG-LIST-04 | 选中建议项后应关闭列表       | 选中后关闭         |
| TC-SUG-LIST-05 | 选中后再次输入应重新显示列表 | 重新触发逻辑       |
| TC-SUG-LIST-06 | 建议列表应显示所有6个建议项  | 所有建议项内容验证 |

## 测试数据

测试使用的建议项数据（在 `index.vue` 中配置）：

```typescript
const suggestions = [
  { content: 'Java' },
  { content: 'JavaScript' },
  { content: 'TypeScript' },
  { content: 'Python' },
  { content: 'C++' },
  { content: 'Golang' },
]
```

## 覆盖的功能点

根据 [chat-input.md](../../../docs/src/components/chat-input.md#智能联想) 文档：

- ✅ 基础用法：不过滤显示所有建议项
- ✅ 键盘导航：↑↓ 选择、Enter/Tab 确认
- ✅ 自动补全提示：Tab 键快速应用
- ✅ Esc 关闭列表
- ✅ 循环导航
- ✅ 列表显示逻辑

## 运行测试

```bash
# 运行所有 suggestion 测试
npx playwright test src/chat-input/specs/suggestion

# 运行特定文件
npx playwright test src/chat-input/specs/suggestion/basic.spec.ts

# 运行特定测试
npx playwright test src/chat-input/specs/suggestion -g "TC-SUG-01"
```

## 测试结果

✅ **所有 16 个测试用例全部通过**

## 未来可扩展测试

1. **自定义过滤**：使用 `filterFn` 的过滤逻辑测试
2. **高亮模式**：三种高亮方式的测试
3. **性能测试**：大量建议项的性能
4. **边界情况**：特殊字符、超长文本等
