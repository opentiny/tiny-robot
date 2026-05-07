import { markRaw, h } from 'vue'
import { BubbleRenderers, BubbleRendererMatchPriority } from '@opentiny/tiny-robot'
import type { BubbleBoxRendererMatch, BubbleContentRendererMatch, BubbleRoleConfig } from '@opentiny/tiny-robot'
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'
import {
  ErrorRenderer,
  EditInputRenderer,
  ToolCallsRenderer,
  AttachmentsRenderer,
  MarkStreamRenderer,
} from '@/components/renderers'
import { hasChatMessageError, isChatMessageEditing, isChatMessageOptimistic } from '@/runtime/engine/chatMessageState'

export interface UseDefaultBubbleConfigOptions {
  extraContentMatches?: BubbleContentRendererMatch[]
  extraBoxMatches?: BubbleBoxRendererMatch[]
  overrideRoles?: Record<string, BubbleRoleConfig>
}

export function useDefaultBubbleConfig(options?: UseDefaultBubbleConfigOptions) {
  const contentMatches: BubbleContentRendererMatch[] = [
    {
      find: (message) => hasChatMessageError(message),
      renderer: markRaw(ErrorRenderer),
      priority: BubbleRendererMatchPriority.NORMAL,
    },
    {
      find: (message) => isChatMessageEditing(message),
      renderer: markRaw(EditInputRenderer),
      priority: BubbleRendererMatchPriority.NORMAL,
    },
    {
      find: (message) => Array.isArray(message.tool_calls) && message.tool_calls.length > 0,
      renderer: markRaw(ToolCallsRenderer),
      priority: BubbleRendererMatchPriority.NORMAL,
    },
    {
      find: (_, content) => content?.type === 'attachment',
      renderer: markRaw(AttachmentsRenderer),
      priority: BubbleRendererMatchPriority.CONTENT,
    },
    ...(options?.extraContentMatches ?? []),
  ]

  const boxMatches: BubbleBoxRendererMatch[] = [
    {
      find: (messages) => messages.length === 1 && isChatMessageEditing(messages[0]),
      renderer: BubbleRenderers.Box,
      priority: BubbleRendererMatchPriority.NORMAL,
      attributes: { 'data-editing': 'true', 'data-shape': 'none' },
    },
    {
      find: (messages) => messages.length === 1 && isChatMessageOptimistic(messages[0]),
      renderer: BubbleRenderers.Box,
      priority: BubbleRendererMatchPriority.NORMAL,
      attributes: { 'data-optimistic': 'true' },
    },
    {
      find: (_, content) => content?.type === 'attachment',
      renderer: BubbleRenderers.Box,
      attributes: {
        'data-box-type': 'none',
        'data-shape': 'none',
      },
    },
    ...(options?.extraBoxMatches ?? []),
  ]

  const roles: Record<string, BubbleRoleConfig> = {
    assistant: {
      placement: 'start',
      avatar: markRaw(h(IconAi, { style: { fontSize: '32px' } })),
      fallbackContentRenderer: MarkStreamRenderer,
    },
    user: {
      placement: 'end',
      avatar: markRaw(h(IconUser, { style: { fontSize: '32px' } })),
    },
    system: {
      hidden: true,
    },
    ...options?.overrideRoles,
  }

  return { contentMatches, boxMatches, roles }
}
