import { App } from 'vue'
import DragUploadWrapper from './index.vue'

DragUploadWrapper.name = 'TrDragUploadWrapper'

const install = function <T>(app: App<T>) {
  app.component(DragUploadWrapper.name!, DragUploadWrapper)
}

DragUploadWrapper.install = install

export default DragUploadWrapper as typeof DragUploadWrapper & { install: typeof install }
