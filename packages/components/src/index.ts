import { App } from 'vue'
import Welcome from './welcome'
import Conversations from './conversations'

export { Welcome, Conversations }

const components = [Welcome, Conversations]

export default {
  install<T>(app: App<T>) {
    components.forEach((component) => {
      app.component(component.name!, component)
    })
  },
}
