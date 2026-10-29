<script setup lang="ts">
import { ref } from 'vue'
import { TrExtensionManager } from '@opentiny/tiny-robot'
import type { ExtensionManagerTab } from '@opentiny/tiny-robot'

const narrow = ref(false)

const tabs: ExtensionManagerTab[] = [
  {
    id: 'catalog',
    label: '扩展目录',
    items: [
      {
        id: 'summary',
        name: '内容总结',
        description: '提炼文档重点。',
        installed: true,
        tags: ['写作'],
      },
      {
        id: 'translation',
        name: '翻译助手',
        description: '翻译选中的文本。',
        installed: true,
        tags: ['写作'],
      },
      {
        id: 'repository',
        name: '仓库搜索',
        description: '检索代码和文档。',
        tags: ['开发'],
      },
      {
        id: 'release-notes',
        name: '发布说明',
        description: '根据变更生成版本说明。',
        tags: ['开发'],
      },
    ],
  },
]
</script>

<template>
  <button type="button" :aria-pressed="narrow" @click="narrow = !narrow">
    {{ narrow ? '切换为宽容器' : '切换为窄容器' }}
  </button>
  <p aria-live="polite">当前布局：{{ narrow ? '窄容器' : '宽容器' }}</p>
  <div class="responsive-layout" :class="{ 'is-narrow': narrow }">
    <tr-extension-manager :tabs="tabs" />
  </div>
</template>

<style scoped>
.responsive-layout {
  width: 760px;
  max-width: 100%;
}

.responsive-layout.is-narrow {
  width: 440px;
}
</style>
