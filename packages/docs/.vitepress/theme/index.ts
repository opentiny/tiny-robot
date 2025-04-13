import DefaultTheme from 'vitepress/theme'
import TinyVue from '@opentiny/vue'
import TinyRobot from '@opentiny/tiny-robot'
import '@opentiny/tiny-robot/dist/style.css'

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    app.use(TinyVue)
    app.use(TinyRobot)
  },
}
