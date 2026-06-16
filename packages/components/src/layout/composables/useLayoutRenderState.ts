import { computed, toValue, useSlots, type MaybeRefOrGetter } from 'vue'
import type { LayoutAsideSlotProps } from '../index.type'
import type { LayoutContext, LayoutPanelContext } from '../internal.type'
import { toPx } from '../utils/cssLength'
import { hasRenderableSlot } from '../utils/slots'

interface UseLayoutRenderStateOptions {
  context: LayoutContext
  isResizing: MaybeRefOrGetter<boolean>
}

function createAsideSlotProps(panel: LayoutPanelContext, placement: 'left' | 'right'): LayoutAsideSlotProps {
  return {
    placement,
    mode: panel.state.layoutMode.value,
    open: panel.state.isOpen.value,
    expandedWidth: panel.state.width.value,
    collapsedWidth: panel.state.collapsedWidth.value,
    resizable: panel.state.resizable.value,
    isRail: panel.state.isRail.value,
    isHidden: panel.state.isHidden.value,
    canResize: panel.state.canResize.value,
    toggle: panel.actions.toggle,
    setOpen: panel.actions.setOpen,
    setExpandedWidth: panel.actions.setWidth,
  }
}

export function useLayoutRenderState({ context, isResizing }: UseLayoutRenderStateOptions) {
  const slots = useSlots()
  const { left, right } = context

  const leftAsideSlotProps = computed<LayoutAsideSlotProps>(() => createAsideSlotProps(left, 'left'))
  const rightAsideSlotProps = computed<LayoutAsideSlotProps>(() => createAsideSlotProps(right, 'right'))

  const hasLeftAside = computed(() => hasRenderableSlot(slots['left-aside'], leftAsideSlotProps.value))
  const hasHeader = computed(() => hasRenderableSlot(slots.header))
  const hasFooter = computed(() => hasRenderableSlot(slots.footer))
  const hasRightAside = computed(() => hasRenderableSlot(slots['right-aside'], rightAsideSlotProps.value))

  const layoutStyle = computed<Record<string, string>>(() => {
    const style: Record<string, string> = {}
    const leftDockWidth = toPx(left.state.width.value)
    const leftCollapsedWidth = toPx(left.state.collapsedWidth.value)
    const rightDockWidth = toPx(right.state.width.value)
    const rightCollapsedWidth = toPx(right.state.collapsedWidth.value)

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
    'tr-layout--left-dock': hasLeftAside.value && left.state.isDock.value,
    'tr-layout--left-drawer': hasLeftAside.value && left.state.isDrawer.value,
    'tr-layout--left-expanded': hasLeftAside.value && left.state.isOpen.value,
    'tr-layout--left-rail': hasLeftAside.value && left.state.isRail.value,
    'tr-layout--right-dock': hasRightAside.value && right.state.isDock.value,
    'tr-layout--right-drawer': hasRightAside.value && right.state.isDrawer.value,
    'tr-layout--right-expanded': hasRightAside.value && right.state.isOpen.value,
    'tr-layout--right-rail': hasRightAside.value && right.state.isRail.value,
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
