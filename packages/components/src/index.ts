import { App } from 'vue'
import Welcome from './welcome'
import Container from './container'
import Conversations from './conversations'
import BubbleItem from './bubble-item'
import BubbleList from './bubble-list'
import Sender from './sender'

export * from './bubble-list/index.type'

const components = [Welcome, Container, Conversations, BubbleItem, BubbleList, Sender]

export default {
  install<T>(app: App<T>) {
    components.forEach((component) => {
      const name = component.name!.replace(/^Tiny/, '').replace(/^Tr/, '')
      app.component(name, component)
    })
  },
}

export { Welcome, Container, Conversations, BubbleItem, BubbleList, Sender }
