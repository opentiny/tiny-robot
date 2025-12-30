<template>
  <tr-bubble :content="mdContent" :avatar="aiAvatar" :content-renderer="markdownRenderer"></tr-bubble>
</template>

<script setup lang="ts">
import { BubbleMarkdownContentRenderer, TrBubble } from '@opentiny/tiny-robot'
import { IconAi } from '@opentiny/tiny-robot-svgs'
import { h } from 'vue'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })

const markdownRenderer = new BubbleMarkdownContentRenderer()

const mdContent = `# h1 Heading
## Emphasis

**This is bold text**

*This is italic text*

_This is italic text_

~~Strikethrough~~
`
</script>
