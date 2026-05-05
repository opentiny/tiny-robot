import type { PropType } from 'vue'

// Preserve tri-state semantics for boolean props so leaf components can
// distinguish "unset" from an explicit false when falling back to scaffold defaults.
export const triStateBooleanProp = {
  type: Boolean as PropType<boolean | undefined>,
  default: undefined,
} as const
