<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { FileAttachment } from "../services/chat/types.js";
import { loadFile } from "../services/chat/db.js";
import { formatSize, useUploads } from "../services/attachments.js";
import { translate as t } from "../i18n/index.js";
import Icon from "./Icon.vue";
const props = defineProps<{ file: FileAttachment; canRetry?: boolean }>();
const emit = defineEmits<{ retry: [] }>();
const url = ref<string | null>(),
  failed = ref(false);
const upload = computed(() =>
  props.file.serverId ? null : useUploads.state.value.tasks[props.file.id],
);
const error = computed(() =>
  upload.value?.status === "error" ? t(upload.value.error.key, upload.value.error.params) : "",
);
const canRetry = computed(
  () => props.canRetry && upload.value?.status === "error" && upload.value.retryable,
);
watch(
  () => props.file.id,
  async (id, _, cleanup) => {
    let cancelled = false;
    let objectUrl = "";
    url.value = undefined;
    failed.value = false;
    cleanup(() => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    });
    try {
      const blob = await loadFile(id);
      if (cancelled) return;
      objectUrl = blob ? URL.createObjectURL(blob) : "";
      url.value = objectUrl || null;
    } catch {
      if (!cancelled) url.value = null;
    }
  },
  { immediate: true },
);
function open() {
  if (url.value && !upload.value) window.open(url.value, "_blank", "noopener,noreferrer");
}
</script>
<template>
  <div
    :class="['history-file', { image: file.isImage && url !== null }]"
    :title="error || file.name"
  >
    <a v-if="file.isImage && url && !upload" :href="url" target="_blank" rel="noopener noreferrer"
      ><img v-if="!failed" :src="url" :alt="file.name" @error="failed = true" /><Icon
        v-else
        name="IconPhotoErrorFill20" /></a
    ><template v-else
      ><img
        v-if="file.isImage && url && !failed"
        :src="url"
        :alt="file.name"
        @error="failed = true"
      /><button v-else class="file-card" :disabled="!url || !!upload" @click="open">
        <span>▤</span
        ><span
          >{{ file.name }}<small>{{ formatSize(file.size) }}</small></span
        >
      </button></template
    ><span v-if="upload?.status === 'uploading'" class="file-overlay" role="status">{{
      t("uploadFileStatusUploading")
    }}</span
    ><button
      v-if="canRetry"
      class="file-overlay retry-file"
      :aria-label="t('uploadRetry', { message: error })"
      @click="emit('retry')"
    >
      <Icon name="IconRefreshOutline16" />{{ error }}</button
    ><span v-else-if="error" class="file-error">{{ error }}</span>
  </div>
</template>
