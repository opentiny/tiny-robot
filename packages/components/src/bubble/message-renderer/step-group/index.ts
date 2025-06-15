import { BubbleMessageComponentRenderer } from '../../types'
import { BubbleStepGroupMessageData } from '../../types'
import StepGroup from './index.vue'

export const BubbleStepGroupMessageRenderer: BubbleMessageComponentRenderer<BubbleStepGroupMessageData> = {
  type: 'step-group',
  component: StepGroup,
}
