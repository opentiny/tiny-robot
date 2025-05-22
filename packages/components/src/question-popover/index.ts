import { App } from 'vue'
import QuestionPopover from './index.vue'

QuestionPopover.name = 'TrQuestionPopover'

const install = function <T>(app: App<T>) {
  app.component(QuestionPopover.name!, QuestionPopover)
}

QuestionPopover.install = install

export default QuestionPopover as typeof QuestionPopover & { install: typeof install }
