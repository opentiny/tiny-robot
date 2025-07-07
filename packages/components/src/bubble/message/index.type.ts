/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, VNode } from 'vue'
import type { BubbleMessageClassRenderer } from './class-renderer'

export type BubbleMessageFunctionRenderer = (options: { [key: string]: any }) => VNode

export type BubbleMessageRenderer =
  | BubbleMessageFunctionRenderer
  | BubbleMessageClassRenderer
  | Component
  | { component: Component; defaultProps: Record<string, unknown> }

export interface BubbleMessageProps {
  type: string
  [key: string]: any
}
