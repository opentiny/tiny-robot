import { App } from 'vue'
import FlowLayoutButtons from './index.vue'

FlowLayoutButtons.name = 'TrFlowLayout'

const install = function <T>(app: App<T>) {
  app.component(FlowLayoutButtons.name!, FlowLayoutButtons)
}

FlowLayoutButtons.install = install

export default FlowLayoutButtons as typeof FlowLayoutButtons & { install: typeof install }
