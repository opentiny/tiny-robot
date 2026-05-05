import type { ChatAppearanceConfig } from './core'

export type ChatShellVariant = 'stacked' | 'workspace'

export type ChatWorkspaceRegionWidth = 'sm' | 'md' | 'lg' | number

export type ChatWorkspaceRegionCollapseMode = 'rail' | 'hidden'

export interface ChatWorkspaceRegionConfig {
  enabled?: boolean
  collapsible?: boolean
  defaultOpen?: boolean
  collapseMode?: ChatWorkspaceRegionCollapseMode
  width?: ChatWorkspaceRegionWidth
  railLabel?: string
}

export interface ChatWorkspaceViewStateConfig {
  fullWidth?: boolean
}

export interface ChatWorkspaceShellConfig {
  variant?: ChatShellVariant
  leftRegion?: ChatWorkspaceRegionConfig
  rightRegion?: ChatWorkspaceRegionConfig
  viewState?: ChatWorkspaceViewStateConfig
}

export interface TrChatWorkspaceShellProps extends Omit<ChatWorkspaceShellConfig, 'variant'> {
  appearance?: ChatAppearanceConfig
  badge?: string
  title?: string
  description?: string
  leftCollapsed?: boolean
  rightCollapsed?: boolean
  leftRailLabel?: string
  rightRailLabel?: string
}
