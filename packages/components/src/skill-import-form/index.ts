import type { App } from 'vue'
import SkillImportForm from './index.vue'

SkillImportForm.name = 'TrSkillImportForm'

const install = function <T>(app: App<T>) {
  app.component(SkillImportForm.name!, SkillImportForm)
}

SkillImportForm.install = install

export default SkillImportForm as typeof SkillImportForm & {
  install: typeof install
}
