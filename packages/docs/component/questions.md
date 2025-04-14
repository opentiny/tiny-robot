---
outline: deep
---

# TrQuestion 组件说明文档

### 一、组件概述

TrQuestion 是一个用于展示问题列表的通用组件，包含两个主要部分：热门问题弹窗和一般问题悬浮胶囊。组件支持分类展示、问题列表的单行/多行显示切换以及暗色主题适配。

<div style="height: 200px;padding-top:100px;background-color: #f5f5f5;">
<TrQuestion/>
</div>

### 二、组件功能

1. **热门问题弹窗**：

   - 通过左侧固定按钮触发显示
   - 支持问题分类标签切换
   - 展示当前分类下的问题列表

2. **一般问题悬浮胶囊**：

   - 固定在右下角，可展开/收起
   - 展开后显示一般问题列表
   - 支持问题列表的单行/多行显示切换

3. **主题适配**：
   - 支持亮色/暗色主题切换
   - 所有样式变量都通过 CSS 变量定义，方便定制

### 三、组件属性 (Props)

| 属性名              | 类型              | 默认值       | 说明                           |
| ------------------- | ----------------- | ------------ | ------------------------------ |
| categories          | `Array<Category>` | 默认示例数据 | 分类数据（包含标签和问题列表） |
| floatingQuestions   | `Array<Question>` | 默认示例数据 | 悬浮胶囊的一般问题列表         |
| initialExpanded     | `Boolean`         | `false`      | 悬浮胶囊初始是否展开           |
| modalWidth          | `String`          | `"60vw"`     | 弹窗宽度                       |
| theme               | `"light"｜"dark"` | `"light"`    | 主题配色                       |
| closeOnClickOutside | `Boolean`         | `true`       | 点击弹窗外部是否关闭           |
| maxFloatingItems    | `Number`          | `5`          | 悬浮胶囊展开时最大显示问题数   |
| showCategoryIcons   | `Boolean`         | `false`      | 是否在分类标签旁显示图标       |
| loading             | `Boolean`         | `false`      | 数据加载状态                   |
| showPopup           | `Boolean`         | `true`       | 控制弹窗显隐                   |
| wrapQuestions       | `Boolean`         | `false`      | 控制问题是否换行               |

### 四、组件事件 (Events)

| 事件名               | 参数                   | 说明                                   |
| -------------------- | ---------------------- | -------------------------------------- |
| update:showPopup     | `(isVisible: boolean)` | 弹窗显隐状态变化时触发（支持 v-model） |
| update:wrapQuestions | `(isWrapped: boolean)` | 换行状态变化时触发（支持 v-model）     |
| question-click       | `(question: Question)` | 点击问题项时触发                       |
| toggle-popup         | `(isVisible: boolean)` | 弹窗显隐状态变化时触发                 |
| toggle-wrap          | `(isWrapped: boolean)` | 换行状态变化时触发                     |
| select-category      | `(category: Category)` | 分类切换时触发                         |

### 五、插槽 (Slots)

| 插槽名             | 作用域参数                    | 说明                         |
| ------------------ | ----------------------------- | ---------------------------- |
| trigger-button     | `{ isPopupVisible: boolean }` | 左侧触发按钮（控制弹窗显隐） |
| wrap-toggle-button | `{ isWrapped: boolean }`      | 切换按钮（控制换行模式）     |
| category-label     | `{ category: Category }`      | 自定义分类标签内容           |
| question-item      | `{ question: Question }`      | 自定义问题项渲染             |
| floating-header    | `{ isExpanded: boolean }`     | 悬浮胶囊头部区域             |
| loading-indicator  | -                             | 数据加载时的加载动画         |
| empty-state        | -                             | 数据为空时的占位提示         |

### 六、实例方法

| 方法名            | 参数                   | 说明                        |
| ----------------- | ---------------------- | --------------------------- |
| openModal         | -                      | 打开热门问题弹窗            |
| closeModal        | -                      | 关闭热门问题弹窗            |
| toggleFloating    | -                      | 切换悬浮胶囊的展开/收起状态 |
| setActiveCategory | `(categoryId: string)` | 设置当前激活的分类          |
| refreshData       | -                      | 刷新数据                    |

### 七、CSS 变量

所有样式变量都以 `--tr` 开头，主要包括：

- `--tr-question-primary-color`: 主色调
- `--tr-question-background-color`: 背景色
- `--tr-question-text-color`: 文本颜色
- `--tr-question-border-color`: 边框颜色
- `--tr-question-hover-color`: 悬停效果颜色

### 八、使用示例

```vue
<template>
  <tr-question
    v-model:showPopup="showQuestionPopup"
    v-model:wrapQuestions="wrapQuestionMode"
    :categories="questionCategories"
    :floating-questions="commonQuestions"
    :theme="currentTheme"
    @question-click="handleQuestionClick"
  />
</template>

<script setup>
import { ref } from 'vue'

const showQuestionPopup = ref(false)
const wrapQuestionMode = ref(false)
const currentTheme = ref('light')

const questionCategories = [
  {
    id: 'basic',
    label: '基础问题',
    questions: [
      { id: 'q1', text: '什么是弹性云服务器?' },
      { id: 'q2', text: '如何登录到Windows云服务器?' },
    ],
  },
]

const commonQuestions = [
  { id: 'c1', text: '如何注册账号?' },
  { id: 'c2', text: '购买云服务器的付款方式有哪些?' },
]

const handleQuestionClick = (question) => {
  console.log('点击问题:', question.text)
}
</script>
```
