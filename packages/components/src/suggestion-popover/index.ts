import { App } from 'vue'
import SuggestionPopover from './index.vue'

SuggestionPopover.name = 'TrSuggestionPopover'

const install = function <T>(app: App<T>) {
  app.component(SuggestionPopover.name!, SuggestionPopover)
}

SuggestionPopover.install = install

export default SuggestionPopover as typeof SuggestionPopover & { install: typeof install }
