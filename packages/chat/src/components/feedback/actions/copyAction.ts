import { useClipboard } from '@vueuse/core'
import type { ComputedRef } from 'vue'
import type { ChatMessageActionDefinition, ChatMessageActionRole, ChatRuntime } from '@/types'

interface CopyActionOptions {
  role: ChatMessageActionRole
  label: string
  content: ComputedRef<string>
  runtime: ChatRuntime | null
  primaryMessageId: ComputedRef<string | undefined>
}

export function createCopyAction(options: CopyActionOptions): ChatMessageActionDefinition {
  const { copy } = useClipboard()
  const { role, label, content, runtime, primaryMessageId } = options

  return {
    id: 'copy',
    label,
    icon: 'copy',
    placement: 'actions',
    roles: [role],
    order: 100,
    onClick: async () => {
      if (runtime && primaryMessageId.value) {
        await runtime.message.copy(primaryMessageId.value)
        return
      }
      copy(content.value)
    },
  }
}
