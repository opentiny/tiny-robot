# Chat-Input 重构与优化方案

本文档基于 `README.md` 的设计哲学，针对当前 `index.vue` 逻辑日益复杂的问题，提出系统的重构与优化方案。

## 1. 背景与目标

随着功能的不断增加，`index.vue` 目前承担了过多的职责：

- **逻辑组装**：手动管理多个 Composable (`useEditor`, `useModeSwitch` 等) 的初始化和依赖注入。
- **状态管理**：手动构建庞大的 `Context` 对象。
- **视图逻辑**：在同一个模板中混合了单行和多行模式的 DOM 结构，导致 `v-if` 分支复杂。
- **依赖耦合**：存在 `useEditor` 和 `useKeyboardShortcuts` 的循环依赖，导致编辑器可能被二次初始化。

**目标**：

- 将 `index.vue` 回归为真正的**哑容器 (Dumb Container)**。
- 建立清晰的**逻辑层 (Logic Layer)** 和 **视图层 (View Layer)** 分离。
- 解决技术债务（循环依赖、性能损耗）。

## 2. 核心原则

遵循 `README.md` 中定义的设计原则：

1.  **哑容器 + 聪明子组件**：主容器只负责结构和 Context 提供，不处理具体业务逻辑。
2.  **组合优于配置**：通过插槽和子组件组合功能，而不是堆砌 Props。
3.  **关注点分离**：视图归视图，逻辑归逻辑。

## 3. 架构演进

### 3.1 现状 (Current)

```
index.vue (God Component)
├── Script
│   ├── useEditor() (初始化)
│   ├── useModeSwitch()
│   ├── useTemplateData()
│   ├── submit() (业务逻辑)
│   ├── useKeyboardShortcuts()
│   ├── useEditor() (二次初始化，注入 Handler) ⚠️ 性能损耗
│   └── Context 组装 (30+ 行代码)
└── Template
    ├── Header
    ├── Main (包含大量 v-if 判断模式)
    │   ├── Prefix
    │   ├── Editor
    │   └── Actions (单行模式逻辑)
    └── Footer (多行模式逻辑)
```

### 3.2 目标 (Target)

引入 **Core Hook** 和 **Layout Components**：

```
index.vue (Dumb Container)
├── Script
│   └── useChatInputCore() (一键获取 context 和 expose)
└── Template
    ├── SingleLineLayout (单行模式视图)
    └── MultiLineLayout (多行模式视图)

composables/useChatInputCore.ts (Logic Layer)
├── 统一管理所有 Hook 的初始化顺序
├── 解决循环依赖
└── 自动组装 Context

components/layouts/ (View Layer)
├── SingleLineLayout.vue
└── MultiLineLayout.vue
```

## 4. 详细重构方案

### Phase 1: 逻辑聚合 (Logic Layer)

创建 `useChatInputCore` Composable，接管 `index.vue` 中的所有逻辑初始化工作。

**优势**：

- `index.vue` 代码量减少 60%。
- 逻辑复用性提高。
- 依赖关系在内部解决，对外透明。

**代码蓝图 (`useChatInputCore.ts`)**:

```typescript
export function useChatInputCore(props: ChatInputProps, emit: ChatInputEmits) {
  // 1. 基础状态
  const mode = ref(props.mode)

  // 2. 初始化编辑器 (只初始化一次)
  const { editor, editorRef } = useEditor(props, emit)

  // 3. 初始化其他 Hook
  const modeSwitch = useModeSwitch(props, editor, editorRef)
  const templateData = useTemplateData({ ... })

  // 4. 定义核心方法 (解决依赖)
  const submit = () => {
    // ... submit logic
  }

  // 5. 键盘处理 (后期绑定，避免二次初始化)
  const keyboardHandlers = useKeyboardShortcuts({ submit, ... })

  // 关键优化：通过 Tiptap Extension 或 setOptions 动态注入 Handler
  // 而不是重新运行 useEditor
  watch(editor, (inst) => {
    if (inst) {
      inst.setOptions({
        editorProps: {
          handleKeyDown: (view, event) => {
             // 代理到 keyboardHandlers
             return keyboardHandlers.handleKeyDown(event)
          }
        }
      })
    }
  })

  // 6. 自动组装 Context
  const context: ChatInputContext = {
    editor,
    editorRef,
    submit,
    ...modeSwitch,
    ...templateData,
    // ... 其他状态
  }

  return {
    context,
    // 需要暴露给父组件的方法
    expose: {
      submit,
      clear: context.clear,
      // ...
    }
  }
}
```

### Phase 2: 视图拆分 (View Layer)

将 `index.vue` 的模板拆分为两个独立的布局组件。

**优势**：

- 消除 `index.vue` 中复杂的 `v-if` 嵌套。
- 每种模式的 DOM 结构更清晰，易于维护。
- 方便未来扩展新的模式（如 "RichTextMode"）。

**代码蓝图 (`index.vue`)**:

```vue
<script setup lang="ts">
import { useChatInputCore } from './composables/useChatInputCore'
import SingleLineLayout from './components/layouts/SingleLineLayout.vue'
import MultiLineLayout from './components/layouts/MultiLineLayout.vue'

const props = defineProps<ChatInputProps>()
const emit = defineEmits<ChatInputEmits>()

// 核心逻辑一键引入
const { context, expose } = useChatInputCore(props, emit)

// 提供 Context
provide(CHAT_INPUT_CONTEXT_KEY, context)

// 暴露方法
defineExpose(expose)
</script>

<template>
  <div class="tr-chat-input" :class="[`tr-chat-input--${context.mode.value}`]">
    <!-- 布局分发 -->
    <SingleLineLayout v-if="context.mode.value === 'single'">
      <!-- 透传插槽 -->
      <template v-for="(_, name) in $slots" #[name]="slotData">
        <slot :name="name" v-bind="slotData" />
      </template>
    </SingleLineLayout>

    <MultiLineLayout v-else>
      <template v-for="(_, name) in $slots" #[name]="slotData">
        <slot :name="name" v-bind="slotData" />
      </template>
    </MultiLineLayout>
  </div>
</template>
```

### Phase 3: 依赖解耦 (Technical Fix)

彻底解决 `useEditor` 和 `useKeyboardShortcuts` 的循环依赖问题。

**方案 A (推荐)**：
编写一个 Tiptap Extension (`KeyboardHandlerExtension`)，专门负责键盘事件的分发。`useEditor` 初始化时注册这个 Extension，后续通过 Context 或 EventBus 与业务逻辑通信。

**方案 B (简易)**：
保持 Composable 模式，但在 `useEditor` 中支持动态更新 `editorProps`，或者在 `useChatInputCore` 中手动调用 `editor.setOptions` 来注入键盘处理器（如 Phase 1 示例所示）。

## 5. 实施路线图

1.  **Refactor Logic**: 创建 `useChatInputCore.ts`，迁移逻辑，解决二次初始化问题。
2.  **Refactor View**: 创建 `layouts/` 目录，拆分 `SingleLineLayout` 和 `MultiLineLayout`。
3.  **Cleanup**: 清理 `index.vue`，使其符合哑容器标准。
4.  **Verify**: 确保所有插槽和 Props 依然正常工作（回归测试）。
