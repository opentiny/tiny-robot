import { VNode } from 'vue'

export interface WelcomeProps {
  title: string
  description: string
  align?: 'left' | 'center' | 'right' | string
  icon?: VNode
}
