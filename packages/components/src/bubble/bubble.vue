<script setup lang="ts">
import markdownit from 'markdown-it'
import { computed, useSlots } from 'vue'
import { CopyAction, RefreshAction } from './components/actions'
import { BubbleActionOptions, BubbleEvents, BubbleProps, BubbleSlots } from './index.type'

const props = withDefaults(defineProps<BubbleProps>(), {
  content: '',
  placement: 'start',
  type: 'text',
  maxWidth: '80%',
})

const emit = defineEmits<BubbleEvents>()

defineSlots<BubbleSlots>()

const slots = useSlots()

const bubbleContent = computed(() => {
  if (props.type === 'markdown') {
    return markdownit(props.mdConfig || {}).render(props.content)
  }
  return props.content
})

const placementStart = computed(() => props.placement === 'start')

const defaultActionsMap = new Map<string, BubbleActionOptions>([
  [
    'copy',
    {
      name: 'copy',
      vnode: CopyAction,
      show: true,
    },
  ],
  [
    'refresh',
    {
      name: 'refresh',
      vnode: RefreshAction,
      show: true,
    },
  ],
])

const computedActions = computed(() => {
  const actions = (props.actions || []).map((action) => {
    if (typeof action === 'string') {
      return defaultActionsMap.get(action)
    }

    if (defaultActionsMap.has(action.name)) {
      return {
        ...defaultActionsMap.get(action.name),
        ...action,
      }
    }

    return action
  })

  return actions.filter((action): action is BubbleActionOptions => Boolean(action))
})

const handleActionClick = (name: string, ...args: unknown[]) => {
  if (name === 'copy') {
    emit('copy', args[0] as boolean)
    return
  }

  if (name === 'refresh') {
    emit('refresh')
    return
  }

  emit('action', name, ...args)
}
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
      <slot v-if="props.loading" name="loading">
        <div class="tr-bubble__loading">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </slot>
      <div v-else :class="['tr-bubble__content']">
        <div class="tr-bubbule__body">
          <slot>
            <span v-if="props.type === 'markdown'" v-html="bubbleContent"></span>
            <span v-else>{{ bubbleContent }}</span>
            <span v-if="props.aborted" class="tr-bubbule__aborted">（用户停止）</span>
          </slot>
        </div>
        <div v-if="slots.footer || computedActions.length > 0" class="tr-bubbule__footer">
          <div class="tr-bubbule__footer-left">
            <slot name="footer"></slot>
          </div>
          <div class="tr-bubbule__footer-actions">
            <template v-for="action in computedActions" :key="action?.name">
              <component
                :is="action.vnode"
                v-show="typeof action.show === 'function' ? action.show(props) : action.show"
                :bubbleItem="props"
                @click="handleActionClick(action.name, $event)"
              ></component>
            </template>
          </div>
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
    display: flex;
    gap: 12px;

    .tr-bubbule__footer-left {
      flex: 1;
    }

    .tr-bubbule__footer-actions {
      display: flex;
      flex-shrink: 0;
      gap: 4px;
      margin-top: 12px;

      & > * {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
      }
    }
  }
}
</style>
