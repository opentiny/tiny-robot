import { bootstrapApplication } from '@angular/platform-browser'
import { defineTrChatElements } from '@opentiny/tiny-robot-chat/experimental'
import { AppComponent } from './app.component'

bootstrapApplication(AppComponent)
  .then((app) => {
    defineTrChatElements()
    window.addEventListener('pagehide', (event) => {
      if (!event.persisted) app.destroy()
    })
  })
  .catch(console.error)
