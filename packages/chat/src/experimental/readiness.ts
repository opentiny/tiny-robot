import { dispatchExperimentalEvent } from './events'

const readyElements = new WeakSet<HTMLElement>()
const readinessResolvers = new WeakMap<HTMLElement, () => void>()
const readinessPromises = new WeakMap<HTMLElement, Promise<void>>()

export function whenTrChatReady(element: HTMLElement): Promise<void> {
  if (readyElements.has(element)) return Promise.resolve()

  const existing = readinessPromises.get(element)
  if (existing) return existing

  const promise = new Promise<void>((resolve) => readinessResolvers.set(element, resolve))
  readinessPromises.set(element, promise)
  return promise
}

export function signalTrChatReady(element: HTMLElement): void {
  if (readyElements.has(element)) return

  readyElements.add(element)
  dispatchExperimentalEvent(element, 'ready', undefined)
  readinessResolvers.get(element)?.()
  readinessResolvers.delete(element)
}
