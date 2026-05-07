import { h } from 'vue'
import { TrIconButton } from '@opentiny/tiny-robot'
import { IconEditPen } from '@opentiny/tiny-robot-svgs'
import type { ChatMessageActionDefinition, ChatRuntime } from '@/types'

interface EditActionFallbackRuntime {
  startEditMessage: (messageIndex: number) => void
}

interface EditActionOptions {
  label: string
  runtime: ChatRuntime | null
  fallbackRuntime: EditActionFallbackRuntime | null
}

export function createEditAction(options: EditActionOptions): ChatMessageActionDefinition {
  const { label, runtime, fallbackRuntime } = options

  return {
    id: 'edit',
    label,
    icon: h(TrIconButton, { icon: IconEditPen }),
    placement: 'actions',
    roles: ['user'],
    order: 200,
    onClick: (context) => {
      if (runtime && context.messageId) {
        runtime.message.startEdit(context.messageId)
        return
      }
      if (fallbackRuntime && context.messageIndex !== undefined) {
        fallbackRuntime.startEditMessage(context.messageIndex)
      }
    },
  }
}
