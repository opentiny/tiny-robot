<script setup lang="ts">
import { IconArrowDown, IconCancelled, IconError, IconLoading, IconPlugin } from '@opentiny/tiny-robot-svgs'
import { type Component, computed, ref, useCssModule, watchEffect } from 'vue'
import { useBubbleContentMessage, useBubbleStore } from '../composables'
import { BubbleRendererMessage, ToolCall } from '../index.type'

const toolCallStatus = ['running', 'success', 'failed', 'cancelled'] as const
type ToolCallStatus = (typeof toolCallStatus)[number]

const props = defineProps<
  BubbleRendererMessage<
    unknown,
    {
      tool_call: ToolCall
      status?: ToolCallStatus
      open?: boolean
    }
  >
>()

const status = computed(() => {
  return props.extras?.tool_call.status && toolCallStatus.includes(props.extras.tool_call.status as ToolCallStatus)
    ? (props.extras.tool_call.status as ToolCallStatus)
    : 'success'
})

const textAndIconMap = new Map<string, { text: string; icon: Component }>([
  ['running', { text: '正在调用', icon: IconLoading }],
  ['success', { text: '已调用', icon: IconPlugin }],
  ['failed', { text: '调用失败', icon: IconError }],
  ['cancelled', { text: '已取消', icon: IconCancelled }],
])

const textAndIcon = computed(() => {
  return textAndIconMap.get(status.value) || { text: '', icon: IconPlugin }
})

const classes = useCssModule()

const highlightJSON = <T extends string | object>(json: T, space = 2): string => {
  if (!json) {
    return ''
  }

  let prettyJson = ''

  try {
    if (typeof json === 'string') {
      prettyJson = JSON.stringify(JSON.parse(json), null, space)
    } else {
      prettyJson = JSON.stringify(json, null, space)
    }
  } catch {}

  prettyJson = prettyJson.replace(
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

  return prettyJson
}

const detail = ref('')

// Lazy load jsonrepair module (only import once, cached by module system)
let jsonrepairPromise: Promise<typeof import('jsonrepair')> | null = null
const getJsonrepair = () => {
  if (!jsonrepairPromise) {
    jsonrepairPromise = import('jsonrepair')
  }
  return jsonrepairPromise
}

const store = useBubbleStore<{ toolCallResult?: Record<string, string> }>()
const toolCallResult = computed(() => {
  const toolCallId = props.extras?.tool_call.id
  if (!toolCallId) {
    return undefined
  }
  return store.toolCallResult?.[toolCallId]
})

watchEffect(() => {
  const args = props.extras?.tool_call.function.arguments
  const result = toolCallResult.value

  getJsonrepair()
    .then(({ jsonrepair }) => {
      const repairedArgs = jsonrepair(typeof args === 'string' ? args || '{}' : JSON.stringify(args))
      detail.value = highlightJSON(
        {
          arguments: JSON.parse(repairedArgs),
          result: result ? JSON.parse(jsonrepair(result || '{}')) : undefined,
        },
        2,
      )
    })
    .catch((error) => {
      console.warn(error)
    })
})

const message = useBubbleContentMessage()

const open = ref(false)

watchEffect(() => {
  open.value = Boolean(props.extras?.tool_call.open)
})

const handleClick = () => {
  open.value = !open.value
  if (message?.tool_calls) {
    const toolCall = message.tool_calls.find((tool) => tool.id === props.extras?.tool_call.id)
    if (toolCall) {
      toolCall.open = open.value
    }
  }
}
</script>

<template>
  <div class="tr-bubble__tool-call" data-type="tool-call">
    <div class="header">
      <div class="header-left">
        <component :is="textAndIcon.icon" class="header-icon" :class="`icon-${status}`" />
        <span>
          <span>{{ textAndIcon.text }}&nbsp;</span>
          <span class="title">{{ props.extras?.tool_call.function.name || 'Untitled' }} </span>
        </span>
      </div>
      <div class="header-right">
        <IconArrowDown class="expand-icon" :class="{ '-rotate-90': !open }" @click="handleClick" />
      </div>
    </div>
    <div v-show="open" class="divider"></div>
    <div v-show="open" class="detail" v-html="detail"></div>
  </div>
</template>

<style lang="less" scoped>
.tr-bubble__tool-call {
  font-size: 14px;
  line-height: 24px;
  padding: 12px;
  color: var(--tr-text-secondary);
  background-color: var(--tr-container-bg-default-2);
  border-radius: 12px;
  margin-block: var(--tr-bubble-tool-call-space-y, 8px);

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
