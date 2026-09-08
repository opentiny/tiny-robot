import type { App } from 'vue'
import ModelSelector from './index.vue'
import './index.less'

ModelSelector.name = 'TrModelSelector'

const install = function <T>(app: App<T>) {
  app.component(ModelSelector.name!, ModelSelector)
}

ModelSelector.install = install

export * from './index.type'
export default ModelSelector as typeof ModelSelector & { install: typeof install }
