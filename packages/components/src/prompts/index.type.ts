import { VNode } from 'vue'

export interface PromptProps {
  label: string
  description: string
  icon?: VNode
  disabled?: false
  badge?: string
}
