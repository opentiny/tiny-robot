import { toValue } from 'vue'
import type { LayoutPlacement } from '../index.type'
import type { LayoutContext, LayoutPanelApi, LayoutPanelState } from '../internal.type'
import { getDefaultAsideMaxWidth, getDefaultAsideMinWidth } from '../utils/asideDefaults'

function createDefaultPanelState(placement: LayoutPlacement): LayoutPanelState {
  const minWidth = getDefaultAsideMinWidth(placement)
  const maxWidth = getDefaultAsideMaxWidth(placement)

  return {
    placement,
    layoutMode: 'dock',
    isOpen: false,
    width: undefined,
    collapsedWidth: undefined,
    collapseEffect: 'overlay',
    minWidth,
    maxWidth,
    resizable: false,
    setOpen: () => {},
    setWidth: () => {},
  }
}

const DEFAULT_PANEL_STATE = {
  left: createDefaultPanelState('left'),
  right: createDefaultPanelState('right'),
} as const

export function createLayoutContext(leftState?: LayoutPanelState, rightState?: LayoutPanelState): LayoutContext {
  const panels = {} as Record<LayoutPlacement, LayoutPanelApi>

  function getSiblingPanel(placement: LayoutPlacement): LayoutPanelApi {
    return panels[placement === 'left' ? 'right' : 'left']
  }

  function isVisibleDrawer(panel: LayoutPanelApi): boolean {
    return panel.isDrawer && panel.isOpen
  }

  function createPanelApi(placement: LayoutPlacement, panelState: LayoutPanelState | undefined): LayoutPanelApi {
    const source = panelState ?? DEFAULT_PANEL_STATE[placement]
    const isRegistered = panelState !== undefined
    const defaultMinWidth = getDefaultAsideMinWidth(placement)
    const defaultMaxWidth = getDefaultAsideMaxWidth(placement)

    function getLayoutMode(): LayoutPanelApi['layoutMode'] {
      return toValue(source.layoutMode)
    }

    function getIsOpen(): boolean {
      return toValue(source.isOpen)
    }

    function getWidth(): number | undefined {
      return toValue(source.width)
    }

    function getCollapsedWidth(): number | undefined {
      return toValue(source.collapsedWidth)
    }

    function getCollapseEffect(): LayoutPanelApi['collapseEffect'] {
      return toValue(source.collapseEffect)
    }

    function getMinWidth(): number {
      return toValue(source.minWidth) ?? defaultMinWidth
    }

    function getMaxWidth(): number {
      return toValue(source.maxWidth) ?? defaultMaxWidth
    }

    function getResizable(): boolean {
      return toValue(source.resizable)
    }

    function getIsDock(): boolean {
      return getLayoutMode() === 'dock'
    }

    function getIsDrawer(): boolean {
      return getLayoutMode() === 'drawer'
    }

    function getIsRail(): boolean {
      return getIsDock() && !getIsOpen() && (getCollapsedWidth() ?? 0) > 0
    }

    function getIsHidden(): boolean {
      return !getIsOpen() && (getIsDrawer() || !getIsRail())
    }

    function getCanResize(): boolean {
      return getIsDock() && getIsOpen() && getResizable()
    }

    function open(): void {
      if (!isRegistered) {
        return
      }

      if (getIsDrawer()) {
        const sibling = getSiblingPanel(placement)
        if (sibling.isDrawer && sibling.isOpen) {
          sibling.close()
        }
      }

      source.setOpen(true)
    }

    function close(): void {
      if (!isRegistered) {
        return
      }

      source.setOpen(false)
    }

    function setOpen(nextOpen: boolean): void {
      if (nextOpen) {
        open()
        return
      }

      close()
    }

    function toggle(): void {
      if (toValue(source.isOpen)) {
        close()
        return
      }

      open()
    }

    function setWidth(nextWidth: number): void {
      if (!isRegistered) {
        return
      }

      source.setWidth(nextWidth)
    }

    return {
      get placement() {
        return placement
      },
      get isRegistered() {
        return isRegistered
      },
      get layoutMode() {
        return getLayoutMode()
      },
      get isOpen() {
        return getIsOpen()
      },
      get isDock() {
        return getIsDock()
      },
      get isDrawer() {
        return getIsDrawer()
      },
      get isRail() {
        return getIsRail()
      },
      get isHidden() {
        return getIsHidden()
      },
      get canResize() {
        return getCanResize()
      },
      get width() {
        return getWidth()
      },
      get collapsedWidth() {
        return getCollapsedWidth()
      },
      get collapseEffect() {
        return getCollapseEffect()
      },
      get minWidth() {
        return getMinWidth()
      },
      get maxWidth() {
        return getMaxWidth()
      },
      get resizable() {
        return getResizable()
      },
      open,
      close,
      toggle,
      setOpen,
      setWidth,
    }
  }

  panels.left = createPanelApi('left', leftState)
  panels.right = createPanelApi('right', rightState)

  function closeDrawers(): void {
    if (isVisibleDrawer(panels.left)) {
      panels.left.close()
    }

    if (isVisibleDrawer(panels.right)) {
      panels.right.close()
    }
  }

  return {
    left: panels.left,
    right: panels.right,
    get isDrawerVisible() {
      return isVisibleDrawer(panels.left) || isVisibleDrawer(panels.right)
    },
    closeDrawers,
  }
}
