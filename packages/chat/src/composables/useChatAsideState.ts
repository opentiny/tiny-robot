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
  rightAsideOpen?: MaybeRefOrGetter<boolean | undefined>
  defaultRightAsideOpen?: MaybeRefOrGetter<boolean | undefined>
  activeRightAsidePanelId?: MaybeRefOrGetter<ChatRightAsidePanelId | undefined>
  defaultActiveRightAsidePanelId?: MaybeRefOrGetter<ChatRightAsidePanelId | undefined>
  rightAsidePanels?: MaybeRefOrGetter<readonly ChatRightAsidePanelOptions[]>
  isMobileViewport: MaybeRefOrGetter<boolean>
  viewportWidth: MaybeRefOrGetter<number>
  onLeftOpenChange: (payload: ChatAsideOpenChangePayload) => void
  onRightOpenChange: (payload: ChatAsideOpenChangePayload) => void
  onRightAsideOpenUpdate?: (open: boolean) => void
  onRightAsidePanelUpdate?: (panel: ChatRightAsidePanelId | undefined) => void
}

function toSize(value: number | undefined, fallback: number) {
  return typeof value === 'number' ? value : fallback
}

export function useChatAsideState(options: UseChatAsideStateOptions) {
  const leftInitial = toValue(options.leftAside)
  const leftOpen = shallowRef(leftInitial !== false ? (leftInitial?.defaultOpen ?? false) : false)
  const rightOpen = shallowRef(toValue(options.defaultRightAsideOpen) ?? false)
  const rightPanel = shallowRef<ChatRightAsidePanelId | undefined>(undefined)
  const isMobileViewport = computed(() => toValue(options.isMobileViewport))
  const viewportWidth = computed(() => toValue(options.viewportWidth))
  const leftAside = computed(() => toValue(options.leftAside))
  const rightAside = computed(() => toValue(options.rightAside))
  const rightAsidePanels = computed(() => toValue(options.rightAsidePanels) ?? [])
  const controlledRightAsideOpen = computed(() => toValue(options.rightAsideOpen))
  const controlledRightAsidePanel = computed(() => toValue(options.activeRightAsidePanelId))
  const defaultRightAsidePanel = computed(() => toValue(options.defaultActiveRightAsidePanelId))
  const resolvedLeftAsideOpen = computed(() => {
    const layout = leftAside.value
    return layout !== false ? (layout?.open ?? leftOpen.value) : false
  })
  const resolvedRightAsideOpen = computed(() => {
    const layout = rightAside.value
    return layout !== false ? (controlledRightAsideOpen.value ?? rightOpen.value) : false
  })
  const resolvedRightAsidePanel = computed(() =>
    resolveRightAsidePanel(controlledRightAsidePanel.value ?? rightPanel.value),
  )
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
    if (controlledRightAsideOpen.value === undefined) rightOpen.value = open
    options.onRightAsideOpenUpdate?.(open)
    options.onRightOpenChange({ open, source })
  }

  function hasRightAsidePanel(panel: ChatRightAsidePanelId) {
    return rightAsidePanels.value.some((item) => item.id === panel)
  }

  function resolveRightAsidePanel(panel: ChatRightAsidePanelId | undefined) {
    if (panel !== undefined && hasRightAsidePanel(panel)) return panel
    if (defaultRightAsidePanel.value && hasRightAsidePanel(defaultRightAsidePanel.value)) {
      return defaultRightAsidePanel.value
    }
    return rightAsidePanels.value[0]?.id
  }

  function activateRightAsidePanel(panel: ChatRightAsidePanelId) {
    if (!hasRightAsidePanel(panel)) return false
    if (controlledRightAsidePanel.value === undefined) rightPanel.value = panel
    options.onRightAsidePanelUpdate?.(panel)
    return true
  }

  function openRightAside(panel?: ChatRightAsidePanelId) {
    if (panel !== undefined && !activateRightAsidePanel(panel)) return
    if (resolvedRightAsidePanel.value === undefined) return
    requestRightAsideOpen(true)
  }

  function closeRightAside() {
    requestRightAsideOpen(false)
  }

  function toggleRightAside(panel?: ChatRightAsidePanelId) {
    if (panel !== undefined && !hasRightAsidePanel(panel)) return
    if (panel !== undefined && panel !== resolvedRightAsidePanel.value) {
      activateRightAsidePanel(panel)
      requestRightAsideOpen(true)
      return
    }
    requestRightAsideOpen(!resolvedRightAsideOpen.value)
  }

  watch(isMobileViewport, (isMobile) => {
    if (isMobile) {
      requestLeftAsideOpen(false, 'viewport')
      requestRightAsideOpen(false, 'viewport')
    }
  })

  watch(
    [rightAsidePanels, defaultRightAsidePanel, rightPanel, controlledRightAsidePanel],
    () => {
      const resolvedPanel = resolvedRightAsidePanel.value
      if (resolvedPanel === undefined) {
        requestRightAsideOpen(false)
      } else if (controlledRightAsidePanel.value !== undefined) {
        if (controlledRightAsidePanel.value !== resolvedPanel) {
          options.onRightAsidePanelUpdate?.(resolvedPanel)
        }
      } else if (rightPanel.value !== undefined && rightPanel.value !== resolvedPanel) {
        rightPanel.value = resolvedPanel
        options.onRightAsidePanelUpdate?.(resolvedPanel)
      } else if (rightPanel.value === undefined && resolvedPanel !== undefined) {
        rightPanel.value = resolvedPanel
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
    openRightAside,
    closeRightAside,
    toggleRightAside,
    activateRightAsidePanel,
    handleLeftAsideOpenChange: (payload: { open: boolean }) => requestLeftAsideOpen(payload.open),
    handleRightAsideOpenChange: (payload: { open: boolean }) => requestRightAsideOpen(payload.open),
  }
}
