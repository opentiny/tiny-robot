<script setup lang="ts">
import type { Config as DOMPurifyConfig } from 'dompurify'
import type { Options as MarkdownItOptions } from 'markdown-it'
import { onMounted, ref, watchEffect } from 'vue'
import { useBubbleStore, useMessageContent } from '../composables'
import { BubbleContentRendererProps } from '../index.type'
import { getMarkdownItAndDompurify } from '../utils'
import Text from './Text.vue'

const props = defineProps<BubbleContentRendererProps>()

const { contentText: content } = useMessageContent(props)

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
    const md = markdown(mdConfig || {})

    // Safari needs an explicit tab stop to make code blocks scrollable with the keyboard.
    for (const rule of ['fence', 'code_block']) {
      const renderCodeBlock = md.renderer.rules[rule]

      if (!renderCodeBlock) {
        continue
      }

      md.renderer.rules[rule] = (...args) =>
        renderCodeBlock(...args).replace(/^<pre(?=[\s>])/i, '<pre tabindex="0" role="region" aria-label="Code block"')
    }

    markdownContent.value = dompurify.sanitize(md.render(content.value), dompurifyConfig)
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
  :deep(p) {
    overflow-wrap: anywhere;
  }

  :deep(pre) {
    max-width: 100%;
    overflow-x: auto;
  }
}
</style>
