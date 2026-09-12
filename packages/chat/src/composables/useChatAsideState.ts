import { computed, shallowRef, toValue, watch } from 'vue'
import type { MaybeRefOrGetter } from 'vue'
import type {
  ChatAsideOpenChangePayload,
  ChatAsideOptions,
  ChatRightAsideOptions,
  ChatRightAsidePanelId,
  ChatRightAsidePanelOptions,
} from '../types'

type AsideOptions = false | Readonly<ChatAsideOptions> | undefined

export interface UseChatAsideStateOptions {
  leftAside: MaybeRefOrGetter<AsideOptions>
  rightAside: MaybeRefOrGetter<false | Readonly<ChatRightAsideOptions> | undefined>
  rightAsidePanel?: MaybeRefOrGetter<ChatRightAsidePanelId | undefined>
  rightAsidePanels?: MaybeRefOrGetter<readonly ChatRightAsidePanelOptions[]>
  isMobileViewport: MaybeRefOrGetter<boolean>
  viewportWidth: MaybeRefOrGetter<number>
  onLeftOpenChange: (payload: ChatAsideOpenChangePayload) => void
  onRightOpenChange: (payload: ChatAsideOpenChangePayload) => void
  onRightAsidePanelChange?: (panel: ChatRightAsidePanelId | undefined) => void
}

function toSize(value: number | undefined, fallback: number) {
  return typeof value === 'number' ? value : fallback
}

export function useChatAsideState(options: UseChatAsideStateOptions) {
  const leftInitial = toValue(options.leftAside)
  const rightInitial = toValue(options.rightAside)
  const rightPanelInitial = toValue(options.rightAsidePanel)
  const leftOpen = shallowRef(leftInitial !== false ? (leftInitial?.open ?? leftInitial?.defaultOpen ?? false) : false)
  const rightOpen = shallowRef(
    rightInitial !== false ? (rightInitial?.open ?? rightInitial?.defaultOpen ?? false) : false,
  )
  const rightPanel = shallowRef<ChatRightAsidePanelId | undefined>(rightPanelInitial)
  const isMobileViewport = computed(() => toValue(options.isMobileViewport))
  const viewportWidth = computed(() => toValue(options.viewportWidth))
  const leftAside = computed(() => toValue(options.leftAside))
  const rightAside = computed(() => toValue(options.rightAside))
  const rightAsidePanels = computed(() => toValue(options.rightAsidePanels) ?? [])
  const resolvedLeftAsideOpen = computed(() => {
    const layout = leftAside.value
    return layout !== false ? (layout?.open ?? leftOpen.value) : false
  })
  const resolvedRightAsideOpen = computed(() => {
    const layout = rightAside.value
    return layout !== false ? (layout?.open ?? rightOpen.value) : false
  })
  const defaultRightAsidePanel = computed(() =>
    rightAside.value !== false ? rightAside.value?.defaultPanel : undefined,
  )
  const resolvedRightAsidePanel = computed(() => {
    const controlledPanel = toValue(options.rightAsidePanel)
    return resolveRightAsidePanel(controlledPanel ?? rightPanel.value)
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

  function setRightAsidePanel(panel: ChatRightAsidePanelId | undefined) {
    const resolvedPanel = resolveRightAsidePanel(panel)
    if (panel !== undefined && panel !== resolvedPanel) return false

    if (toValue(options.rightAsidePanel) === undefined) {
      rightPanel.value = resolvedPanel
    }

    options.onRightAsidePanelChange?.(resolvedPanel)
    return true
  }

  function hasRightAsidePanel(panel: ChatRightAsidePanelId) {
    return rightAsidePanels.value.some((item) => item.id === panel)
  }

  function resolveRightAsidePanel(panel: ChatRightAsidePanelId | undefined) {
    if (panel !== undefined && hasRightAsidePanel(panel)) return panel

    const defaultPanel = defaultRightAsidePanel.value
    if (defaultPanel && hasRightAsidePanel(defaultPanel)) {
      return defaultPanel
    }

    return rightAsidePanels.value[0]?.id
  }

  watch(isMobileViewport, (isMobile) => {
    if (isMobile) {
      requestLeftAsideOpen(false, 'viewport')
      requestRightAsideOpen(false, 'viewport')
    }
  })

  watch(
    [rightAsidePanels, defaultRightAsidePanel, rightPanel, () => toValue(options.rightAsidePanel)],
    () => {
      const resolvedPanel = resolvedRightAsidePanel.value
      const controlledPanel = toValue(options.rightAsidePanel)

      if (controlledPanel !== undefined) {
        if (controlledPanel !== resolvedPanel) {
          options.onRightAsidePanelChange?.(resolvedPanel)
        }
      } else if (rightPanel.value !== undefined && rightPanel.value !== resolvedPanel) {
        rightPanel.value = resolvedPanel
        options.onRightAsidePanelChange?.(resolvedPanel)
      }
    },
    { immediate: true },
  )

  return {
    leftAsideOptions,
    rightAsideOptions,
    resolvedLeftAsideOpen,
    resolvedRightAsideOpen,
    resolvedRightAsidePanel,
    isLeftAsideDock: computed(() => leftAsideMode.value === 'dock'),
    isLeftAsideDrawer: computed(() => leftAsideMode.value === 'drawer'),
    openLeftAside: () => requestLeftAsideOpen(true),
    closeLeftAside: () => requestLeftAsideOpen(false),
    toggleLeftAside: () => requestLeftAsideOpen(!resolvedLeftAsideOpen.value),
    closeRightAside: () => requestRightAsideOpen(false),
    openRightAside: (panel?: ChatRightAsidePanelId) => {
      if (panel !== undefined && !setRightAsidePanel(panel)) return
      if (resolvedRightAsidePanel.value === undefined) return
      requestRightAsideOpen(true)
    },
    setRightAsidePanel,
    handleLeftAsideOpenChange: (payload: { open: boolean }) => requestLeftAsideOpen(payload.open),
    handleRightAsideOpenChange: (payload: { open: boolean }) => requestRightAsideOpen(payload.open),
  }
}
