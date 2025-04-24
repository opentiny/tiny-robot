<template>
  <tr-bubble :content="mdContent" :avatar="aiAvatar" type="markdown"></tr-bubble>
</template>

<script setup lang="ts">
// import { TrBubble } from '@opentiny/tiny-robot'
import { IconAi } from '@opentiny/tiny-robot-svgs'
import { h } from 'vue'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })

const mdContent = `# h1 Heading
## Emphasis

**This is bold text**

*This is italic text*

_This is italic text_

~~Strikethrough~~
`
</script>
