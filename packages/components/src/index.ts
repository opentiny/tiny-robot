import { App } from 'vue'
import Welcome from './welcome'
import Conversations from './conversations'
import BubbleItem from './bubble-item'
import BubbleList from './bubble-list'
import Sender from './sender'

export { Welcome, Conversations, BubbleItem, BubbleList, Sender }
export * from './bubble-list/index.type'

const components = [Welcome, Conversations, BubbleItem, BubbleList, Sender]

export default {
  install<T>(app: App<T>) {
    components.forEach((component) => {
      app.component(component.name!, component)
    })
  },
}
