# ChatInput Extensions 可插拔架构重构方案

## 目标

将 `TemplateBlock` 和 `SkillMention` 两个扩展从强制依赖改为可选依赖，用户可以按需导入。

## 当前问题

1. **强制导入**：`useEditor.ts` 中硬编码导入了两个扩展
2. **打包体积**：即使用户不需要这些功能，也会被打包进去
3. **灵活性差**：无法自定义扩展配置

## 重构方案

### 方案 1：通过 Props 传递扩展（推荐）⭐

#### 优点

- ✅ 完全灵活：用户可以自定义扩展配置
- ✅ 按需加载：不需要的扩展不会被打包
- ✅ 类型安全：通过 TypeScript 类型推导
- ✅ 扩展性强：未来可以轻松添加更多扩展

#### 实现步骤

##### 1. 修改类型定义

````typescript
// index.type.ts
import type { Extension } from '@tiptap/core'

export interface ChatInputProps {
  // ... 现有 props

  /**
   * 自定义 Tiptap 扩展
   *
   * 允许用户按需添加扩展，如 TemplateBlock、SkillMention 等
   *
   * @example
   * ```vue
   * <ChatInput :extensions="[TemplateBlock, SkillMention.configure({ skills })]" />
   * ```
   */
  extensions?: Extension[]

  // 保留便捷配置（向后兼容）
  /**
   * 技能列表
   *
   * 当提供 skills 时，会自动配置 SkillMention 扩展
   * 如果需要更精细的控制，请使用 extensions prop
   */
  skills?: SkillItem[]
}
````

##### 2. 修改 useEditor.ts

```typescript
// useEditor.ts
import { ref, watch, onBeforeUnmount } from 'vue'
import { useEditor as useTiptapEditor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import type { Extension } from '@tiptap/core'
import type { ChatInputProps, ChatInputEmits, UseEditorReturn, KeyboardHandlers } from '../index.type'

// 移除强制导入
// import { TemplateBlock, SkillMention } from '../extensions'

export function useEditor(
  props: ChatInputProps,
  emit: ChatInputEmits,
  keyboardHandlers?: KeyboardHandlers,
): UseEditorReturn {
  const editorRef = ref<HTMLElement | null>(null)

  // 构建扩展列表
  const buildExtensions = (): Extension[] => {
    const baseExtensions: Extension[] = [
      StarterKit.configure({
        // ... 现有配置
      }),
      Placeholder.configure({
        placeholder: props.placeholder || '请输入内容...',
      }),
      CharacterCount.configure({
        mode: 'textSize',
      }),
    ]

    // 添加用户自定义扩展
    if (props.extensions) {
      baseExtensions.push(...props.extensions)
    }

    return baseExtensions
  }

  const editor = useTiptapEditor({
    content: props.modelValue || props.defaultValue || '',
    extensions: buildExtensions(),
    // ... 其他配置保持不变
  })

  // 监听扩展变化（如果需要动态更新）
  watch(
    () => props.extensions,
    () => {
      if (editor.value) {
        // 重新配置编辑器
        editor.value.setOptions({
          extensions: buildExtensions(),
        })
      }
    },
    { deep: true },
  )

  // ... 其他代码保持不变

  return {
    editor,
    editorRef,
  }
}
```

##### 3. 使用示例

```vue
<!-- 不使用任何扩展 -->
<template>
  <ChatInput v-model="text" />
</template>

<!-- 只使用 TemplateBlock -->
<script setup>
import { ref } from 'vue'
import ChatInput from '@tiny-robot/components'
import { TemplateBlock } from '@tiny-robot/components/chat-input/extensions'

const text = ref('')
</script>

<template>
  <ChatInput v-model="text" :extensions="[TemplateBlock]" />
</template>

<!-- 使用所有扩展 -->
<script setup>
import { ref } from 'vue'
import ChatInput from '@tiny-robot/components'
import { TemplateBlock, SkillMention } from '@tiny-robot/components/chat-input/extensions'
import type { SkillItem } from '@tiny-robot/components'

const text = ref('')
const skills = ref<SkillItem[]>([
  { id: '1', name: '搜索', description: '搜索功能' },
])
</script>

<template>
  <ChatInput v-model="text" :extensions="[TemplateBlock, SkillMention.configure({ skills, char: '@' })]" />
</template>
```

##### 4. 导出扩展供外部使用

```typescript
// packages/components/src/chat-input/index.ts
export { default as ChatInput } from './index.vue'
export type * from './index.type'

// 导出扩展（可选导入）
export { TemplateBlock, SkillMention } from './extensions'
export type { TemplateBlockAttrs, SkillMentionAttrs, SkillItem } from './extensions'
```

---

### 方案 2：功能开关 + 懒加载

#### 优点

- ✅ API 简单：通过布尔值控制
- ✅ 懒加载：使用动态导入减少初始包体积

#### 缺点

- ❌ 灵活性较差：无法自定义扩展配置
- ❌ 运行时成本：需要动态导入和异步处理

#### 实现示例

```typescript
// index.type.ts
export interface ChatInputProps {
  // ... 现有 props

  /**
   * 是否启用模板块扩展
   */
  enableTemplateBlock?: boolean

  /**
   * 是否启用技能提及扩展
   */
  enableSkillMention?: boolean

  /**
   * 技能列表（仅在 enableSkillMention 为 true 时有效）
   */
  skills?: SkillItem[]
}

// useEditor.ts
const buildExtensions = async (): Promise<Extension[]> => {
  const baseExtensions: Extension[] = [
    /* ... */
  ]

  // 按需懒加载扩展
  if (props.enableTemplateBlock) {
    const { TemplateBlock } = await import('../extensions/template-block')
    baseExtensions.push(TemplateBlock)
  }

  if (props.enableSkillMention && props.skills) {
    const { SkillMention } = await import('../extensions/skill-mention')
    baseExtensions.push(
      SkillMention.configure({
        skills: props.skills,
        char: '@',
      }),
    )
  }

  return baseExtensions
}
```

---

### 方案 3：预设配置

提供几种预设配置，用户选择使用哪一种。

#### 优点

- ✅ 简单易用：一个配置搞定

#### 缺点

- ❌ 不够灵活：预设固定，无法精细调整

#### 实现示例

```typescript
export type EditorPreset = 'basic' | 'template' | 'skill' | 'full'

export interface ChatInputProps {
  /**
   * 编辑器预设
   * - basic: 仅基础功能
   * - template: 基础 + 模板块
   * - skill: 基础 + 技能提及
   * - full: 所有功能
   */
  preset?: EditorPreset
}
```

---

## 推荐实施方案

**方案 1（通过 Props 传递扩展）** 是最推荐的方案，因为：

1. **最大灵活性**：用户完全控制使用哪些扩展及其配置
2. **Tree-shaking 友好**：Webpack/Vite 可以优化未使用的代码
3. **类型安全**：TypeScript 提供完整的类型推导
4. **易于维护**：核心组件与扩展解耦，职责清晰

### 分阶段实施

#### 阶段 1：基础重构（必须）

1. 修改 `index.type.ts` 添加 `extensions` prop
2. 修改 `useEditor.ts` 支持自定义扩展
3. 更新导出，使扩展可被外部导入

#### 阶段 2：向后兼容（可选）

保留 `skills` prop，当提供时自动配置 `SkillMention`：

```typescript
const buildExtensions = (): Extension[] => {
  const baseExtensions = [
    /* ... */
  ]

  // 用户提供的扩展优先
  if (props.extensions) {
    baseExtensions.push(...props.extensions)
  }
  // 向后兼容：如果没有提供扩展但提供了 skills，自动配置
  else if (props.skills?.length) {
    const { SkillMention } = require('../extensions')
    baseExtensions.push(
      SkillMention.configure({
        skills: props.skills,
        char: '@',
      }),
    )
  }

  return baseExtensions
}
```

#### 阶段 3：文档和示例（必须）

1. 更新组件文档，说明如何使用自定义扩展
2. 提供常见用例的示例代码
3. 添加迁移指南

---

## 收益分析

### 打包体积优化

假设当前情况：

- 基础组件：50KB
- TemplateBlock：15KB
- SkillMention：20KB
- **总计：85KB**

重构后（只需要基础功能）：

- 基础组件：50KB
- **节省：35KB（41%）**

### 使用灵活性

用户可以：

1. 不使用任何扩展（最小体积）
2. 只使用需要的扩展
3. 自定义扩展配置
4. 添加第三方 Tiptap 扩展

---

## 潜在风险

1. **Breaking Change**：如果直接移除 `skills` prop 会破坏现有代码

   - **解决**：保留 `skills` prop，添加弃用警告

2. **文档更新**：需要更新所有相关文档

   - **解决**：提供详细的迁移指南

3. **测试覆盖**：需要测试各种扩展组合
   - **解决**：添加针对不同扩展组合的测试用例

---

## 总结

推荐使用 **方案 1**，通过 Props 传递扩展的方式实现可插拔架构。这种方案：

- ✅ 提供最大的灵活性
- ✅ 支持 Tree-shaking 优化打包体积
- ✅ 类型安全
- ✅ 易于扩展和维护
- ✅ 可以保持向后兼容

下一步可以开始实施第一阶段的基础重构。
