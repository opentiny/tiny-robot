import { computed, shallowRef, toValue, watch } from 'vue'
import type { MaybeRefOrGetter } from 'vue'
import type { ChatAsideOpenChangePayload, ChatAsideOptions, ChatRightAsideOptions } from '../types'

type AsideOptions = false | Readonly<ChatAsideOptions> | undefined

export interface UseChatAsideStateOptions {
  leftAside: MaybeRefOrGetter<AsideOptions>
  rightAside: MaybeRefOrGetter<false | Readonly<ChatRightAsideOptions> | undefined>
  isMobileViewport: MaybeRefOrGetter<boolean>
  viewportWidth: MaybeRefOrGetter<number>
  onLeftOpenChange: (payload: ChatAsideOpenChangePayload) => void
  onRightOpenChange: (payload: ChatAsideOpenChangePayload) => void
}

function toSize(value: number | undefined, fallback: number) {
  return typeof value === 'number' ? value : fallback
}

export function useChatAsideState(options: UseChatAsideStateOptions) {
  const leftInitial = toValue(options.leftAside)
  const rightInitial = toValue(options.rightAside)
  const leftOpen = shallowRef(leftInitial !== false ? (leftInitial?.open ?? leftInitial?.defaultOpen ?? false) : false)
  const rightOpen = shallowRef(
    rightInitial !== false ? (rightInitial?.open ?? rightInitial?.defaultOpen ?? false) : false,
  )
  const isMobileViewport = computed(() => toValue(options.isMobileViewport))
  const viewportWidth = computed(() => toValue(options.viewportWidth))
  const leftAside = computed(() => toValue(options.leftAside))
  const rightAside = computed(() => toValue(options.rightAside))
  const resolvedLeftAsideOpen = computed(() => {
    const layout = leftAside.value
    return layout !== false ? (layout?.open ?? leftOpen.value) : false
  })
  const resolvedRightAsideOpen = computed(() => {
    const layout = rightAside.value
    return layout !== false ? (layout?.open ?? rightOpen.value) : false
  })
  const leftAsideMode = computed(() =>
    isMobileViewport.value ? 'drawer' : leftAside.value !== false ? leftAside.value?.mode : 'dock',
  )
  const rightAsideMode = computed(() =>
    isMobileViewport.value ? 'drawer' : rightAside.value !== false ? rightAside.value?.mode : 'dock',
  )

  const leftAsideOptions = computed(() => {
    const layout = leftAside.value
    const width = toSize(layout !== false ? layout?.width : undefined, 300)
    return {
      mode: leftAsideMode.value,
      open: resolvedLeftAsideOpen.value,
      expandedWidth:
        isMobileViewport.value && viewportWidth.value > 0
          ? Math.min(width, Math.floor(viewportWidth.value * 0.86))
          : width,
      collapsedWidth: isMobileViewport.value || layout === false ? 0 : toSize(layout?.collapsedWidth, 56),
      collapseEffect: 'overlay' as const,
    }
  })
  const rightAsideOptions = computed(() => {
    const layout = rightAside.value
    const mobileWidth = isMobileViewport.value && viewportWidth.value > 0 ? viewportWidth.value : undefined
    return {
      mode: rightAsideMode.value,
      open: resolvedRightAsideOpen.value,
      expandedWidth: mobileWidth ?? toSize(layout !== false ? layout?.width : undefined, 320),
      minExpandedWidth: mobileWidth,
      maxExpandedWidth: mobileWidth,
      collapsedWidth: isMobileViewport.value || layout === false ? 0 : toSize(layout?.collapsedWidth, 0),
      collapseEffect: 'overlay' as const,
    }
  })

  function requestLeftAsideOpen(open: boolean, source: ChatAsideOpenChangePayload['source'] = 'user') {
    if (resolvedLeftAsideOpen.value === open) return
    if (leftAside.value !== false && leftAside.value?.open === undefined) leftOpen.value = open
    options.onLeftOpenChange({ open, source })
  }

  function requestRightAsideOpen(open: boolean, source: ChatAsideOpenChangePayload['source'] = 'user') {
    if (resolvedRightAsideOpen.value === open) return
    if (rightAside.value !== false && rightAside.value?.open === undefined) rightOpen.value = open
    options.onRightOpenChange({ open, source })
  }

  watch(isMobileViewport, (isMobile) => {
    if (isMobile) {
      requestLeftAsideOpen(false, 'viewport')
      requestRightAsideOpen(false, 'viewport')
    }
  })

  return {
    leftAsideOptions,
    rightAsideOptions,
    resolvedLeftAsideOpen,
    resolvedRightAsideOpen,
    isLeftAsideDock: computed(() => leftAsideMode.value === 'dock'),
    isLeftAsideDrawer: computed(() => leftAsideMode.value === 'drawer'),
    openLeftAside: () => requestLeftAsideOpen(true),
    closeLeftAside: () => requestLeftAsideOpen(false),
    toggleLeftAside: () => requestLeftAsideOpen(!resolvedLeftAsideOpen.value),
    closeRightAside: () => requestRightAsideOpen(false),
    openRightAside: () => requestRightAsideOpen(true),
    handleLeftAsideOpenChange: (payload: { open: boolean }) => requestLeftAsideOpen(payload.open),
    handleRightAsideOpenChange: (payload: { open: boolean }) => requestRightAsideOpen(payload.open),
  }
}
