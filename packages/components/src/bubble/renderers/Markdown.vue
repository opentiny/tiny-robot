<script setup lang="ts">
import type { Config as DOMPurifyConfig } from 'dompurify'
import type { Options as MarkdownItOptions } from 'markdown-it'
import { computed, onMounted, ref, watchEffect } from 'vue'
import { useBubbleStore } from '../composables'
import { BubbleContentRendererProps } from '../index.type'
import { getMarkdownItAndDompurify } from '../utils'
import Text from './Text.vue'

const props = defineProps<BubbleContentRendererProps>()

const content = computed(() => {
  if (typeof props.message.content === 'string') {
    return props.message.content
  }

  return props.message.content?.[props.contentIndex ?? 0].text
})

const markdownItAndDompurify = ref<Awaited<ReturnType<typeof getMarkdownItAndDompurify>>>(null)

onMounted(async () => {
  markdownItAndDompurify.value = await getMarkdownItAndDompurify()
})

const { mdConfig, dompurifyConfig } = useBubbleStore<{
  mdConfig?: MarkdownItOptions
  dompurifyConfig?: DOMPurifyConfig
}>()

const markdownContent = ref('')

watchEffect(() => {
  if (markdownItAndDompurify.value) {
    const { markdown, dompurify } = markdownItAndDompurify.value
    markdownContent.value = markdown(mdConfig || {}).render(String(content.value))
    dompurify.sanitize(markdownContent.value, dompurifyConfig)
  }
})
</script>

<template>
  <div
    v-if="markdownContent"
    class="tr-bubble__markdown markdown-body"
    data-type="markdown"
    v-html="markdownContent"
  ></div>
  <Text v-else v-bind="props" />
</template>

<style scoped lang="less">
.tr-bubble__markdown {
  font-size: var(--tr-bubble-text-font-size);
  line-height: var(--tr-bubble-text-line-height);
  color: var(--tr-bubble-text-color);
}
</style>
