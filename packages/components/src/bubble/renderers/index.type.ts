/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, VNode } from 'vue'
import type { BubbleContentClassRenderer } from './class-renderer'

export type BubbleContentFunctionRenderer = (options: { [key: string]: any }) => VNode

export type BubbleContentRenderer = BubbleContentFunctionRenderer | BubbleContentClassRenderer | Component

export interface BubbleContentItem {
  type: string
  [key: string]: any
}
