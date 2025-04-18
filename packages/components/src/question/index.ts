import { App } from 'vue'
import Question from './index.vue'

Question.name = 'TrQuestion'

const install = function <T>(app: App<T>) {
  app.component(Question.name!, Question)
}

Question.install = install

export default Question as typeof Question & { install: typeof install }
