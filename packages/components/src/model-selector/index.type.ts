import type { Placement } from '@floating-ui/dom'
import type { Component, VNode } from 'vue'

export type ModelSelectorVariant = 'outline' | 'ghost' | 'muted'
export type ModelSelectorSize = 'small' | 'normal' | 'large'
export type ModelSelectorPanelClass = string | readonly string[] | Record<string, boolean>

export type ModelSelectorFeatureValue = boolean | string
export type ModelSelectorFeatureValues = Readonly<Partial<Record<string, ModelSelectorFeatureValue>>>

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
      options: readonly {
        value: string
        label: string
        disabled?: boolean
      }[]
    })

export interface ModelSelectorSnapshot {
  modelId: string | null
  featureValues: ModelSelectorFeatureValues
}

export interface ModelSelectorOption {
  id: string
  label: string
  description?: string
  icon?: Component | string
  disabled?: boolean
  group?: string
  features?: readonly ModelSelectorField[]
}

export type ModelSelectorFilterMethod = (query: string, option: ModelSelectorOption) => boolean

export interface ModelSelectorTriggerTextContext {
  model: ModelSelectorOption
  featureValues: ModelSelectorFeatureValues
}

export interface ModelSelectorProps {
  models?: readonly ModelSelectorOption[]
  modelValue?: string | null
  defaultValue?: string | null
  featureValues?: ModelSelectorFeatureValues
  defaultFeatureValues?: ModelSelectorFeatureValues
  renderTriggerText?: (context: ModelSelectorTriggerTextContext) => string
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
  featureValues: ModelSelectorFeatureValues
  text: string
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
  (event: 'change', current: ModelSelectorSnapshot, previous: ModelSelectorSnapshot): void
  (event: 'update:open', open: boolean): void
}
