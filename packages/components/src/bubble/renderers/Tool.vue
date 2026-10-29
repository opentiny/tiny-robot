<script setup lang="ts">
import {
  IconArrowDown,
  IconCancelled,
  IconClose,
  IconError,
  IconLoading,
  IconPlugin,
  IconWarning,
} from '@opentiny/tiny-robot-svgs'
import { type Component, computed, nextTick, ref, useCssModule, watch, watchEffect } from 'vue'
import { TinyButton } from '@opentiny/vue'
import { type ToolCallState, useBubbleEventFn, useToolCall } from '../composables'
import { BubbleContentRendererProps, ChatMessageContent } from '../index.type'

const props = defineProps<
  BubbleContentRendererProps<
    ChatMessageContent,
    {
      toolCall?: Record<string, ToolCallState>
    }
  > & { toolCallIndex: number }
>()

const { toolCall, toolCallWithResult, state } = useToolCall(props)

const textAndIconMap = new Map<string, { text: string; icon: Component }>([
  ['running', { text: '正在调用', icon: IconLoading }],
  ['success', { text: '已调用', icon: IconPlugin }],
  ['failed', { text: '调用失败', icon: IconError }],
  ['cancelled', { text: '已取消', icon: IconCancelled }],
  ['awaiting-approval', { text: '等待确认', icon: IconWarning }],
  ['denied', { text: '已拒绝', icon: IconClose }],
])

const textAndIcon = computed(() => {
  const status = state.value?.status || ''
  return textAndIconMap.get(status) || { text: '', icon: IconPlugin }
})

const description = computed(() => (typeof state.value.description === 'string' ? state.value.description : ''))

const prettyJSON = (json: unknown, space = 2) => {
  let prettyJson = ''

  try {
    if (typeof json === 'string') {
      prettyJson = JSON.stringify(JSON.parse(json), null, space)
    } else {
      prettyJson = JSON.stringify(json, null, space)
    }
  } catch {}

  return prettyJson
}

const classes = useCssModule()

// Escape HTML entities to prevent XSS attacks when rendering with v-html
const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const highlightJSON = (json: string): string => {
  if (!json) {
    return ''
  }

  // Escape HTML entities first to prevent XSS attacks
  let jsonStr = escapeHtml(json)

  jsonStr = jsonStr.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g,
    (match) => {
      let className = 'number'
      if (/^"/.test(match)) {
        className = /:$/.test(match) ? 'key' : 'string'
      } else if (/true|false/.test(match)) {
        className = 'boolean'
      } else if (/null/.test(match)) {
        className = 'null'
      }
      return `<span class="${classes[className]}">${match}</span>`
    },
  )

  return jsonStr
}

const jsonStr = computed(() => {
  return prettyJSON(toolCallWithResult.value, 2)
})

const detail = computed(() => {
  return highlightJSON(jsonStr.value)
})

const detailRef = ref<HTMLDivElement | null>(null)

watch(jsonStr, (_, oldValue) => {
  if (oldValue === '' || oldValue === '{}') {
    return
  }

  nextTick(() => {
    if (!detailRef.value) {
      return
    }

    detailRef.value.scrollTo({
      top: detailRef.value.scrollHeight,
      behavior: 'smooth',
    })
  })
})

const open = ref(false)

watchEffect(() => {
  open.value = state.value.open ?? false
})

const handleBubbleEvent = useBubbleEventFn()

const emitToolAction = (action: 'resume' | 'reject') => {
  const toolCallId = toolCall.value?.id
  if (!toolCallId || state.value.status !== 'awaiting-approval') {
    return
  }

  handleBubbleEvent({
    name: `tool-call:${action}`,
    payload: { toolCallId },
  })
}

const handleClick = () => {
  open.value = !open.value

  const toolCallId = toolCall.value?.id
  if (toolCallId) {
    handleBubbleEvent({
      name: 'state:update',
      payload: {
        key: 'toolCall',
        value: {
          ...props.message.state?.toolCall,
          [toolCallId]: { ...state.value, open: open.value },
        },
      },
    })
  }
}
</script>

<template>
  <div class="tr-bubble__tool-call" data-type="tool-call">
    <div class="header">
      <div class="header-left">
        <component :is="textAndIcon.icon" class="header-icon" :class="`icon-${state.status}`" />
        <div class="tool-info">
          <div>
            <span>{{ textAndIcon.text }}&nbsp;</span>
            <span class="title">{{ toolCall?.function.name || 'Untitled' }} </span>
          </div>
          <div v-if="description" class="description">{{ description }}</div>
        </div>
      </div>
      <div class="header-right">
        <IconArrowDown class="expand-icon" :class="{ '-rotate-90': !open }" @click="handleClick" />
      </div>
      <div v-if="state.status === 'awaiting-approval'" class="tool-actions">
        <tiny-button type="primary" size="mini" round :reset-time="0" @click.stop="emitToolAction('resume')">
          允许
        </tiny-button>
        <tiny-button size="mini" round :reset-time="0" @click.stop="emitToolAction('reject')">拒绝</tiny-button>
      </div>
    </div>
    <div v-show="open" class="divider"></div>
    <div v-show="open" class="detail" v-html="detail" ref="detailRef"></div>
  </div>
</template>

<style lang="less" scoped>
.tr-bubble__tool-call {
  font-size: 14px;
  line-height: 24px;
  padding: 12px;
  color: var(--tr-text-secondary);
  background-color: var(--tr-bubble-tool-call-bg);
  border-radius: 12px;
  margin-block: var(--tr-bubble-tool-call-space-y);
  min-width: var(--tr-bubble-tool-call-min-width);
  max-width: var(--tr-bubble-tool-call-max-width);

  &:first-child {
    margin-top: 0;
  }

  &:last-child {
    margin-bottom: 0;
  }
}

.header {
  display: grid;
  grid-template-columns: 20px minmax(0, 1fr) auto;
  column-gap: 8px;
  row-gap: 8px;
  align-items: start;

  .header-left {
    grid-column: 1 / 3;
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }

  .tool-info {
    min-width: 0;
  }

  .title {
    color: var(--tr-text-primary);
    font-weight: 600;
  }

  .description {
    color: var(--tr-text-secondary);
    font-size: 12px;
    line-height: 18px;
    word-break: break-word;
  }

  .tool-actions {
    grid-column: 2 / 4;
    display: flex;
    gap: var(--tr-spacing-sm);

    .tiny-button + .tiny-button {
      margin-left: 0;
    }
  }

  .header-right {
    grid-column: 3;
    grid-row: 1;
    display: flex;
    align-items: center;
  }

  .header-icon {
    font-size: 20px;
    flex-shrink: 0;

    &.icon-running {
      color: #898989;
      animation: spin 1s linear infinite;
    }

    &.icon-success {
      color: #898989;
    }

    &.icon-failed,
    &.icon-cancelled,
    &.icon-denied {
      color: var(--tr-color-error);
    }

    &.icon-awaiting-approval {
      color: var(--tr-color-warning);
    }
  }

  .expand-icon {
    font-size: 16px;
    cursor: pointer;

    &.-rotate-90 {
      transform: rotate(-90deg);
    }
  }
}

.divider {
  margin: 12px 0;
  border-top: 1px solid rgb(219, 219, 219);
}

.detail {
  white-space: pre-wrap;
  word-break: break-word;
  font-family: monospace;
  max-height: var(--tr-bubble-tool-call-max-height, 300px);
  overflow-y: auto;
}
</style>

<style module>
.key {
  color: var(--tr-bubble-tool-key-color);
}

.number {
  color: var(--tr-bubble-tool-number-color);
}

.string {
  color: var(--tr-bubble-tool-string-color);
}

.boolean {
  color: var(--tr-bubble-tool-boolean-color);
}

.null {
  color: var(--tr-bubble-tool-null-color);
}
</style>
