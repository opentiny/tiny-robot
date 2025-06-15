import { BubbleMessageProps } from './message'

export type BubbleStepStatus = 'running' | 'success' | 'failed' | 'cancelled'

export interface BubbleTextStepItem {
  type: 'text'
  title: string
  content: string
}

export interface BubbleToolStepItem {
  type: 'tool'
  name: string
  status: BubbleStepStatus
  data?: Record<string, unknown>
}

export type BubbleStepItem = BubbleTextStepItem | BubbleToolStepItem

export type BubbleStepGroupMessageData = {
  title: string
  status: BubbleStepStatus
  steps: BubbleStepItem[]
}

export type BubbleStepGroupMessageProps = Omit<BubbleMessageProps, 'data'> & {
  data: BubbleStepGroupMessageData
}
