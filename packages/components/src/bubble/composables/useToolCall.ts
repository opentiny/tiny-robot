import { computed, readonly, ref, watchEffect } from 'vue'
import { BubbleContentRendererProps, ChatMessageContent } from '../index.type'
import { getJsonrepair } from '../utils'
import { useBubbleStore } from './useBubbleStore'

const toolCallStatus = ['running', 'success', 'failed', 'cancelled', 'awaiting-approval'] as const
export type ToolCallStatus = (typeof toolCallStatus)[number]

export const useToolCall = (
  props: BubbleContentRendererProps<
    ChatMessageContent,
    {
      toolCall?: Record<string, { status?: ToolCallStatus; open?: boolean }>
    }
  > & { toolCallIndex: number },
) => {
  const toolCall = computed(() => {
    return props.message?.tool_calls?.[props.toolCallIndex]
  })

  const store = useBubbleStore<{
    toolCallResults?: Record<string, string>
    toolCallDefaultOpen?: boolean
    toolCallDefaultStatus?: ToolCallStatus
  }>()

  const state = computed(() => {
    let defaultStatus = store.toolCallDefaultStatus
    if (defaultStatus && !toolCallStatus.includes(defaultStatus)) {
      defaultStatus = undefined
    }

    const defaultOpen = store.toolCallDefaultOpen

    let result = {
      status: defaultStatus,
      open: defaultOpen,
    }

    const toolCallId = toolCall.value?.id
    if (toolCallId) {
      const toolCallState = props.message.state?.toolCall?.[toolCallId]
      if (toolCallState) {
        const { status, open, ...rest } = toolCallState
        if (status && toolCallStatus.includes(status)) {
          result.status = status
        }
        if (open !== undefined) {
          result.open = open
        }
        result = { ...result, ...rest }
      }
    }

    return result
  })

  const toolCallResults = computed(() => {
    const toolCallId = toolCall.value?.id
    if (!toolCallId) {
      return undefined
    }
    return store.toolCallResults?.[toolCallId]
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const toolCallWithResult = ref<{ arguments?: any; result?: any }>({})

  watchEffect(() => {
    const args = toolCall.value?.function.arguments
    const result = toolCallResults.value

    getJsonrepair()
      .then(({ jsonrepair }) => {
        const repairedArgs = jsonrepair(typeof args === 'string' ? args || '{}' : JSON.stringify(args))
        toolCallWithResult.value = {
          arguments: JSON.parse(repairedArgs),
          result: result ? JSON.parse(jsonrepair(result || '{}')) : undefined,
        }
      })
      .catch((error) => {
        console.warn(error)
      })
  })

  return {
    toolCall,
    toolCallWithResult: readonly(toolCallWithResult),
    state,
  }
}
