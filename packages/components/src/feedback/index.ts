import { App } from 'vue'
import Feedback from './index.vue'

Feedback.name = 'TrFeedback'

const install = function <T>(app: App<T>) {
  app.component(Feedback.name!, Feedback)
}

Feedback.install = install

export default Feedback as typeof Feedback & { install: typeof install }
