/* eslint-disable @typescript-eslint/no-explicit-any */
import { VNode } from 'vue'

export abstract class BubbleContentClassRenderer {
  abstract render(options: { [key: string]: any }): VNode
}
