import { App } from 'vue'
import ActionGroup from './index.vue'
import ActionGroupItemComp from './item.vue'

ActionGroup.name = 'TrActionGroup'

const install = function <T>(app: App<T>) {
  app.component(ActionGroup.name!, ActionGroup)
}

ActionGroup.install = install

export default ActionGroup as typeof ActionGroup & { install: typeof install }

ActionGroupItemComp.name = 'TrActionGroupItem'

const installActionGroupItem = function <T>(app: App<T>) {
  app.component(ActionGroupItemComp.name!, ActionGroupItemComp)
}

ActionGroupItemComp.install = installActionGroupItem

export const ActionGroupItem = ActionGroupItemComp as typeof ActionGroupItemComp & {
  install: typeof installActionGroupItem
}
