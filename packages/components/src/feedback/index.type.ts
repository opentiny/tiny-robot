import { VNode } from 'vue'

export interface FeedbackProps {
  operations?: {
    name: string
    label: string
  }[]
  sources?: {
    label: string
    link: string
  }[]
  defaultSourceLines?: number
  actions?: {
    name: string
    label: string
    icon: 'copy' | 'refresh' | 'like' | 'dislike' | VNode
    onClick?: () => void
  }[]
}

export interface FeedbackEvents {
  (e: 'operation', name: string): void
  (e: 'action', name: string): void
}
