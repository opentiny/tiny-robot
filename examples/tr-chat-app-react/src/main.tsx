import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { defineTrChatElements } from '@opentiny/tiny-robot-chat/experimental'
import '@opentiny/tiny-robot-chat/experimental/web-component.css'
import './style.css'
import { App } from './app'
defineTrChatElements()
const root = createRoot(document.getElementById('app')!)
root.render(
  <StrictMode>
    <App />
  </StrictMode>,
)
window.addEventListener('pagehide', (event) => {
  if (!event.persisted) root.unmount()
})
