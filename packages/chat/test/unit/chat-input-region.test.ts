import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { describe, expect, it, vi } from 'vitest'

vi.mock('../../src/ui/composer/ChatSender.vue', async () => {
  const { defineComponent } = await import('vue')

  return {
    default: defineComponent({
      emits: ['modelReasoningEffortChange', 'mcpToolEnabledChange'],
      setup(_, { emit }) {
        emit('modelReasoningEffortChange', { effort: 'high' })
        emit('mcpToolEnabledChange', { serverId: 'server-1', toolId: 'tool-1', enabled: true })
        return () => null
      },
    }),
  }
})

import ChatInputRegion from '../../src/ui/composer/ChatInputRegion.vue'
import { createDefaultChatLabels } from '../../src/ui/defaults'

describe('ChatInputRegion event forwarding', () => {
  it('forwards reasoning effort and MCP tool events once', async () => {
    const reasoningEfforts: Array<string | null> = []
    const mcpToolEvents: Array<{ serverId: string; toolId: string; enabled: boolean }> = []

    const app = createSSRApp(() =>
      h(ChatInputRegion, {
        sender: {
          loading: false,
          disabled: false,
          submitDisabled: false,
        },
        value: '',
        senderOptions: {
          mode: 'multiple',
          clearable: true,
          maxLength: 1000,
          showWordLimit: true,
        },
        labels: createDefaultChatLabels(),
        onModelReasoningEffortChange: (payload: { effort: string | null }) => reasoningEfforts.push(payload.effort),
        onMcpToolEnabledChange: (payload: { serverId: string; toolId: string; enabled: boolean }) =>
          mcpToolEvents.push(payload),
      }),
    )

    await renderToString(app)

    expect(reasoningEfforts).toEqual(['high'])
    expect(mcpToolEvents).toEqual([{ serverId: 'server-1', toolId: 'tool-1', enabled: true }])
  })
})
