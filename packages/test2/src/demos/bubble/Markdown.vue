<script setup lang="ts">
import { Bubble, BubbleMarkdownRenderer } from '@opentiny/tiny-robot'
import Avatar from '../Avatar.vue'

const content = `# 标题

## 二级标题

普通段落，包含 **加粗**、_斜体_、\`行内代码\`。

- 列表 A
- 列表 B

> 引用内容。

\`\`\`js
console.log('code block');
\`\`\`

[链接](https://placedog.net/400/369?id=238)
`
</script>

<template>
  <section>
    <p><strong>Markdown 消息</strong></p>
    <Bubble
      class="markdown-bubble"
      :content="content"
      :avatar="Avatar"
      :fallback-content-renderer="BubbleMarkdownRenderer"
    >
    </Bubble>
  </section>
</template>

<style scoped>
.markdown-bubble {
  --tr-bubble-box-bg: transparent;
}
</style>
