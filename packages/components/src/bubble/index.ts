import { App } from 'vue'
import Bubble from './bubble.vue'

Bubble.name = 'TinyBubble'

const install = function (app: App) {
  app.component(Bubble.name!, Bubble)
}

Bubble.install = install

export type Bubble = typeof Bubble & { install: typeof install }

export default Bubble as Bubble
