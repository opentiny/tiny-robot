import type { ChatUIOptions } from '../types'
import { inject, provide, shallowRef, useHost, type InjectionKey, type ShallowRef } from 'vue'

const ownerKey: InjectionKey<() => unknown> = Symbol('element-renderer-owner')
interface InputControl {
  focus(): Promise<boolean>
  blur(): void
}
const focusKey: InjectionKey<ShallowRef<InputControl | undefined>> = Symbol('element-renderer-input')

export function useElementRendererHost(owner: () => unknown = () => undefined) {
  const host = useHost()
  const focus = shallowRef<InputControl | undefined>()
  provide(focusKey, focus)
  provide(ownerKey, () => {
    const current = owner()
    return host ? (Reflect.get(host, 'runtime') ?? current) : current
  })
  return focus
}

export const useElementRendererOwner = () => inject(ownerKey, () => undefined)
export const useElementRendererInput = () => inject(focusKey)

export function elementUIOptions(ui?: Readonly<ChatUIOptions>): Readonly<ChatUIOptions> {
  if (ui?.sender === false) return ui
  return { ...ui, sender: { ...ui?.sender, valueFormat: ui?.sender?.valueFormat ?? 'text' } }
}
