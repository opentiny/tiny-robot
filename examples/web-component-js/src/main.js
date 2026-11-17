import { defineTrChatElements } from '@opentiny/tiny-robot-chat/experimental'
import '@opentiny/tiny-robot-chat/experimental/web-component.css'
import '../../web-component-shared/style.css'
import { createDemoShell } from '../../web-component-shared/shell.js'
import { mountPropsDemo } from './demos/props.js'
import { mountRuntimeDemo } from './demos/runtime.js'
import { mountMethodsDemo } from './demos/methods.js'
import { mountFloatingDemo } from './demos/floating.js'

import { mountOrdinarySlotsDemo } from './demos/ordinary-slots.js'

import { mountScopedSlotsDemo } from './demos/scoped-slots.js'

const app = document.querySelector('#app')
if (!(app instanceof HTMLElement)) throw new Error('缺少应用挂载点')
defineTrChatElements()
const shell = createDemoShell(app, { host: '原生 JS / Vite' })
/** @type {Record<string, (root: HTMLElement) => () => void>} */
const demos = {
  'scoped-slots': mountScopedSlotsDemo,
  'ordinary-slots': mountOrdinarySlotsDemo,
  props: mountPropsDemo,
  runtime: mountRuntimeDemo,
  floating: mountFloatingDemo,
  methods: mountMethodsDemo,
}
let dispose = () => {}
/** @param {import('../../web-component-shared/catalog.js').Demo} demo */
function showDemo(demo) {
  dispose()
  dispose = demos[demo.id](shell.outlet)
}
showDemo(shell.getCurrentDemo())
const unsubscribe = shell.subscribe(showDemo)
/** @param {PageTransitionEvent} event */
function onPageHide(event) {
  if (event.persisted) return
  window.removeEventListener('pagehide', onPageHide)
  unsubscribe()
  dispose()
  shell.destroy()
}
window.addEventListener('pagehide', onPageHide)
