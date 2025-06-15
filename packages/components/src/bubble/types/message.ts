import type { Component, VNode } from 'vue'

export interface BubbleMessageProps<T = Record<string, unknown>> {
  type: string
  content?: string
  data?: T
}

export interface BubbleMessageFunctionRenderer<T = Record<string, unknown>> {
  type: string
  renderer: (message: BubbleMessageProps<T>) => VNode
}

export interface BubbleMessageComponentRenderer<T = Record<string, unknown>> {
  type: string
  component: Component<BubbleMessageProps<T>>
}

export type BubbleMessageRenderer<T = Record<string, unknown>> =
  | BubbleMessageFunctionRenderer<T>
  | BubbleMessageComponentRenderer<T>
