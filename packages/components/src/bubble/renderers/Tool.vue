<script setup lang="ts">
import { IconArrowDown, IconCancelled, IconError, IconLoading, IconPlugin } from '@opentiny/tiny-robot-svgs'
import { type Component, computed, nextTick, ref, useCssModule, watch, watchEffect } from 'vue'
import { ToolCallStatus, useBubbleStateChangeFn, useToolCall } from '../composables'
import { BubbleContentRendererProps, ChatMessageContent } from '../index.type'

const props = defineProps<
  BubbleContentRendererProps<
    ChatMessageContent,
    {
      toolCall?: Record<string, { status?: ToolCallStatus; open?: boolean }>
    }
  > & { toolCallIndex: number }
>()

const { toolCall, toolCallWithResult, state } = useToolCall(props)

const textAndIconMap = new Map<string, { text: string; icon: Component }>([
  ['running', { text: '正在调用', icon: IconLoading }],
  ['success', { text: '已调用', icon: IconPlugin }],
  ['failed', { text: '调用失败', icon: IconError }],
  ['cancelled', { text: '已取消', icon: IconCancelled }],
])

const textAndIcon = computed(() => {
  return textAndIconMap.get(state.value?.status || '') || { text: '', icon: IconPlugin }
})

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

const highlightJSON = (json: string): string => {
  if (!json) {
    return ''
  }

  let jsonStr = json

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

const handleStateChange = useBubbleStateChangeFn()

const handleClick = () => {
  open.value = !open.value

  const toolCallId = toolCall.value?.id
  if (toolCallId) {
    handleStateChange('toolCall', {
      ...props.message.state?.toolCall,
      [toolCallId]: { ...state.value, open: open.value },
    })
  }
}
</script>

<template>
  <div class="tr-bubble__tool-call" data-type="tool-call">
    <div class="header">
      <div class="header-left">
        <component :is="textAndIcon.icon" class="header-icon" :class="`icon-${state.status}`" />
        <span>
          <span>{{ textAndIcon.text }}&nbsp;</span>
          <span class="title">{{ toolCall?.function.name || 'Untitled' }} </span>
        </span>
      </div>
      <div class="header-right">
        <IconArrowDown class="expand-icon" :class="{ '-rotate-90': !open }" @click="handleClick" />
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;

  .header-left {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;

    .title {
      color: var(--tr-text-primary);
      font-weight: 600;
    }
  }

  .header-right {
    flex-shrink: 0;
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
    &.icon-cancelled {
      color: var(--tr-color-error);
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
