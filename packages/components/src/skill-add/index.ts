import type { App } from 'vue'
import SkillAdd from './index.vue'

SkillAdd.name = 'TrSkillAdd'

const install = function <T>(app: App<T>) {
  app.component(SkillAdd.name!, SkillAdd)
}

SkillAdd.install = install

export default SkillAdd as typeof SkillAdd & {
  install: typeof install
}
