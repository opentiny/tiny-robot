import { describe, expect, it } from 'vitest'
import { createDefaultChatLabels } from '../../src/ui/defaults'
import { resolveChatUIData } from '../../src/ui/resolveData'
import { resolveChatUIOptions } from '../../src/ui/resolveOptions'

describe('UI resolvers', () => {
  it('creates complete default data', () => {
    const data = resolveChatUIData(undefined, createDefaultChatLabels())
    expect(data).toMatchObject({
      conversation: { items: [], activeId: null },
      bubble: { messages: [] },
      sender: { loading: false, disabled: false, submitDisabled: false },
      model: undefined,
      mcp: undefined,
    })
  })

  it('preserves explicit false and empty values in data', () => {
    const data = resolveChatUIData(
      {
        conversation: { items: [], activeId: '', title: '' },
        bubble: { messages: [] },
        sender: { loading: false, disabled: false, submitDisabled: false },
        model: undefined,
        mcp: undefined,
      },
      createDefaultChatLabels(),
    )
    expect(data.conversation).toEqual({ items: [], activeId: '', title: '' })
    expect(data.sender).toEqual({ loading: false, disabled: false, submitDisabled: false })
  })

  it('resolves defaults and explicit right aside sections', () => {
    expect(resolveChatUIOptions(undefined).layout.rightAside).toBe(false)
    expect(resolveChatUIOptions(undefined).layout.surface.mode).toBe('normal')
    expect(resolveChatUIOptions(undefined).layout.emptyState).toBe('start')
    expect(resolveChatUIOptions(undefined).layout.composer.welcome).toBe('footer')
    expect(resolveChatUIOptions({ sender: false, history: false }).sender).toBe(false)
    expect(resolveChatUIOptions({ layout: { rightAside: {} } }).layout.rightAside).toMatchObject({
      defaultOpen: true,
    })
    expect(resolveChatUIOptions({ layout: { rightAside: false } }).layout.rightAside).toBe(false)
    expect(resolveChatUIOptions({ layout: { composer: { welcome: 'center' } } }).layout.composer.welcome).toBe('center')
    const floatingOptions = { draggable: true, minWidth: 360 }
    const resolvedSurface = resolveChatUIOptions({
      layout: { surface: { mode: 'floating', floatingOptions }, emptyState: 'center' },
    }).layout
    expect(resolvedSurface).toMatchObject({
      surface: { mode: 'floating' },
      emptyState: 'center',
    })
    expect(resolvedSurface.surface.floatingOptions).toBe(floatingOptions)
  })

  it('replaces arrays and merges bubble roles', () => {
    const options = resolveChatUIOptions({
      history: { menuItems: [{ id: 'custom', text: 'Custom' }] },
      prompts: { items: [{ label: 'Prompt' }] },
      bubble: { bubbleList: { roleConfigs: { system: { hidden: false }, user: { hidden: true } } } },
    })
    expect(options.history).toMatchObject({ menuItems: [{ id: 'custom', text: 'Custom' }] })
    expect(options.prompts).toMatchObject({ items: [{ label: 'Prompt' }] })
    expect(options.bubble.bubbleList.roleConfigs).toEqual({ system: { hidden: false }, user: { hidden: true } })
  })
})
