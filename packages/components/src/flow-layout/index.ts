import { App } from 'vue'
import FlowLayout from './index.vue'

FlowLayout.name = 'TrFlowLayout'

const install = function <T>(app: App<T>) {
  app.component(FlowLayout.name!, FlowLayout)
}

FlowLayout.install = install

export default FlowLayout as typeof FlowLayout & { install: typeof install }
