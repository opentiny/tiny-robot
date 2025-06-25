<script setup lang="ts">
import FileCard from './FileCard.vue'
import type { AttachmentListProps, AttachmentListEmits } from '../index.type'

withDefaults(defineProps<AttachmentListProps>(), {
  overflow: 'wrap',
})

const emit = defineEmits<AttachmentListEmits>()
</script>

<template>
  <div
    v-if="files.length > 0"
    class="tr-attachments__file-list"
    :class="`tr-attachments__file-list--${overflow}`"
    @click.stop
  >
    <FileCard
      v-for="file in files"
      :key="file.uid"
      :file="file"
      :variant="variant"
      :file-icons="fileIcons"
      :disabled="disabled"
      :style="styles?.card"
      :status-type="statusType"
      :custom-actions="customActions"
      :show-status="true"
      @remove="(file) => emit('remove', file)"
      @preview="(file) => emit('preview', file)"
      @download="(file) => emit('download', file)"
      @retry="(file) => emit('retry', file)"
      @action="(payload) => emit('action', payload)"
    />
  </div>
</template>
