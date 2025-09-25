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
  abortedText: '（用户停止）',
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

const style = computed(() => {
  if (props.maxWidth) {
    return {
      '--max-width': toCssUnit(props.maxWidth),
    }
  }

  return {}
})
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
    :style="style"
  >
    <div v-if="props.avatar" :class="['tr-bubble__avatar']">
      <component :is="props.avatar"></component>
    </div>
    <slot v-if="props.loading" name="loading" :bubble-props="props">
      <div :class="['tr-bubble__content', { 'border-corner': props.shape === 'corner' }]">
        <img src="../assets/loading.webp" alt="loading" class="tr-bubble__loading" />
      </div>
    </slot>
    <div v-else class="tr-bubble__content-wrapper">
      <div :class="['tr-bubble__content', { 'border-corner': props.shape === 'corner' }]">
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
        <span v-if="props.aborted" class="tr-bubble__aborted">{{ props.abortedText }}</span>
        <div v-if="slots.footer" class="tr-bubble__footer">
          <slot name="footer" :bubble-props="props"></slot>
        </div>
      </div>
      <slot name="trailer" :bubble-props="props"></slot>
    </div>
  </div>
</template>

<style lang="less" scoped>
.tr-bubble {
  /* 不影响布局的变量 */
  --content-bg: var(--tr-bubble-content-bg);
  --content-border-radius: var(--tr-bubble-content-border-radius);
  --content-box-shadow: var(--tr-bubble-content-box-shadow);
  --text-color: var(--tr-bubble-text-color);
  --aborted-color: var(--tr-bubble-aborted-color);

  /* 影响布局的变量 */
  --gap: var(--tr-bubble-gap);
  --max-width: var(--tr-bubble-max-width);
  --avatar-size: var(--tr-bubble-avatar-size);
  --content-padding: var(--tr-bubble-content-padding);
  --content-border: var(--tr-bubble-content-border);
  --text-font-size: var(--tr-bubble-text-font-size);
  --text-line-height: var(--tr-bubble-text-line-height);
  --loading-size: var(--tr-bubble-loading-size);
  --aborted-font-size: var(--tr-bubble-aborted-font-size);
  --content-items-gap: var(--tr-bubble-content-items-gap);
  --footer-margin: var(--tr-bubble-footer-margin);
}

.tr-bubble {
  display: flex;
  gap: var(--gap);
  max-width: var(--max-width);

  &.placement-start {
    flex-direction: row;

    .tr-bubble__content-wrapper {
      align-items: flex-start;
    }

    .tr-bubble__content.border-corner {
      border-top-left-radius: 0;
    }
  }

  &.placement-end {
    flex-direction: row-reverse;
    margin-left: auto;

    .tr-bubble__content-wrapper {
      align-items: flex-end;
    }

    .tr-bubble__content.border-corner {
      border-top-right-radius: 0;
    }
  }
}

.tr-bubble__avatar {
  width: var(--avatar-size);
  height: var(--avatar-size);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tr-bubble__loading {
  width: var(--loading-size);
  height: var(--loading-size);
}

.tr-bubble__content-wrapper {
  display: flex;
  flex-direction: column;
}

.tr-bubble__content {
  background-color: var(--content-bg);
  padding: var(--content-padding);
  border-radius: var(--content-border-radius);
  box-shadow: var(--content-box-shadow);
  border: var(--content-border);

  .tr-bubble__content-items {
    display: flex;
    flex-direction: column;
    gap: var(--content-items-gap);
  }

  .tr-bubble__body-text {
    color: var(--text-color);
    font-size: var(--text-font-size);
    line-height: var(--text-line-height);
    word-break: break-word;
    white-space: pre-line;
  }

  .tr-bubble__aborted {
    color: var(--aborted-color);
    font-size: var(--aborted-font-size);
  }

  .tr-bubble__footer {
    margin: var(--footer-margin);
  }
}
</style>
