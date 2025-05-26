import { App } from 'vue'
import SuggestionPills from './index.vue'

SuggestionPills.name = 'TrSuggestionPills'

const install = function <T>(app: App<T>) {
  app.component(SuggestionPills.name!, SuggestionPills)
}

SuggestionPills.install = install

export default SuggestionPills as typeof SuggestionPills & { install: typeof install }
