import type { ApplicationRef, NgZone, TemplateRef } from '@angular/core'
import type { ChatRenderer } from '@opentiny/tiny-robot-chat/experimental'

/** 保留 Angular 模板的绑定、事件和视图生命周期。 */
export function fromTemplate<T>(
  template: TemplateRef<{ $implicit: T }>,
  owner: { application: ApplicationRef; zone: NgZone },
  subscribe?: (context: T, update: () => void) => () => void,
): ChatRenderer<T> {
  return (context, { signal }) => {
    const view = owner.zone.run(() => template.createEmbeddedView({ $implicit: context }))
    const container = document.createElement('div')
    container.style.display = 'contents'
    let attached = false
    let disposed = false
    let unsubscribe = () => {}
    const dispose = () => {
      if (disposed) return
      disposed = true
      unsubscribe()
      owner.zone.run(() => {
        if (view.destroyed) return
        if (attached) owner.application.detachView(view)
        view.destroy()
      })
    }
    signal.addEventListener('abort', dispose, { once: true })
    const update = () => {
      if (!disposed && !view.destroyed) owner.zone.run(() => view.detectChanges())
    }
    try {
      owner.application.attachView(view)
      attached = true
      update()
      container.append(...view.rootNodes)
      unsubscribe = subscribe?.(context, update) ?? unsubscribe
      return container
    } catch (error) {
      dispose()
      throw error
    }
  }
}
