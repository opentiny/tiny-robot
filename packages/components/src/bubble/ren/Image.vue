<script setup lang="ts">
import { ref, watch } from 'vue'
import type { BubbleRendererMessage } from '../index.type'

const props = defineProps<BubbleRendererMessage<{ image_url: string; text?: string }>>()

const isLoaded = ref(false)
const hasError = ref(false)

watch(
  () => props.content.image_url,
  () => {
    isLoaded.value = false
    hasError.value = false
  },
)

const handleLoad = () => {
  isLoaded.value = true
  hasError.value = false
}

const handleError = () => {
  hasError.value = true
  isLoaded.value = true
}
</script>

<template>
  <img
    class="tr-bubble__image"
    :class="{ loading: !isLoaded }"
    :src="props.content.image_url"
    :alt="props.content.text"
    loading="lazy"
    @load="handleLoad"
    @error="handleError"
    data-type="image"
  />
</template>

<style scoped lang="less">
.tr-bubble__image {
  max-width: var(--tr-bubble-image-max-width, 100%);
  max-height: var(--tr-bubble-image-max-height, 240px);
  min-width: 120px;
  min-height: 120px;
  height: auto;
  display: block;
  border-radius: var(--tr-bubble-image-border-radius, 2px);

  & + .tr-bubble__image {
    margin-top: var(--tr-bubble-image-space-y, 8px);
  }

  &.loading {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    background-color: rgba(0, 0, 0, 0.05);
  }
}

[data-box-type]:not([data-box-type='image']) {
  .tr-bubble__image {
    border: var(--tr-bubble-image-embedded-border, 1px solid rgba(0, 0, 0, 0.04));
    border-radius: var(--tr-bubble-image-embedded-border-radius, 4px);

    &:last-child {
      display: inline-block;
    }
  }
}
</style>
