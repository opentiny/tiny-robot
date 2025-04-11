<script setup lang="ts">
import markdownit from 'markdown-it'
import { computed } from 'vue'
import { BubbleActionOptions, BubbleItemProps } from '../bubble-list/index.type'
import { CopyAction, RefreshAction } from './components/actions'
import { AIIcon, UserIcon } from './components/icons'

const props = withDefaults(defineProps<BubbleItemProps>(), {
  content: '',
  type: 'text',
  status: 'complete',
  maxWidth: '80%',
})

const bubbleContent = computed(() => {
  if (props.type === 'markdown') {
    return markdownit(props.mdConfig || {}).render(props.content)
  }
  return props.content
})

const isUserRole = computed(() => props.role === 'user')

const isAlignRight = computed(() => {
  if (props.roleConfig?.align) {
    return props.roleConfig.align === 'right'
  }

  return isUserRole.value
})

const avatarVNode = computed(() => {
  const avatar = props.roleConfig?.avatar
  if (avatar) {
    return () => avatar
  }

  return isUserRole.value ? UserIcon : AIIcon
})

const defaultActionsMap = new Map<string, BubbleActionOptions>([
  [
    'copy',
    {
      name: 'copy',
      vnode: CopyAction,
      show: () => props.status === 'complete' || props.status === 'aborted',
    },
  ],
  [
    'regenerate',
    {
      name: 'regenerate',
      vnode: RefreshAction,
      show: () => props.status === 'complete' || props.status === 'aborted',
    },
  ],
])

const computedActions = computed(() => {
  const getActions = () => {
    if (Array.isArray(props.actions) && props.actions.length > 0) {
      return props.actions
    }

    if (props.role === 'ai') {
      return ['regenerate', 'copy']
    }

    return ['copy']
  }

  const actions = getActions().map((action) => {
    if (typeof action === 'string') {
      return defaultActionsMap.get(action)
    }

    return action
  })

  return actions.filter((action): action is BubbleActionOptions => Boolean(action))
})

const emit = defineEmits(['actionClick'])

const handleActionClick = (name: string, ...args: unknown[]) => {
  emit('actionClick', name, ...args)
}
</script>

<template>
  <div
    :class="[
      'tr-bubble',
      {
        'align-left': !isAlignRight,
        'align-right': isAlignRight,
      },
    ]"
  >
    <div class="tr-bubble__avatar">
      <component :is="avatarVNode"></component>
    </div>
    <slot v-if="props.status === 'loading'" name="loading">
      <div class="tr-bubble__load-wrap">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </slot>
    <div
      v-else
      :class="[
        'tr-bubble__content',
        { 'tr-bubble__content-role-ai': !isUserRole },
        { 'tr-bubble__content-role-user': isUserRole },
      ]"
    >
      <div class="tr-bubbule__body">
        <span v-if="props.type === 'markdown'" v-html="bubbleContent"></span>
        <span v-else>{{ bubbleContent }}</span>
        <span v-if="props.status === 'aborted'" class="tr-bubbule__aborted">（用户停止）</span>
      </div>
      <div class="tr-bubbule__footer">
        <div class="tr-bubbule__footer-left">
          <slot name="footer"></slot>
        </div>
        <div v-if="props.showActions" class="tr-bubbule__footer-actions">
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
</template>

<style lang="less" scoped>
.tr-bubble {
  display: flex;
  gap: 16px;
  max-width: v-bind('props.maxWidth');

  &.align-left {
    flex-direction: row;

    .tr-bubble__content {
      border-top-left-radius: 0;
    }
  }

  &.align-right {
    flex-direction: row-reverse;
    margin-left: auto;

    .tr-bubble__content {
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

.tr-bubble__load-wrap {
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
  padding: 16px 24px;
  border-radius: 24px;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.02);

  &.tr-bubble__content-role-ai {
    background-color: white;
  }

  &.tr-bubble__content-role-user {
    background-color: rgb(222, 236, 255);
  }

  .tr-bubbule__body {
    color: rgb(25, 25, 25);
    font-size: 16px;
    line-height: 26px;
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
