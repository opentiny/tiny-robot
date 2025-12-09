<script setup lang="ts">
import MarkdownRender from 'markstream-vue'
import 'markstream-vue/index.css'

const md = `# Hello

这是一个测试页面。左侧编辑输入，右侧实时预览渲染结果。

示例包含：

  - **加粗**、*斜体*、\`inline code\`

强调链接：
- **[DR (Danmarks Radio)](https://www.dr.dk/nyheder)**
- **[DR **(Danmarks Radio)](https://www.dr.dk/nyheder)**
- **[DR (Danmarks Radio)**](https://www.dr.dk/nyheder)**
- **[DR **(Danmarks Radio)**](https://www.dr.dk/nyheder)**

代码块：

\`\`\`js
console.log('hello')
\`\`\`

数学：$$E=mc^2$$
`
</script>

<template>
  <MarkdownRender :content="md" />
</template>
