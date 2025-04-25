import { App } from 'vue'
import Suggestion from './index.vue'

Suggestion.name = 'TrSuggestion'

const install = function <T>(app: App<T>) {
  app.component(Suggestion.name!, Suggestion)
}

Suggestion.install = install

export default Suggestion as typeof Suggestion & { install: typeof install }
