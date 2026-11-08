import type { App } from 'vue'
import SkillExtensionDetail from './index.vue'

SkillExtensionDetail.name = 'TrSkillExtensionDetail'

const install = function <T>(app: App<T>) {
  app.component(SkillExtensionDetail.name!, SkillExtensionDetail)
}

SkillExtensionDetail.install = install

export default SkillExtensionDetail as typeof SkillExtensionDetail & {
  install: typeof install
}
