<script setup lang="ts">
import markdownit from 'markdown-it'
import { computed } from 'vue'
import { toCssUnit } from '../shared/utils'
import { BubbleProps, BubbleSlots } from './index.type'
import Message from './Message.vue'

const props = withDefaults(defineProps<BubbleProps>(), {
  content: '',
  placement: 'start',
  shape: 'corner',
  type: 'text',
  maxWidth: '80%',
})

const slots = defineSlots<BubbleSlots>()

const markdownItInstance = computed(() => {
  return markdownit(props.mdConfig || {})
})

const bubbleContent = computed(() => {
  if (props.type === 'markdown') {
    return markdownItInstance.value.render(props.content)
  }
  return props.content
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
      <div v-else :class="['tr-bubble__content', { 'border-corner': props.shape === 'corner' }]">
        <template v-if="props.messages?.length">
          <Message v-for="(message, index) in props.messages" :key="index" v-bind="message" />
        </template>
        <template v-else>
          <div class="tr-bubbule__body">
            <slot :bubble-props="props">
              <span v-if="props.type === 'markdown'" v-html="bubbleContent"></span>
              <span v-else class="tr-bubbule__body-text">{{ bubbleContent }}</span>
              <span v-if="props.aborted" class="tr-bubbule__aborted">（用户停止）</span>
            </slot>
          </div>
        </template>
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
  max-width: v-bind('toCssUnit(props.maxWidth)');

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

  .tr-bubbule__body-text {
    white-space: pre-line;
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
