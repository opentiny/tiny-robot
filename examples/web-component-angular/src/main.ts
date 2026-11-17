import { BubbleContentDemoComponent } from './demos/bubble-content'
import { Component, DestroyRef, inject, signal } from '@angular/core'
import { bootstrapApplication } from '@angular/platform-browser'
import { defineTrChatElements } from '@opentiny/tiny-robot-chat/experimental'
import { createDemoShell } from '../../web-component-shared/shell.js'
import { PropsDemoComponent } from './demos/props'
import { RuntimeDemoComponent } from './demos/runtime'
import { MethodsDemoComponent } from './demos/methods'
import { FloatingDemoComponent } from './demos/floating'

import { OrdinarySlotsDemoComponent } from './demos/ordinary-slots'
import { ScopedSlotsDemoComponent } from './demos/scoped-slots'

const shell = createDemoShell(document.getElementById('app')!, { host: 'Angular 20 / Angular CLI' })
shell.outlet.append(document.createElement('app-root'))

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    BubbleContentDemoComponent,
    OrdinarySlotsDemoComponent,
    ScopedSlotsDemoComponent,
    PropsDemoComponent,
    RuntimeDemoComponent,
    FloatingDemoComponent,
    MethodsDemoComponent,
  ],
  template: `@switch (active().id) {
    @case ('bubble-content') {
      <demo-bubble-content-page />
    }
    @case ('scoped-slots') {
      <demo-scoped-slots-page />
    }
    @case ('ordinary-slots') {
      <demo-ordinary-slots-page />
    }
    @case ('props') {
      <demo-props-page />
    }
    @case ('runtime') {
      <demo-runtime-page />
    }
    @case ('methods') {
      <demo-methods-page />
    }
    @case ('floating') {
      <demo-floating-page />
    }
  }`,
})
class AppComponent {
  readonly active = signal(shell.getCurrentDemo())
  constructor() {
    const unsubscribe = shell.subscribe((demo) => this.active.set(demo))
    inject(DestroyRef).onDestroy(unsubscribe)
  }
}

// Angular 先绑定属性与事件，再升级首屏已有元素。
bootstrapApplication(AppComponent)
  .then((app) => {
    defineTrChatElements()
    function onPageHide(event: PageTransitionEvent) {
      if (event.persisted) return
      window.removeEventListener('pagehide', onPageHide)
      app.destroy()
      shell.destroy()
    }
    window.addEventListener('pagehide', onPageHide)
  })
  .catch(console.error)
