import { BUBBLE_CONTENT_MESSAGE_KEY } from '../constants'
import { inject } from 'vue'

export const useBubbleContentMessage = () => {
  return inject(BUBBLE_CONTENT_MESSAGE_KEY)
}
