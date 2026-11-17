import { StrictMode, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import type { ChatRenderer } from '@opentiny/tiny-robot-chat/experimental'

/** 将一个 React 视图交给 Renderer，signal 结束时由 React 释放视图。 */
export function fromReact<T>(
  render: (context: T) => ReactNode,
  subscribe?: (context: T, update: () => void) => () => void,
): ChatRenderer<T> {
  return (context, { signal }) => {
    const container = document.createElement('div')
    container.style.display = 'contents'
    const root = createRoot(container)
    let disposed = false
    let unsubscribe = () => {}
    const dispose = () => {
      if (disposed) return
      disposed = true
      unsubscribe()
      // Let the current Vue/React update finish before React flushes root disposal.
      queueMicrotask(() => root.unmount())
    }
    signal.addEventListener('abort', dispose, { once: true })
    const update = () => {
      if (!disposed) root.render(<StrictMode>{render(context)}</StrictMode>)
    }
    try {
      unsubscribe = subscribe?.(context, update) ?? unsubscribe
      update()
      return container
    } catch (error) {
      dispose()
      throw error
    }
  }
}
