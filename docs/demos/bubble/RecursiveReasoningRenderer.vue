<script setup lang="ts">
import { type BubbleContentRendererProps, useBubbleContentRenderer, useOmitMessageFields } from '@opentiny/tiny-robot'
import { computed } from 'vue'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps<BubbleContentRendererProps>()

const { restMessage, restProps } = useOmitMessageFields(props, ['reasoning_content'])
const renderer = useBubbleContentRenderer(restMessage, props.contentIndex)

const recursiveProps = computed(() => ({
  ...renderer.value.attributes,
  ...restProps.value,
}))
</script>

<template>
  <section class="custom-reasoning" data-type="custom-reasoning" v-bind="$attrs">
    <div class="custom-reasoning__title">自定义推理过程</div>
    <p class="custom-reasoning__content">{{ props.message.reasoning_content }}</p>
  </section>
  <component :is="renderer.renderer" v-bind="recursiveProps" />
</template>

<style scoped>
.custom-reasoning {
  margin-bottom: 8px;
  padding-left: 10px;
  border-left: 2px solid #8b5cf6;
  color: #666;
}

.custom-reasoning__title {
  font-size: 13px;
  font-weight: 600;
  line-height: 20px;
}

.custom-reasoning__content {
  margin: 4px 0 0;
  font-size: 13px;
  line-height: 20px;
  white-space: pre-wrap;
}
</style>
