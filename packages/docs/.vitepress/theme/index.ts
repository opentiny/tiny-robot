import DefaultTheme from 'vitepress/theme'
import TinyVue from '@opentiny/vue'
import TinyRobot from '@opentiny/tiny-robot'

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    app.use(TinyVue)
    app.use(TinyRobot)
    // app.use(Conversations)
    // app.component(Conversations.name, Conversations)
  },
}
