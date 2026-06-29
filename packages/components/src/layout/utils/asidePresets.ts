import type { LayoutSide } from '../index.type'

const ASIDE_PRESETS = {
  left: {
    open: true,
    minWidth: 200,
    expandedWidth: 300,
    maxWidth: 560,
  },
  right: {
    open: false,
    minWidth: 240,
    expandedWidth: 320,
    maxWidth: 640,
  },
} as const

export function getDefaultAsideOpen(side: LayoutSide): boolean {
  return ASIDE_PRESETS[side].open
}

export function getDefaultAsideMinWidth(side: LayoutSide): number {
  return ASIDE_PRESETS[side].minWidth
}

export function getDefaultAsideExpandedWidth(side: LayoutSide): number {
  return ASIDE_PRESETS[side].expandedWidth
}

export function getDefaultAsideMaxWidth(side: LayoutSide): number {
  return ASIDE_PRESETS[side].maxWidth
}
