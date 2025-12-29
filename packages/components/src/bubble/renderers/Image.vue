<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { BubbleContentRendererProps } from '../index.type'

const props = defineProps<BubbleContentRendererProps>()

const isLoaded = ref(false)
const hasError = ref(false)

const content = computed(() => {
  if (!Array.isArray(props.message.content)) {
    return null
  }

  return props.message.content[props.contentIndex ?? 0]
})

const imageUrl = computed(() => {
  if (!content.value) {
    return null
  }

  if (typeof content.value.image_url === 'string') {
    return content.value.image_url
  }

  return content.value.image_url.url
})

watch(imageUrl, () => {
  isLoaded.value = false
  hasError.value = false
})

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
    :src="imageUrl"
    :alt="content?.text"
    loading="lazy"
    @load="handleLoad"
    @error="handleError"
    data-type="image"
  />
</template>

<style scoped lang="less">
.tr-bubble__image {
  max-width: var(--tr-bubble-image-max-width);
  max-height: var(--tr-bubble-image-max-height);
  min-width: 120px;
  min-height: 120px;
  height: auto;
  display: block;
  border-radius: var(--tr-bubble-image-border-radius);

  & + .tr-bubble__image {
    margin-top: var(--tr-bubble-image-space-y);
  }

  &.loading {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    background-color: rgba(0, 0, 0, 0.05);
  }
}

[data-box-type]:not([data-box-type='image']) {
  .tr-bubble__image {
    border: var(--tr-bubble-image-embedded-border);
    border-radius: var(--tr-bubble-image-embedded-border-radius);
    margin-block: var(--tr-bubble-image-embedded-margin-block);
  }
}
</style>
