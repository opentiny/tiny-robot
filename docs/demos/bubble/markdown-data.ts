export const mdContent = `# h1 Heading
## Emphasis

**This is bold text**

*This is italic text*

_This is italic text_

~~Strikethrough~~

\`\`\`typescript
// typescript
const msg: string = 'Hello, world!'

console.log(msg)
\`\`\`

\`\`\`vue
// vue
<template>
  <span>{{ msg }}</span>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const msg = ref('hello')
</script>

\`\`\`

\`\`\`unknown
// unknown
unknown
\`\`\`
`
