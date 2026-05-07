import type { ChatWorkspaceRegionConfig, ChatWorkspaceRegionWidth } from '@/types'

export function resolveWorkspaceRegionWidth(width: ChatWorkspaceRegionWidth | undefined, side: 'left' | 'right') {
  if (typeof width === 'number') {
    return `${width}px`
  }

  if (width === 'sm') {
    return '220px'
  }

  if (width === 'md') {
    return '248px'
  }

  if (width === 'lg') {
    return '286px'
  }

  return side === 'left' ? '272px' : '420px'
}

export function resolveWorkspaceCollapsedState(
  region: ChatWorkspaceRegionConfig | undefined,
  controlledCollapsed: boolean | undefined,
  uncontrolledCollapsed: boolean,
) {
  if (region?.collapsible === false) {
    return false
  }

  if (controlledCollapsed !== undefined) {
    return controlledCollapsed
  }

  return uncontrolledCollapsed
}
