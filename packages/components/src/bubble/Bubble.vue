<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { parseMarkdown } from './composables/useMarkdownIt'
import { BubbleProps, BubbleSlots } from './index.type'

const props = withDefaults(defineProps<BubbleProps>(), {
  content: '',
  placement: 'start',
  type: 'text',
  maxWidth: '80%',
})

const slots = defineSlots<BubbleSlots>()

const bubbleContent = ref('')

watchEffect(async () => {
  if (props.transformContent) {
    const content = await props.transformContent(props.content)
    bubbleContent.value = content
    return
  }

  if (props.type === 'markdown') {
    const content = await parseMarkdown(props.content, props.mdConfig, props.domPurifyConfig)
    bubbleContent.value = content
  } else {
    bubbleContent.value = props.content
  }
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
  >
    <div v-if="props.avatar" class="tr-bubble__avatar">
      <component :is="props.avatar"></component>
    </div>
    <div class="tr-bubble__content-wrapper">
      <slot v-if="props.loading" name="loading" :bubble-props="props">
        <div class="tr-bubble__loading">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </slot>
      <div v-else :class="['tr-bubble__content']">
        <div class="tr-bubbule__body">
          <slot :bubble-props="props">
            <span v-if="props.type === 'markdown'" v-html="bubbleContent"></span>
            <span v-else>{{ bubbleContent }}</span>
            <span v-if="props.aborted" class="tr-bubbule__aborted">（用户停止）</span>
          </slot>
        </div>
        <div v-if="slots.footer" class="tr-bubbule__footer">
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
  max-width: v-bind('props.maxWidth');

  &.placement-start {
    flex-direction: row;
  }

  &.placement-end {
    flex-direction: row-reverse;
    margin-left: auto;
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
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 0;

  span {
    height: 8px;
    width: 8px;
    margin: 0 2px;
    background-color: #bbb;
    border-radius: 50%;
    display: inline-block;
    animation: typing 1.4s infinite ease-in-out both;

    &:nth-child(1) {
      animation-delay: 0s;
    }

    &:nth-child(2) {
      animation-delay: 0.2s;
    }

    &:nth-child(3) {
      animation-delay: 0.4s;
    }
  }

  @keyframes typing {
    0%,
    80%,
    100% {
      transform: scale(0);
    }
    40% {
      transform: scale(1);
    }
  }
}

.tr-bubble__content {
  background-color: white;
  padding: 16px 24px;
  border-radius: 24px;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.02);

  .tr-bubbule__body {
    color: rgb(25, 25, 25);
    font-size: 16px;
    line-height: 26px;
    word-break: break-word;
  }

  .tr-bubbule__aborted {
    color: rgb(128, 128, 128);
    font-size: 14px;
  }

  .tr-bubbule__footer {
    margin-top: 12px;
  }
}
</style>

<style lang="less">
div.tr-bubble__code-wrapper {
  margin: 16px 0;
  .tr-bubble__code-toolbar {
    padding: 12px;
    background-color: rgb(245, 245, 245);
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: solid 1px rgba(0, 0, 0, 0.06);
    font-family: Menlo, Monaco, Consolas, 'Courier New', monospace;
    font-size: 14px;
    line-height: 24px;
  }
}

pre:has(> code.tr-bubble__code[class*='language-']) {
  position: relative;
  z-index: 1;
  margin: 0;
  padding: 16px 0;
  background-color: rgb(245, 245, 245);
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
  overflow-x: auto;
  font-size: 14px;
}
pre > code.tr-bubble__code[class*='language-'] {
  padding: 0 16px;
  display: block;
}
</style>
