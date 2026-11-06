import type { Placement } from '@floating-ui/dom'
import type { Component, VNode } from 'vue'

export type ModelSelectorVariant = 'outline' | 'ghost' | 'muted'
export type ModelSelectorSize = 'small' | 'normal' | 'large'
export type ModelSelectorPanelClass = string | readonly string[] | Record<string, boolean>

export type ModelSelectorFeatureValue = boolean | string
export type ModelSelectorFeatureValues = Readonly<Record<string, ModelSelectorFeatureValue>>

export interface ModelSelectorFieldBase {
  key: string
  label: string
  disabled?: boolean
}

export type ModelSelectorField =
  | (ModelSelectorFieldBase & { type: 'switch'; defaultValue?: boolean })
  | (ModelSelectorFieldBase & {
      type: 'select'
      defaultValue?: string
      summary?: boolean
      options: readonly {
        value: string
        label: string
        disabled?: boolean
        summary?: boolean
      }[]
    })

export interface ModelSelectorFeatureChange {
  modelId: string
  key: string
  previousValue: ModelSelectorFeatureValue | undefined
  value: ModelSelectorFeatureValue
  values: ModelSelectorFeatureValues
}

export interface ModelSelectorOption {
  value: string
  label: string
  description?: string
  icon?: Component | string
  disabled?: boolean
  group?: string
  fields?: readonly ModelSelectorField[]
}

export type ModelSelectorFilterMethod = (query: string, option: ModelSelectorOption) => boolean

export interface ModelSelectorProps {
  models?: readonly ModelSelectorOption[]
  modelValue?: string | null
  defaultValue?: string | null
  featureValues?: ModelSelectorFeatureValues
  open?: boolean
  defaultOpen?: boolean
  closeOnSelect?: boolean
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
  panelClass?: ModelSelectorPanelClass
}

export interface ModelSelectorTriggerSlotProps {
  option: ModelSelectorOption | null
  label: string
  open: boolean
  values: ModelSelectorFeatureValues
  summary: string
}

export interface ModelSelectorItemSlotProps {
  option: ModelSelectorOption
  selected: boolean
  highlighted: boolean
}

export interface ModelSelectorEmptySlotProps {
  query: string
}

export interface ModelSelectorSlotProps {
  option: ModelSelectorOption | null
  query: string
  close: () => void
}

export interface ModelSelectorFooterSlotProps extends ModelSelectorSlotProps {
  values: ModelSelectorFeatureValues
  setFeatureValue: (key: string, value: ModelSelectorFeatureValue) => void
  disabled: boolean
}

export interface ModelSelectorSlots {
  trigger?: (props: ModelSelectorTriggerSlotProps) => VNode | VNode[]
  item?: (props: ModelSelectorItemSlotProps) => VNode | VNode[]
  empty?: (props: ModelSelectorEmptySlotProps) => VNode | VNode[]
  header?: (props: ModelSelectorSlotProps) => VNode | VNode[]
  footer?: (props: ModelSelectorFooterSlotProps) => VNode | VNode[]
}

export interface ModelSelectorEmits {
  (event: 'update:modelValue', value: string | null): void
  (event: 'change', option: ModelSelectorOption): void
  (event: 'update:featureValues', values: ModelSelectorFeatureValues): void
  (event: 'feature-change', change: ModelSelectorFeatureChange): void
  (event: 'update:open', open: boolean): void
}
