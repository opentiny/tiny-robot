import type { LayoutPlacement } from '../index.type'

const DEFAULT_ASIDE_OPEN = {
  left: true,
  right: false,
} as const

const DEFAULT_ASIDE_MIN_WIDTH = {
  left: 200,
  right: 240,
} as const

const DEFAULT_ASIDE_MAX_WIDTH = {
  left: 560,
  right: 640,
} as const

export function getDefaultAsideOpen(placement: LayoutPlacement): boolean {
  return DEFAULT_ASIDE_OPEN[placement]
}

export function getDefaultAsideMinWidth(placement: LayoutPlacement): number {
  return DEFAULT_ASIDE_MIN_WIDTH[placement]
}

export function getDefaultAsideMaxWidth(placement: LayoutPlacement): number {
  return DEFAULT_ASIDE_MAX_WIDTH[placement]
}
