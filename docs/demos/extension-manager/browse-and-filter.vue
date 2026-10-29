<script setup lang="ts">
import { TrExtensionManager } from '@opentiny/tiny-robot'
import type { ExtensionManagerTab } from '@opentiny/tiny-robot'

const tabs: ExtensionManagerTab[] = [
  {
    id: 'catalog',
    label: '扩展目录',
    items: [
      { id: 'summary', name: '内容总结', description: '提炼文档重点。', installed: true, tags: ['写作'] },
      { id: 'translate', name: '翻译助手', description: '翻译选中的文本。', tags: ['写作', '效率'] },
      { id: 'repository', name: '仓库搜索', description: '检索代码和文档。', tags: ['开发'] },
    ],
  },
  {
    id: 'updates',
    label: '更新',
    items: [{ id: 'release-note', name: '发布说明', description: '生成版本说明。', tags: ['开发'] }],
  },
]
</script>

<template>
  <tr-extension-manager :tabs="tabs" />
</template>
