import { InjectionKey } from 'vue'
import { BubbleMessageGroup } from './index.type'

/**
 * Injection key for bubble message group
 * Used to provide/inject message group between BubbleItem and Bubble components
 */
export const BUBBLE_MESSAGE_GROUP_KEY: InjectionKey<BubbleMessageGroup | undefined> = Symbol('bubble-message-group')
