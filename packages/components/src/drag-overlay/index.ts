import { App } from 'vue'
import DragOverlay from './index.vue'

DragOverlay.name = 'TrDragOverlay'

const install = function <T>(app: App<T>) {
  app.component(DragOverlay.name!, DragOverlay)
}

DragOverlay.install = install

export default DragOverlay as typeof DragOverlay & { install: typeof install }
