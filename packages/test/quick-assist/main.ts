import { createQuickAssist } from '../../components/src/vanilla'
import type { AIRequest, QuickAssistEvent, QuickAssistInstance, QuickAssistOptions } from '../../components/src/vanilla'
import '../../components/src/vanilla/quick-assist/style.css'

declare global {
  interface Window {
    qa: QuickAssistInstance
    qaRequests: AIRequest[]
    qaEvents: QuickAssistEvent[]
    resetQuickAssist: (options?: Partial<QuickAssistOptions>) => void
  }
}

document.querySelector('#long')!.textContent = '超长文本'.repeat(100)
window.resetQuickAssist = (options = {}) => {
  window.qa?.destroy()
  window.getSelection()?.removeAllRanges()
  window.qaRequests = []
  window.qaEvents = []
  document.querySelector<HTMLElement>('#chat')!.hidden = true
  window.qa = createQuickAssist({
    include: ['#scope'],
    adapter: {
      submit(request) {
        window.qaRequests.push(request)
        document.querySelector<HTMLElement>('#chat')!.hidden = false
        document.querySelector('#request')!.textContent = JSON.stringify(request, null, 2)
      },
    },
    onEvent: (event) => window.qaEvents.push(event),
    ...options,
  })
}
window.resetQuickAssist()
