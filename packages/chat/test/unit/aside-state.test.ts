import { describe, expect, it, vi } from 'vitest'
import { nextTick, shallowRef } from 'vue'
import { useChatAsideState } from '../../src/composables/useChatAsideState'

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
      rightAside: { defaultOpen: true },
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
})
