import { inject, provide } from 'vue'
import type { SenderContentRegister } from '../../sender/composables/useSenderContentRegistry'

export const SENDER_CONTENT_REGISTRATION_CONTEXT_KEY: unique symbol = Symbol('sender-content-registration-context')

export const useSenderContentRegistration: () => SenderContentRegister | undefined = ():
  SenderContentRegister | undefined => {
  const registerFn = inject<SenderContentRegister | undefined>(SENDER_CONTENT_REGISTRATION_CONTEXT_KEY, undefined)

  return registerFn
}

export const setupSenderContentRegistration: (fn: SenderContentRegister) => void = (fn) => {
  provide(SENDER_CONTENT_REGISTRATION_CONTEXT_KEY, fn)
}
