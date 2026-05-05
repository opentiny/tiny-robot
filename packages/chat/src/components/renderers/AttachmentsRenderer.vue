<script setup lang="ts">
import type { Attachment, BubbleContentRendererProps } from '@opentiny/tiny-robot'
import { TrAttachments, useMessageContent } from '@opentiny/tiny-robot'
import { computed } from 'vue'

const props = defineProps<BubbleContentRendererProps>()

const { content } = useMessageContent(props)

const attachments = computed<Attachment[]>(() => {
  const attachment = content.value?.attachment

  return [
    {
      ...attachment,
      url: '#',
    },
  ]
})
</script>

<template>
  <div class="attachments-renderer">
    <TrAttachments :items="attachments"></TrAttachments>
  </div>
</template>

<style scoped lang="less">
.attachments-renderer {
  display: flex;
  flex-direction: column;
  gap: 12px;

  :deep(.tr-file-card--picture) {
    margin-bottom: 0;
  }

  :deep(.tr-file-card__close-btn) {
    opacity: 0;
    display: none;
  }
}
</style>
