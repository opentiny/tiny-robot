import { InjectionKey } from 'vue'
import { BubbleMessageGroup, BubbleRendererMessage } from './index.type'

/**
 * Injection key for bubble message group
 * Used to provide/inject message group between BubbleItem and Bubble components
 */
export const BUBBLE_MESSAGE_GROUP_KEY: InjectionKey<BubbleMessageGroup | undefined> = Symbol('bubble-message-group')

/**
 * Injection key for bubble content message
 * Used to provide/inject current message between BubbleContent and renderer components
 */
export const BUBBLE_CONTENT_MESSAGE_KEY: InjectionKey<BubbleRendererMessage> = Symbol('bubble-content-message')
