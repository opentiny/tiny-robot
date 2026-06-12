import { computed, toValue, type MaybeRefOrGetter, type Slots } from 'vue'
import type { LayoutAsideSlotProps } from '../index.type'
import type { LayoutPanelApi } from '../internal.type'
import { toPx } from '../utils/cssLength'
import { hasRenderableSlot } from '../utils/slots'

interface UseLayoutRenderStateOptions {
  slots: Slots
  left: LayoutPanelApi
  right: LayoutPanelApi
  isResizing: MaybeRefOrGetter<boolean>
}

function createAsideSlotProps(panel: LayoutPanelApi, placement: 'left' | 'right'): LayoutAsideSlotProps {
  return {
    placement,
    mode: panel.layoutMode,
    open: panel.isOpen,
    expandedWidth: panel.width,
    collapsedWidth: panel.collapsedWidth,
    resizable: panel.resizable,
    isRail: panel.isRail,
    isHidden: panel.isHidden,
    canResize: panel.canResize,
    toggle: panel.toggle,
    setOpen: panel.setOpen,
    setExpandedWidth: panel.setWidth,
  }
}

export function useLayoutRenderState({ slots, left, right, isResizing }: UseLayoutRenderStateOptions) {
  const leftAsideSlotProps = computed<LayoutAsideSlotProps>(() => createAsideSlotProps(left, 'left'))
  const rightAsideSlotProps = computed<LayoutAsideSlotProps>(() => createAsideSlotProps(right, 'right'))

  const hasLeftAside = computed(() => hasRenderableSlot(slots['left-aside'], leftAsideSlotProps.value))
  const hasHeader = computed(() => hasRenderableSlot(slots.header))
  const hasFooter = computed(() => hasRenderableSlot(slots.footer))
  const hasRightAside = computed(() => hasRenderableSlot(slots['right-aside'], rightAsideSlotProps.value))

  const layoutStyle = computed<Record<string, string>>(() => {
    const style: Record<string, string> = {}
    const leftDockWidth = toPx(left.width)
    const leftCollapsedWidth = toPx(left.collapsedWidth)
    const rightDockWidth = toPx(right.width)
    const rightCollapsedWidth = toPx(right.collapsedWidth)

    if (leftDockWidth) {
      style['--left-dock-width'] = leftDockWidth
    }

    if (leftCollapsedWidth) {
      style['--left-collapsed-width'] = leftCollapsedWidth
    }

    if (rightDockWidth) {
      style['--right-dock-width'] = rightDockWidth
    }

    if (rightCollapsedWidth) {
      style['--right-collapsed-width'] = rightCollapsedWidth
    }

    return style
  })

  const layoutClass = computed(() => ({
    'tr-layout--left-dock': hasLeftAside.value && left.isDock,
    'tr-layout--left-drawer': hasLeftAside.value && left.isDrawer,
    'tr-layout--left-expanded': hasLeftAside.value && left.isOpen,
    'tr-layout--left-rail': hasLeftAside.value && left.isRail,
    'tr-layout--right-dock': hasRightAside.value && right.isDock,
    'tr-layout--right-drawer': hasRightAside.value && right.isDrawer,
    'tr-layout--right-expanded': hasRightAside.value && right.isOpen,
    'tr-layout--right-rail': hasRightAside.value && right.isRail,
    'tr-layout--resizing': toValue(isResizing),
  }))

  return {
    hasHeader,
    hasFooter,
    hasLeftAside,
    hasRightAside,
    leftAsideSlotProps,
    rightAsideSlotProps,
    layoutStyle,
    layoutClass,
  }
}
