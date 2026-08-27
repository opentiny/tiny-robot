import type { Placement } from '@floating-ui/dom'
import type { Component, StyleValue, VNode } from 'vue'

export type ModelSelectorVariant = 'outline' | 'ghost' | 'muted'
export type ModelSelectorSize = 'small' | 'normal' | 'large'
export type ModelSelectorContentClass = string | readonly string[] | Record<string, boolean>

export interface ModelSelectorReasoningEffortOption {
  readonly value: string
  readonly label: string
  readonly disabled?: boolean
}

export type ModelSelectorReasoningEfforts = boolean | readonly ModelSelectorReasoningEffortOption[]

export interface ModelSelectorOption {
  value: string
  label: string
  description?: string
  icon?: Component
  disabled?: boolean
  group?: string
  groupLabel?: string
  keywords?: readonly string[]
  reasoningEfforts?: ModelSelectorReasoningEfforts
}

export type ModelSelectorFilterMethod = (query: string, option: ModelSelectorOption) => boolean

export interface ModelSelectorProps {
  models?: readonly ModelSelectorOption[]
  modelValue?: string | null
  defaultValue?: string | null
  reasoningEffort?: string | null
  defaultReasoningEffort?: string | null
  open?: boolean
  defaultOpen?: boolean
  disabled?: boolean
  searchable?: boolean
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  filterMethod?: ModelSelectorFilterMethod
  variant?: ModelSelectorVariant
  size?: ModelSelectorSize
  placement?: Placement
  offset?: number
  appendTo?: string | HTMLElement
  matchTriggerWidth?: boolean
  contentClass?: ModelSelectorContentClass
  contentStyle?: StyleValue
  ariaLabel?: string
  searchAriaLabel?: string
  listAriaLabel?: string
  reasoningEffortLabel?: string
  reasoningEffortAriaLabel?: string
}

export interface ModelSelectorTriggerSlotProps {
  value: string | null
  option: ModelSelectorOption | null
  label: string
  open: boolean
  disabled: boolean
  /** The effort currently supported by the selected model. Sticky unsupported values resolve to null. */
  reasoningEffort: string | null
  reasoningEffortOption: ModelSelectorReasoningEffortOption | null
}

export interface ModelSelectorItemSlotProps {
  option: ModelSelectorOption
  selected: boolean
  highlighted: boolean
  disabled: boolean
}

export interface ModelSelectorGroupLabelSlotProps {
  group: string
  label: string
  models: readonly ModelSelectorOption[]
}

export interface ModelSelectorEmptySlotProps {
  query: string
}

export interface ModelSelectorPanelSlotProps {
  value: string | null
  option: ModelSelectorOption | null
  query: string
  close: () => void
}

export interface ModelSelectorFooterSlotProps extends ModelSelectorPanelSlotProps {
  reasoningEfforts: readonly ModelSelectorReasoningEffortOption[]
  /** The effort currently supported by the selected model. Sticky unsupported values resolve to null. */
  reasoningEffort: string | null
  reasoningEffortOption: ModelSelectorReasoningEffortOption | null
  setReasoningEffort: (value: string | null) => void
}

export interface ModelSelectorSlots {
  trigger?: (props: ModelSelectorTriggerSlotProps) => VNode | VNode[]
  item?: (props: ModelSelectorItemSlotProps) => VNode | VNode[]
  'group-label'?: (props: ModelSelectorGroupLabelSlotProps) => VNode | VNode[]
  empty?: (props: ModelSelectorEmptySlotProps) => VNode | VNode[]
  'panel-header'?: (props: ModelSelectorPanelSlotProps) => VNode | VNode[]
  footer?: (props: ModelSelectorFooterSlotProps) => VNode | VNode[]
}

export interface ModelSelectorEmits {
  (event: 'update:modelValue', value: string | null): void
  (event: 'change', option: ModelSelectorOption): void
  (event: 'update:reasoningEffort', value: string | null): void
  (event: 'reasoning-effort-change', option: ModelSelectorReasoningEffortOption | null): void
  (event: 'update:open', open: boolean): void
}
