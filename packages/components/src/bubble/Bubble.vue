<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { toCssUnit } from '../shared/utils'
import { ContentItem } from './components'
import { BubbleContentFunctionRenderer, BubbleProps, BubbleSlots } from './index.type'
import { BubbleContentClassRenderer } from './renderers'

const props = withDefaults(defineProps<BubbleProps>(), {
  content: '',
  placement: 'start',
  shape: 'corner',
  maxWidth: '80%',
})

const slots = defineSlots<BubbleSlots>()

const contentRenderer = computed(() => {
  const renderer = props.contentRenderer

  if (!renderer) {
    return null
  }

  if (typeof renderer === 'function') {
    const renderFn = renderer as BubbleContentFunctionRenderer
    return { isComponent: false, vNodeOrComponent: renderFn(props) }
  }

  if (renderer instanceof BubbleContentClassRenderer) {
    return { isComponent: false, vNodeOrComponent: renderer.render(props) }
  }

  return { isComponent: true, vNodeOrComponent: renderer }
})

const attrs = useAttrs()

const customContent = computed(() => {
  if (!props.customContentField) {
    return null
  }

  const value = attrs[props.customContentField]

  // value 是字符串，或者是数组且长度大于0
  if (typeof value === 'string' || (Array.isArray(value) && value.length > 0)) {
    return value
  }

  return null
})

const finalContent = computed(() => customContent.value || props.content)

const bubbleContent = computed(() => {
  if (Array.isArray(finalContent.value)) {
    return ''
  }

  return finalContent.value
})

const contentItems = computed(() => {
  if (Array.isArray(finalContent.value)) {
    return finalContent.value
  }

  return []
})

const placementStart = computed(() => props.placement === 'start')
</script>

<template>
  <div
    :class="[
      'tr-bubble',
      {
        'placement-start': placementStart,
        'placement-end': !placementStart,
      },
    ]"
    :style="{ maxWidth: toCssUnit(props.maxWidth) }"
  >
    <div v-if="props.avatar" class="tr-bubble__avatar">
      <component :is="props.avatar"></component>
    </div>
    <div class="tr-bubble__content-wrapper">
      <slot v-if="props.loading" name="loading" :bubble-props="props">
        <div :class="['tr-bubble__content', { 'border-corner': props.shape === 'corner' }]">
          <img src="../assets/loading.webp" alt="loading" class="tr-bubble__loading" />
        </div>
      </slot>
      <div v-else :class="['tr-bubble__content', { 'border-corner': props.shape === 'corner' }]">
        <template v-if="contentItems.length">
          <div class="tr-bubble__content-items">
            <ContentItem v-for="(item, index) in contentItems" :key="index" :item="item" />
          </div>
        </template>
        <template v-else>
          <slot :bubble-props="props">
            <template v-if="contentRenderer">
              <component
                v-if="contentRenderer.isComponent"
                :is="contentRenderer.vNodeOrComponent"
                v-bind="props"
              ></component>
              <component v-else :is="contentRenderer.vNodeOrComponent"></component>
            </template>
            <span v-else class="tr-bubble__body-text">{{ bubbleContent }}</span>
          </slot>
        </template>
        <span v-if="props.aborted" class="tr-bubble__aborted">（用户停止）</span>
        <div v-if="slots.footer" class="tr-bubble__footer">
          <slot name="footer" :bubble-props="props"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.tr-bubble {
  display: flex;
  gap: 16px;

  &.placement-start {
    flex-direction: row;

    .tr-bubble__content.border-corner {
      border-top-left-radius: 0;
    }
  }

  &.placement-end {
    flex-direction: row-reverse;
    margin-left: auto;

    .tr-bubble__content.border-corner {
      border-top-right-radius: 0;
    }
  }
}

.tr-bubble__avatar {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tr-bubble__loading {
  width: 24px;
  height: 24px;
}

.tr-bubble__content {
  background-color: white;
  padding: 16px 24px;
  border-radius: 24px;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.02);

  .tr-bubble__content-items {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .tr-bubble__body-text {
    color: rgb(25, 25, 25);
    font-size: 16px;
    line-height: 26px;
    word-break: break-word;
    white-space: pre-line;
  }

  .tr-bubble__aborted {
    color: rgb(128, 128, 128);
    font-size: 14px;
  }

  .tr-bubble__footer {
    margin-top: 12px;
  }
}
</style>
