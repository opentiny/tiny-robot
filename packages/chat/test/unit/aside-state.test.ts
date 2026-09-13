import { describe, expect, it, vi } from 'vitest'
import { nextTick, shallowRef } from 'vue'
import { useChatAsideState } from '../../src/composables/useChatAsideState'

const rightAsidePanels = [
  { id: 'settings', title: 'Settings' },
  { id: 'details', title: 'Details' },
] as const

describe('useChatAsideState', () => {
  it('supports uncontrolled state and user events', () => {
    const onLeftOpenChange = vi.fn()
    const state = useChatAsideState({
      leftAside: { defaultOpen: false, width: 300 },
      rightAside: false,
      isMobileViewport: false,
      viewportWidth: 1200,
      onLeftOpenChange,
      onRightOpenChange: vi.fn(),
    })

    expect(state.resolvedLeftAsideOpen.value).toBe(false)
    state.openLeftAside()
    expect(state.resolvedLeftAsideOpen.value).toBe(true)
    expect(onLeftOpenChange).toHaveBeenCalledWith({ open: true, source: 'user' })
  })

  it('does not mutate controlled state', () => {
    const onLeftOpenChange = vi.fn()
    const state = useChatAsideState({
      leftAside: { open: false },
      rightAside: false,
      isMobileViewport: false,
      viewportWidth: 1200,
      onLeftOpenChange,
      onRightOpenChange: vi.fn(),
    })

    state.openLeftAside()
    expect(state.resolvedLeftAsideOpen.value).toBe(false)
    expect(onLeftOpenChange).toHaveBeenCalledWith({ open: true, source: 'user' })
  })

  it('closes both asides on mobile and applies width rules', async () => {
    const mobile = shallowRef(false)
    const leftEvents = vi.fn()
    const rightEvents = vi.fn()
    const state = useChatAsideState({
      leftAside: { defaultOpen: true, width: 500 },
      rightAside: {},
      defaultRightAsideOpen: true,
      isMobileViewport: mobile,
      viewportWidth: 400,
      onLeftOpenChange: leftEvents,
      onRightOpenChange: rightEvents,
    })

    mobile.value = true
    await nextTick()
    expect(state.leftAsideOptions.value.expandedWidth).toBe(344)
    expect(state.rightAsideOptions.value.expandedWidth).toBe(400)
    expect(leftEvents).toHaveBeenCalledWith({ open: false, source: 'viewport' })
    expect(rightEvents).toHaveBeenCalledWith({ open: false, source: 'viewport' })
  })

  it('keeps false asides closed', () => {
    const state = useChatAsideState({
      leftAside: false,
      rightAside: false,
      isMobileViewport: false,
      viewportWidth: 1000,
      onLeftOpenChange: vi.fn(),
      onRightOpenChange: vi.fn(),
    })
    expect(state.resolvedLeftAsideOpen.value).toBe(false)
    expect(state.resolvedRightAsideOpen.value).toBe(false)
  })

  it('uses the default registered panel and opens a requested registered panel', () => {
    const onRightAsidePanelUpdate = vi.fn()
    const onRightAsideOpenUpdate = vi.fn()
    const state = useChatAsideState({
      leftAside: false,
      rightAside: {},
      defaultRightAsideOpen: false,
      defaultActiveRightAsidePanelId: 'settings',
      rightAsidePanels,
      isMobileViewport: false,
      viewportWidth: 1000,
      onLeftOpenChange: vi.fn(),
      onRightOpenChange: vi.fn(),
      onRightAsidePanelUpdate,
      onRightAsideOpenUpdate,
    })

    expect(state.resolvedRightAsidePanel.value).toBe('settings')
    state.openRightAside('details')

    expect(state.resolvedRightAsidePanel.value).toBe('details')
    expect(state.resolvedRightAsideOpen.value).toBe(true)
    expect(onRightAsidePanelUpdate).toHaveBeenLastCalledWith('details')
    expect(onRightAsideOpenUpdate).toHaveBeenLastCalledWith(true)
  })

  it('rejects unknown panels and keeps the aside closed when no panel is registered', () => {
    const onRightOpenChange = vi.fn()
    const onRightAsidePanelUpdate = vi.fn()
    const state = useChatAsideState({
      leftAside: false,
      rightAside: {},
      rightAsidePanels: [],
      isMobileViewport: false,
      viewportWidth: 1000,
      onLeftOpenChange: vi.fn(),
      onRightOpenChange,
      onRightAsidePanelUpdate,
    })

    state.openRightAside('settings')

    expect(state.resolvedRightAsidePanel.value).toBeUndefined()
    expect(state.resolvedRightAsideOpen.value).toBe(false)
    expect(onRightOpenChange).not.toHaveBeenCalled()
    expect(onRightAsidePanelUpdate).not.toHaveBeenCalled()
  })

  it('rejects an unknown panel when registered panels are available', () => {
    const onRightOpenChange = vi.fn()
    const onRightAsidePanelUpdate = vi.fn()
    const state = useChatAsideState({
      leftAside: false,
      rightAside: {},
      defaultActiveRightAsidePanelId: 'settings',
      rightAsidePanels,
      isMobileViewport: false,
      viewportWidth: 1000,
      onLeftOpenChange: vi.fn(),
      onRightOpenChange,
      onRightAsidePanelUpdate,
    })

    state.openRightAside('unknown')

    expect(state.resolvedRightAsidePanel.value).toBe('settings')
    expect(state.resolvedRightAsideOpen.value).toBe(false)
    expect(onRightOpenChange).not.toHaveBeenCalled()
    expect(onRightAsidePanelUpdate).not.toHaveBeenCalled()
  })

  it('requests a registered panel without mutating the controlled panel', () => {
    const panel = shallowRef<string | undefined>('settings')
    const onRightAsidePanelUpdate = vi.fn()
    const state = useChatAsideState({
      leftAside: false,
      rightAside: {},
      activeRightAsidePanelId: panel,
      defaultActiveRightAsidePanelId: 'settings',
      rightAsidePanels,
      isMobileViewport: false,
      viewportWidth: 1000,
      onLeftOpenChange: vi.fn(),
      onRightOpenChange: vi.fn(),
      onRightAsidePanelUpdate,
    })

    state.openRightAside('details')

    expect(state.resolvedRightAsidePanel.value).toBe('settings')
    expect(onRightAsidePanelUpdate).toHaveBeenCalledWith('details')

    panel.value = 'details'
    expect(state.resolvedRightAsidePanel.value).toBe('details')
  })

  it('separates panel activation from opening the right aside', () => {
    const onRightAsideOpenUpdate = vi.fn()
    const onRightAsidePanelUpdate = vi.fn()
    const state = useChatAsideState({
      leftAside: false,
      rightAside: {},
      defaultRightAsideOpen: false,
      defaultActiveRightAsidePanelId: 'settings',
      rightAsidePanels,
      isMobileViewport: false,
      viewportWidth: 1000,
      onLeftOpenChange: vi.fn(),
      onRightOpenChange: vi.fn(),
      onRightAsideOpenUpdate,
      onRightAsidePanelUpdate,
    })

    expect(state.activateRightAsidePanel('details')).toBe(true)
    expect(state.resolvedRightAsidePanel.value).toBe('details')
    expect(state.resolvedRightAsideOpen.value).toBe(false)
    expect(onRightAsideOpenUpdate).not.toHaveBeenCalled()

    state.toggleRightAside('details')
    expect(state.resolvedRightAsideOpen.value).toBe(true)
    expect(onRightAsideOpenUpdate).toHaveBeenCalledWith(true)
    expect(onRightAsidePanelUpdate).toHaveBeenCalledWith('details')
  })

  it('closes without clearing the active panel', () => {
    const state = useChatAsideState({
      leftAside: false,
      rightAside: {},
      defaultRightAsideOpen: true,
      defaultActiveRightAsidePanelId: 'settings',
      rightAsidePanels,
      isMobileViewport: false,
      viewportWidth: 1000,
      onLeftOpenChange: vi.fn(),
      onRightOpenChange: vi.fn(),
    })

    state.closeRightAside()

    expect(state.resolvedRightAsideOpen.value).toBe(false)
    expect(state.resolvedRightAsidePanel.value).toBe('settings')
  })

  it('falls back when the active registered panel is removed', async () => {
    const panels = shallowRef([...rightAsidePanels])
    const onRightAsidePanelUpdate = vi.fn()
    const state = useChatAsideState({
      leftAside: false,
      rightAside: {},
      defaultActiveRightAsidePanelId: 'settings',
      rightAsidePanels: panels,
      isMobileViewport: false,
      viewportWidth: 1000,
      onLeftOpenChange: vi.fn(),
      onRightOpenChange: vi.fn(),
      onRightAsidePanelUpdate,
    })

    state.openRightAside('details')
    panels.value = [{ id: 'settings', title: 'Settings' }]
    await nextTick()

    expect(state.resolvedRightAsidePanel.value).toBe('settings')
    expect(onRightAsidePanelUpdate).toHaveBeenLastCalledWith('settings')
  })

  it('falls back to the first registered panel for invalid defaults and controlled values', async () => {
    const panel = shallowRef<string | undefined>('unknown')
    const onRightAsidePanelUpdate = vi.fn()
    const state = useChatAsideState({
      leftAside: false,
      rightAside: {},
      defaultActiveRightAsidePanelId: 'missing',
      activeRightAsidePanelId: panel,
      rightAsidePanels,
      isMobileViewport: false,
      viewportWidth: 1000,
      onLeftOpenChange: vi.fn(),
      onRightOpenChange: vi.fn(),
      onRightAsidePanelUpdate,
    })

    await nextTick()

    expect(state.resolvedRightAsidePanel.value).toBe('settings')
    expect(onRightAsidePanelUpdate).toHaveBeenCalledWith('settings')
  })
})
