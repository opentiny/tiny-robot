import { createApp } from 'vue'
import Notification from '../components/Notification.vue'

export interface NotifyOptions {
  message: string
  duration?: number
}

/**
 * Programmatically show a top-centered notification.
 * This creates a one-off Vue app instance and unmounts it after closing.
 */
export function notify(options: NotifyOptions | string) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return

  const props: NotifyOptions =
    typeof options === 'string'
      ? { message: options }
      : {
          message: options.message,
          duration: options.duration,
        }

  const container = document.createElement('div')
  document.body.appendChild(container)

  const app = createApp(Notification, {
    ...props,
    onClose: () => {
      app.unmount()
      if (container.parentNode) {
        container.parentNode.removeChild(container)
      }
    },
  })

  app.mount(container)
}
