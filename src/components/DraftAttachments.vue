<script setup lang="ts">
import { TrAttachments, type Attachment } from "@opentiny/tiny-robot";
import { useUploads, formatSize } from "../services/attachments.js";
import { translate as t } from "../i18n/index.js";
import Icon from "./Icon.vue";
defineProps<{ items: Attachment[]; disabled: boolean }>();
const emit = defineEmits<{ remove: [file: Attachment]; retry: [file: Attachment] }>();
const uploads = useUploads.state;
function failure(file: Attachment) {
  const task = uploads.value.tasks[file.id || ""];
  return task?.status === "error" ? task : null;
}
function reason(file: Attachment) {
  const error = failure(file);
  return error ? t(error.error.key, error.error.params) : "";
}
function image(file: Attachment) {
  return file.rawFile?.type.startsWith("image/") || file.fileType === "image";
}
</script>
<template>
  <div class="draft-attachments">
    <div
      v-for="file in items"
      :key="file.id"
      :class="[
        'draft-attachment',
        { 'draft-image': image(file), 'draft-error': file.status === 'error' },
      ]"
      :title="reason(file) || file.name"
    >
      <TrAttachments
        :items="[file]"
        :variant="image(file) ? 'picture' : 'card'"
        :actions="[]"
        disabled
      />
      <div v-if="image(file) && file.status === 'uploading'" class="draft-image-state">
        <span class="file-spinner" />
      </div>
      <button
        v-else-if="image(file) && failure(file)?.retryable"
        class="draft-image-state"
        :disabled="disabled"
        :aria-label="t('uploadRetry', { message: reason(file) })"
        @click="emit('retry', file)"
      >
        <Icon name="IconRefreshOutline16" />
      </button>
      <span v-else-if="image(file) && file.status === 'error'" class="draft-image-state">{{
        reason(file)
      }}</span>
      <div v-if="!image(file)" class="draft-file-status">
        <span>{{
          file.status === "uploading"
            ? t("uploadFileStatusUploading")
            : file.status === "error"
              ? reason(file)
              : formatSize(file.size || 0)
        }}</span
        ><button
          v-if="failure(file)?.retryable"
          :disabled="disabled"
          :aria-label="t('uploadRetry', { message: reason(file) })"
          @click="emit('retry', file)"
        >
          <Icon name="IconRefreshOutline16" />
        </button>
      </div>
      <button
        v-if="!disabled"
        class="draft-remove"
        :aria-label="t('delete')"
        :title="t('delete')"
        @click="emit('remove', file)"
      >
        <Icon name="IconCloseFill14" />
      </button>
    </div>
  </div>
</template>
