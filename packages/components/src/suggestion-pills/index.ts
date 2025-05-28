import { App } from 'vue'
import { PillButton } from './components'
import SuggestionPills from './index.vue'

SuggestionPills.name = 'TrSuggestionPills'

const install = function <T>(app: App<T>) {
  app.component(SuggestionPills.name!, SuggestionPills)
}

SuggestionPills.install = install

export default SuggestionPills as typeof SuggestionPills & { install: typeof install }

PillButton.name = 'TrSuggestionPillButton'

const installPillButton = function <T>(app: App<T>) {
  app.component(PillButton.name!, PillButton)
}

PillButton.install = installPillButton

const SuggestionPillButton = PillButton as typeof PillButton & { install: typeof installPillButton }

export { SuggestionPillButton }
