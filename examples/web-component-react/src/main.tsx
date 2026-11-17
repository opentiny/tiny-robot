import { StrictMode, useSyncExternalStore } from 'react'
import { createRoot } from 'react-dom/client'
import { defineTrChatElements } from '@opentiny/tiny-robot-chat/experimental'
import '@opentiny/tiny-robot-chat/experimental/web-component.css'
import '../../web-component-shared/style.css'
import { createDemoShell } from '../../web-component-shared/shell.js'
import { PropsDemo } from './demos/props'
import { RuntimeDemo } from './demos/runtime'
import { MethodsDemo } from './demos/methods'
import { FloatingDemo } from './demos/floating'

import { OrdinarySlotsDemo } from './demos/ordinary-slots'

import { ScopedSlotsDemo } from './demos/scoped-slots'

const shell = createDemoShell(document.getElementById('app')!, { host: 'React 19 / Vite' })
const demos = {
  'scoped-slots': ScopedSlotsDemo,
  'ordinary-slots': OrdinarySlotsDemo,
  props: PropsDemo,
  runtime: RuntimeDemo,
  floating: FloatingDemo,
  methods: MethodsDemo,
}
function App() {
  const demo = useSyncExternalStore(shell.subscribe, shell.getCurrentDemo)
  const Page = demos[demo.id as keyof typeof demos]
  return <Page key={demo.id} />
}
defineTrChatElements()
const app = createRoot(shell.outlet)
app.render(
  <StrictMode>
    <App />
  </StrictMode>,
)
function onPageHide(event: PageTransitionEvent) {
  if (event.persisted) return
  window.removeEventListener('pagehide', onPageHide)
  app.unmount()
  shell.destroy()
}
window.addEventListener('pagehide', onPageHide)
