import { StrictMode, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import type { ChatRenderer } from '@opentiny/tiny-robot-chat/experimental'

/** 将一个 React 视图交给 Renderer，signal 结束时由 React 释放视图。 */
export function fromReact<T>(render: (context: T) => ReactNode): ChatRenderer<T> {
  return (context, { signal }) => {
    const container = document.createElement('div')
    container.style.display = 'contents'
    const root = createRoot(container)
    let disposed = false
    const dispose = () => {
      if (disposed) return
      disposed = true
      // 在当前渲染完成后卸载，避免在嵌套渲染期间同步释放 root。
      queueMicrotask(() => root.unmount())
    }
    signal.addEventListener('abort', dispose, { once: true })
    const update = () => {
      if (!disposed) root.render(<StrictMode>{render(context)}</StrictMode>)
    }
    try {
      update()
      return container
    } catch (error) {
      dispose()
      throw error
    }
  }
}
