import DefaultTheme from 'vitepress/theme'
import TinyRobot from '@opentiny/tiny-robot'

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    app.use(TinyRobot)
    // app.use(Conversations)
    // app.component(Conversations.name, Conversations)
  },
}
